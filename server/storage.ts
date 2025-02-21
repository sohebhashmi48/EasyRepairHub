import { User, InsertUser, Listing, InsertListing, Bid, InsertBid } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private listings: Map<number, Listing>;
  private bids: Map<number, Bid>;
  sessionStore: session.Store;
  private currentUserId: number;
  private currentListingId: number;
  private currentBidId: number;

  constructor() {
    this.users = new Map();
    this.listings = new Map();
    this.bids = new Map();
    this.currentUserId = 1;
    this.currentListingId = 1;
    this.currentBidId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createListing(listing: InsertListing & { userId: number }): Promise<Listing> {
    const id = this.currentListingId++;
    const newListing = { ...listing, id, status: "open" };
    this.listings.set(id, newListing);
    return newListing;
  }

  async getListing(id: number): Promise<Listing | undefined> {
    return this.listings.get(id);
  }

  async getListings(): Promise<Listing[]> {
    return Array.from(this.listings.values());
  }

  async getListingsByCategory(category: string): Promise<Listing[]> {
    return Array.from(this.listings.values()).filter(
      (listing) => listing.category === category,
    );
  }

  async createBid(bid: InsertBid & { listingId: number; repairmanId: number }): Promise<Bid> {
    const id = this.currentBidId++;
    const newBid = { ...bid, id };
    this.bids.set(id, newBid);
    return newBid;
  }

  async getBidsForListing(listingId: number): Promise<Bid[]> {
    return Array.from(this.bids.values()).filter(
      (bid) => bid.listingId === listingId,
    );
  }
}

export const storage = new MemStorage();
