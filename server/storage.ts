import { User, InsertUser, Listing, InsertListing, Bid, InsertBid } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { createClient } from '@supabase/supabase-js';

const MemoryStore = createMemoryStore(session);

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase credentials');
}

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export interface IStorage {
  sessionStore: session.Store;

  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Listing operations
  createListing(listing: InsertListing & { userId: number }): Promise<Listing>;
  getListing(id: number): Promise<Listing | undefined>;
  getListings(): Promise<Listing[]>;
  getListingsByCategory(category: string): Promise<Listing[]>;

  // Bid operations
  createBid(bid: InsertBid & { listingId: number; repairmanId: number }): Promise<Bid>;
  getBidsForListing(listingId: number): Promise<Bid[]>;
}

export class SupabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select()
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as User || undefined;
    } catch (error) {
      console.error('Error getting user:', error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select()
        .eq('username', username)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return undefined; // No rows returned
        throw error;
      }
      return data as User;
    } catch (error) {
      console.error('Error getting user by username:', error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([insertUser])
        .select()
        .single();

      if (error) throw error;
      return data as User;
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }
  }

  async createListing(listing: InsertListing & { userId: number }): Promise<Listing> {
    try {
      const { data, error } = await supabase
        .from('listings')
        .insert([{ ...listing, status: 'open' }])
        .select()
        .single();

      if (error) throw error;
      return data as Listing;
    } catch (error) {
      console.error('Error creating listing:', error);
      throw new Error('Failed to create listing');
    }
  }

  async getListing(id: number): Promise<Listing | undefined> {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select()
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return undefined;
        throw error;
      }
      return data as Listing;
    } catch (error) {
      console.error('Error getting listing:', error);
      return undefined;
    }
  }

  async getListings(): Promise<Listing[]> {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select();

      if (error) throw error;
      return data as Listing[];
    } catch (error) {
      console.error('Error getting listings:', error);
      return [];
    }
  }

  async getListingsByCategory(category: string): Promise<Listing[]> {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select()
        .eq('category', category);

      if (error) throw error;
      return data as Listing[];
    } catch (error) {
      console.error('Error getting listings by category:', error);
      return [];
    }
  }

  async createBid(bid: InsertBid & { listingId: number; repairmanId: number }): Promise<Bid> {
    try {
      const { data, error } = await supabase
        .from('bids')
        .insert([bid])
        .select()
        .single();

      if (error) throw error;
      return data as Bid;
    } catch (error) {
      console.error('Error creating bid:', error);
      throw new Error('Failed to create bid');
    }
  }

  async getBidsForListing(listingId: number): Promise<Bid[]> {
    try {
      const { data, error } = await supabase
        .from('bids')
        .select()
        .eq('listingId', listingId);

      if (error) throw error;
      return data as Bid[];
    } catch (error) {
      console.error('Error getting bids:', error);
      return [];
    }
  }
}

export const storage = new SupabaseStorage();