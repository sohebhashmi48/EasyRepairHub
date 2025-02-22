import { z } from "zod";

// User type definition
export type User = {
  id: number;
  username: string;
  password: string;
  isRepairman: boolean;
};

// Listing type
export type Listing = {
  id: number;
  userId: number;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  status: string;
  budget?: number;
  createdAt: string;
};

// Bid type
export type Bid = {
  id: number;
  listingId: number;
  repairmanId: number;
  amount: number;
  comment?: string;
  status?: string;
  createdAt: string;
};

// Validation schemas for data insertion
export const insertUserSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  isRepairman: z.boolean().default(false),
});

// Modified to make imageUrl optional during form handling
export const insertListingSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  imageUrl: z.string().url("Must be a valid URL").optional(),
  budget: z.number().min(1, "Budget must be greater than 0").optional(),
});

// Schema for final submission
export const finalListingSchema = insertListingSchema.extend({
  imageUrl: z.string().url("Must be a valid URL"),
});

export const insertBidSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  comment: z.string().optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertListing = z.infer<typeof insertListingSchema>;
export type InsertBid = z.infer<typeof insertBidSchema>;

// Chat Message type
export type ChatMessage = {
  id: number;
  listingId: number;
  senderId: number;
  message: string;
  createdAt: string;
};

// Chat message validation schema
export const insertChatMessageSchema = z.object({
  message: z.string().min(1, "Message cannot be empty"),
});

export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;