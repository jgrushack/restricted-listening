import { 
  users, 
  tracks, 
  geoRestrictions, 
  artistProfiles,
  type User, 
  type InsertUser,
  type Track,
  type InsertTrack,
  type GeoRestriction,
  type InsertGeoRestriction,
  type ArtistProfile,
  type InsertArtistProfile
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Track methods
  getAllTracks(): Promise<Track[]>;
  getTrack(id: number): Promise<Track | undefined>;
  getTrackByShareId(shareId: string): Promise<Track | undefined>;
  createTrack(track: InsertTrack): Promise<Track>;
  updateTrack(id: number, track: Partial<InsertTrack>): Promise<Track | undefined>;
  deleteTrack(id: number): Promise<boolean>;
  
  // Geo restriction methods
  getGeoRestrictionsByTrackId(trackId: number): Promise<GeoRestriction[]>;
  createGeoRestriction(restriction: InsertGeoRestriction): Promise<GeoRestriction>;
  updateGeoRestriction(id: number, restriction: Partial<InsertGeoRestriction>): Promise<GeoRestriction | undefined>;
  deleteGeoRestriction(id: number): Promise<boolean>;
  
  // Artist profile methods
  getAllArtistProfiles(): Promise<ArtistProfile[]>;
  getArtistProfile(id: number): Promise<ArtistProfile | undefined>;
  createArtistProfile(profile: InsertArtistProfile): Promise<ArtistProfile>;
}

export class DatabaseStorage implements IStorage {
  private users: Map<number, User>;
  private tracks: Map<number, Track>;
  private geoRestrictions: Map<number, GeoRestriction>;
  private artistProfiles: Map<number, ArtistProfile>;
  private currentUserId: number;
  private currentTrackId: number;
  private currentGeoRestrictionId: number;
  private currentArtistProfileId: number;

  constructor() {
    this.users = new Map();
    this.tracks = new Map();
    this.geoRestrictions = new Map();
    this.artistProfiles = new Map();
    this.currentUserId = 1;
    this.currentTrackId = 1;
    this.currentGeoRestrictionId = 1;
    this.currentArtistProfileId = 1;
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
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Track methods
  async getAllTracks(): Promise<Track[]> {
    return Array.from(this.tracks.values());
  }

  async getTrack(id: number): Promise<Track | undefined> {
    return this.tracks.get(id);
  }

  async createTrack(insertTrack: InsertTrack): Promise<Track> {
    const id = this.currentTrackId++;
    const track: Track = { ...insertTrack, id };
    this.tracks.set(id, track);
    return track;
  }

  async updateTrack(id: number, updateData: Partial<InsertTrack>): Promise<Track | undefined> {
    const existingTrack = this.tracks.get(id);
    if (!existingTrack) return undefined;
    
    const updatedTrack: Track = { ...existingTrack, ...updateData };
    this.tracks.set(id, updatedTrack);
    return updatedTrack;
  }

  async deleteTrack(id: number): Promise<boolean> {
    const deleted = this.tracks.delete(id);
    // Also delete associated geo restrictions
    const restrictions = Array.from(this.geoRestrictions.values()).filter(r => r.trackId === id);
    restrictions.forEach(r => this.geoRestrictions.delete(r.id));
    return deleted;
  }

  // Geo restriction methods
  async getGeoRestrictionsByTrackId(trackId: number): Promise<GeoRestriction[]> {
    return Array.from(this.geoRestrictions.values()).filter(r => r.trackId === trackId);
  }

  async createGeoRestriction(insertRestriction: InsertGeoRestriction): Promise<GeoRestriction> {
    const id = this.currentGeoRestrictionId++;
    const restriction: GeoRestriction = { ...insertRestriction, id };
    this.geoRestrictions.set(id, restriction);
    return restriction;
  }

  async updateGeoRestriction(id: number, updateData: Partial<InsertGeoRestriction>): Promise<GeoRestriction | undefined> {
    const existing = this.geoRestrictions.get(id);
    if (!existing) return undefined;
    
    const updated: GeoRestriction = { ...existing, ...updateData };
    this.geoRestrictions.set(id, updated);
    return updated;
  }

  async deleteGeoRestriction(id: number): Promise<boolean> {
    return this.geoRestrictions.delete(id);
  }

  // Artist profile methods
  async getAllArtistProfiles(): Promise<ArtistProfile[]> {
    return Array.from(this.artistProfiles.values());
  }

  async getArtistProfile(id: number): Promise<ArtistProfile | undefined> {
    return this.artistProfiles.get(id);
  }

  async createArtistProfile(insertProfile: InsertArtistProfile): Promise<ArtistProfile> {
    const id = this.currentArtistProfileId++;
    const profile: ArtistProfile = { ...insertProfile, id };
    this.artistProfiles.set(id, profile);
    return profile;
  }
}

export const storage = new MemStorage();
