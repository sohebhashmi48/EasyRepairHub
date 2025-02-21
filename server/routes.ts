import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertListingSchema, insertBidSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import { z } from "zod";
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure multer for handling file uploads
const multerStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'public/uploads/'))
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
});

const upload = multer({ 
  storage: multerStorage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG and GIF are allowed.'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Image upload endpoint
  app.post("/api/upload", upload.single('image'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ imageUrl });
  });

  // Serve uploaded files
  app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

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