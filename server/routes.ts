import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertListingSchema, insertBidSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Listings
  app.get("/api/listings", async (req, res) => {
    const listings = await storage.getListings();
    res.json(listings);
  });

  app.get("/api/listings/category/:category", async (req, res) => {
    const listings = await storage.getListingsByCategory(req.params.category);
    res.json(listings);
  });

  app.post("/api/listings", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const result = insertListingSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json(result.error);
    }

    const listing = await storage.createListing({
      ...result.data,
      userId: req.user.id,
    });
    res.status(201).json(listing);
  });

  // Bids
  app.post("/api/listings/:listingId/bids", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (!req.user.isRepairman) return res.status(403).send("Only repairmen can bid");

    const result = insertBidSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json(result.error);
    }

    const listingId = parseInt(req.params.listingId);
    const listing = await storage.getListing(listingId);
    if (!listing) return res.status(404).send("Listing not found");

    const bid = await storage.createBid({
      ...result.data,
      listingId,
      repairmanId: req.user.id,
    });
    res.status(201).json(bid);
  });

  app.get("/api/listings/:listingId/bids", async (req, res) => {
    const listingId = parseInt(req.params.listingId);
    const bids = await storage.getBidsForListing(listingId);
    res.json(bids);
  });

  const httpServer = createServer(app);
  return httpServer;
}
