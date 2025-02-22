import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from 'ws';
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertListingSchema, insertBidSchema, insertChatMessageSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import { z } from "zod";
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'public', 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });
console.log('Uploads directory created/verified at:', uploadsDir);

// Configure multer for handling file uploads
const multerStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
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

  // Serve uploaded files
  app.use('/uploads', express.static(uploadsDir));
  console.log('Serving uploads from:', uploadsDir);

  // Image upload endpoint
  app.post("/api/upload", upload.single('image'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const imageUrl = `/uploads/${req.file.filename}`;
    console.log('File uploaded successfully:', imageUrl);
    res.json({ imageUrl });
  });

  // Listings
  app.get("/api/listings", async (req, res) => {
    const listings = await storage.getListings();
    res.json(listings);
  });

  app.get("/api/listings/category/:category", async (req, res) => {
    console.log('Fetching listings for category:', req.params.category);
    try {
      const listings = await storage.getListingsByCategory(req.params.category);
      console.log('Found listings:', listings.length);
      console.log('Listings:', JSON.stringify(listings, null, 2));
      res.json(listings);
    } catch (error) {
      console.error('Error fetching category listings:', error);
      res.status(500).json({ message: "Failed to fetch listings" });
    }
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

  // Update the delete endpoint with better error handling
  app.delete("/api/listings/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      console.log('Unauthorized delete attempt');
      return res.status(401).json({ message: "Unauthorized" });
    }

    const listingId = parseInt(req.params.id);
    if (isNaN(listingId)) {
      console.log('Invalid listing ID:', req.params.id);
      return res.status(400).json({ message: "Invalid listing ID" });
    }

    try {
      const listing = await storage.getListing(listingId);
      if (!listing) {
        console.log('Listing not found:', listingId);
        return res.status(404).json({ message: "Listing not found" });
      }

      if (listing.userId !== req.user.id) {
        console.log('Unauthorized delete - User:', req.user.id, 'Listing owner:', listing.userId);
        return res.status(403).json({ message: "Not authorized to delete this listing" });
      }

      await storage.deleteListing(listingId);
      console.log('Listing deleted successfully:', listingId);
      res.status(200).json({ message: "Listing deleted successfully" });
    } catch (error) {
      console.error('Error deleting listing:', error);
      res.status(500).json({ message: "Failed to delete listing" });
    }
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

  app.post("/api/listings/:listingId/accept-bid/:bidId", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const listingId = parseInt(req.params.listingId);
    const bidId = parseInt(req.params.bidId);

    try {
      const listing = await storage.getListing(listingId);
      if (!listing) {
        return res.status(404).json({ message: "Listing not found" });
      }

      if (listing.userId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to accept bids for this listing" });
      }

      await storage.acceptBid(listingId, bidId);
      res.json({ message: "Bid accepted successfully" });
    } catch (error) {
      console.error('Error accepting bid:', error);
      res.status(500).json({ message: "Failed to accept bid" });
    }
  });

  // Add this endpoint after the existing chat-related code
  app.get("/api/listings/:listingId/messages", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const listingId = parseInt(req.params.listingId);
    if (isNaN(listingId)) {
      return res.status(400).json({ message: "Invalid listing ID" });
    }

    try {
      const messages = await storage.getChatMessages(listingId);
      res.json(messages);
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      res.status(500).json({ message: "Failed to fetch chat messages" });
    }
  });


  const httpServer = createServer(app);

  // WebSocket setup
  const wss = new WebSocketServer({ 
    server: httpServer,
    path: '/ws'
  });

  // Store active connections
  const connections = new Map<number, WebSocket>();

  wss.on('connection', (ws: WebSocket) => {
    console.log('New WebSocket connection');

    ws.on('message', async (data: string) => {
      try {
        const message = JSON.parse(data);

        // Validate the message format
        if (!message.type || !message.data) {
          throw new Error('Invalid message format');
        }

        switch (message.type) {
          case 'auth':
            // Store the connection with the user ID
            connections.set(message.data.userId, ws);
            break;

          case 'chat':
            const validatedMessage = insertChatMessageSchema.parse(message.data);
            const { listingId, recipientId } = message.data;

            // Store the message
            const savedMessage = await storage.createChatMessage({
              ...validatedMessage,
              listingId,
              senderId: message.data.senderId,
            });

            // Send to recipient if online
            const recipientWs = connections.get(recipientId);
            if (recipientWs && recipientWs.readyState === WebSocket.OPEN) {
              recipientWs.send(JSON.stringify({
                type: 'chat',
                data: savedMessage
              }));
            }
            break;
        }
      } catch (error) {
        console.error('WebSocket error:', error);
        ws.send(JSON.stringify({
          type: 'error',
          message: error instanceof Error ? error.message : 'Unknown error'
        }));
      }
    });

    ws.on('close', () => {
      // Remove connection when closed
      connections.forEach((socket, userId) => {
        if (socket === ws) {
          connections.delete(userId);
        }
      });
    });
  });

  return httpServer;
}