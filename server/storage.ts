import { User, InsertUser, Listing, InsertListing, Bid, InsertBid } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { supabase } from "../client/src/lib/supabase";

const MemoryStore = createMemoryStore(session);

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
    const { data, error } = await supabase
      .from('users')
      .select()
      .eq('id', id)
      .single();

    if (error || !data) return undefined;
    return data as User;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select()
      .eq('username', username)
      .single();

    if (error || !data) return undefined;
    return data as User;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert([insertUser])
      .select()
      .single();

    if (error) throw error;
    return data as User;
  }

  async createListing(listing: InsertListing & { userId: number }): Promise<Listing> {
    const { data, error } = await supabase
      .from('listings')
      .insert([listing])
      .select()
      .single();

    if (error) throw error;
    return data as Listing;
  }

  async getListing(id: number): Promise<Listing | undefined> {
    const { data, error } = await supabase
      .from('listings')
      .select()
      .eq('id', id)
      .single();

    if (error || !data) return undefined;
    return data as Listing;
  }

  async getListings(): Promise<Listing[]> {
    const { data, error } = await supabase
      .from('listings')
      .select();

    if (error) throw error;
    return data as Listing[];
  }

  async getListingsByCategory(category: string): Promise<Listing[]> {
    const { data, error } = await supabase
      .from('listings')
      .select()
      .eq('category', category);

    if (error) throw error;
    return data as Listing[];
  }

  async createBid(bid: InsertBid & { listingId: number; repairmanId: number }): Promise<Bid> {
    const { data, error } = await supabase
      .from('bids')
      .insert([bid])
      .select()
      .single();

    if (error) throw error;
    return data as Bid;
  }

  async getBidsForListing(listingId: number): Promise<Bid[]> {
    const { data, error } = await supabase
      .from('bids')
      .select()
      .eq('listingId', listingId);

    if (error) throw error;
    return data as Bid[];
  }
}

export const storage = new SupabaseStorage();