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
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createListing(listing: InsertListing & { userId: number }): Promise<Listing>;
  getListing(id: number): Promise<Listing | undefined>;
  getListings(): Promise<Listing[]>;
  getListingsByCategory(category: string): Promise<Listing[]>;
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
      if (!data) return undefined;

      return {
        id: data.id,
        username: data.username,
        password: data.password,
        isRepairman: data.is_repairman,
      };
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
        if (error.code === 'PGRST116') return undefined;
        throw error;
      }
      if (!data) return undefined;

      return {
        id: data.id,
        username: data.username,
        password: data.password,
        isRepairman: data.is_repairman,
      };
    } catch (error) {
      console.error('Error getting user by username:', error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([{
          username: insertUser.username,
          password: insertUser.password,
          is_repairman: insertUser.isRepairman,
        }])
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('No data returned after creating user');

      return {
        id: data.id,
        username: data.username,
        password: data.password,
        isRepairman: data.is_repairman,
      };
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }
  }

  async createListing(listing: InsertListing & { userId: number }): Promise<Listing> {
    try {
      const { data, error } = await supabase
        .from('listings')
        .insert([{
          user_id: listing.userId,
          title: listing.title,
          description: listing.description,
          category: listing.category,
          image_url: listing.imageUrl,
          status: 'open',
        }])
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('No data returned after creating listing');

      return {
        id: data.id,
        userId: data.user_id,
        title: data.title,
        description: data.description,
        category: data.category,
        imageUrl: data.image_url,
        status: data.status,
      };
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
      if (!data) return undefined;

      return {
        id: data.id,
        userId: data.user_id,
        title: data.title,
        description: data.description,
        category: data.category,
        imageUrl: data.image_url,
        status: data.status,
      };
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
      if (!data) return [];

      return data.map(item => ({
        id: item.id,
        userId: item.user_id,
        title: item.title,
        description: item.description,
        category: item.category,
        imageUrl: item.image_url,
        status: item.status,
      }));
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
      if (!data) return [];

      return data.map(item => ({
        id: item.id,
        userId: item.user_id,
        title: item.title,
        description: item.description,
        category: item.category,
        imageUrl: item.image_url,
        status: item.status,
      }));
    } catch (error) {
      console.error('Error getting listings by category:', error);
      return [];
    }
  }

  async createBid(bid: InsertBid & { listingId: number; repairmanId: number }): Promise<Bid> {
    try {
      const { data, error } = await supabase
        .from('bids')
        .insert([{
          listing_id: bid.listingId,
          repairman_id: bid.repairmanId,
          amount: bid.amount,
          comment: bid.comment,
        }])
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('No data returned after creating bid');

      return {
        id: data.id,
        listingId: data.listing_id,
        repairmanId: data.repairman_id,
        amount: data.amount,
        comment: data.comment,
      };
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
        .eq('listing_id', listingId);

      if (error) throw error;
      if (!data) return [];

      return data.map(item => ({
        id: item.id,
        listingId: item.listing_id,
        repairmanId: item.repairman_id,
        amount: item.amount,
        comment: item.comment,
      }));
    } catch (error) {
      console.error('Error getting bids:', error);
      return [];
    }
  }
}

export const storage = new SupabaseStorage();