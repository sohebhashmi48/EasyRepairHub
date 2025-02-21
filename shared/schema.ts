import { z } from "zod";

// These type definitions will match our Supabase table structure
export type User = {
  id: number;
  username: string;
  password: string;
  isRepairman: boolean;
};

export type Listing = {
  id: number;
  userId: number;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  status: string;
};

export type Bid = {
  id: number;
  listingId: number;
  repairmanId: number;
  amount: number;
  comment?: string;
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