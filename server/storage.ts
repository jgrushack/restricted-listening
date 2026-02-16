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
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getAllTracks(): Promise<Track[]> {
    return await db.select().from(tracks);
  }

  async getTrack(id: number): Promise<Track | undefined> {
    const [track] = await db.select().from(tracks).where(eq(tracks.id, id));
    return track || undefined;
  }

  async getTrackByShareId(shareId: string): Promise<Track | undefined> {
    const [track] = await db.select().from(tracks).where(eq(tracks.shareId, shareId));
    return track || undefined;
  }

  async createTrack(insertTrack: InsertTrack): Promise<Track> {
    const shareId = nanoid(10);
    const now = new Date().toISOString();
    
    const [track] = await db
      .insert(tracks)
      .values({
        ...insertTrack,
        shareId,
        createdAt: now,
        updatedAt: now,
      })
      .returning();
    return track;
  }

  async updateTrack(id: number, updateData: Partial<InsertTrack>): Promise<Track | undefined> {
    const now = new Date().toISOString();
    
    const [track] = await db
      .update(tracks)
      .set({
        ...updateData,
        updatedAt: now,
      })
      .where(eq(tracks.id, id))
      .returning();
    
    return track || undefined;
  }

  async deleteTrack(id: number): Promise<boolean> {
    const result = await db.delete(tracks).where(eq(tracks.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getGeoRestrictionsByTrackId(trackId: number): Promise<GeoRestriction[]> {
    return await db
      .select()
      .from(geoRestrictions)
      .where(eq(geoRestrictions.trackId, trackId));
  }

  async createGeoRestriction(insertRestriction: InsertGeoRestriction): Promise<GeoRestriction> {
    const [restriction] = await db
      .insert(geoRestrictions)
      .values(insertRestriction)
      .returning();
    return restriction;
  }

  async updateGeoRestriction(id: number, updateData: Partial<InsertGeoRestriction>): Promise<GeoRestriction | undefined> {
    const [restriction] = await db
      .update(geoRestrictions)
      .set(updateData)
      .where(eq(geoRestrictions.id, id))
      .returning();
      
    return restriction || undefined;
  }

  async deleteGeoRestriction(id: number): Promise<boolean> {
    const result = await db.delete(geoRestrictions).where(eq(geoRestrictions.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getAllArtistProfiles(): Promise<ArtistProfile[]> {
    return await db.select().from(artistProfiles);
  }

  async getArtistProfile(id: number): Promise<ArtistProfile | undefined> {
    const [profile] = await db.select().from(artistProfiles).where(eq(artistProfiles.id, id));
    return profile || undefined;
  }

  async createArtistProfile(insertProfile: InsertArtistProfile): Promise<ArtistProfile> {
    const [profile] = await db
      .insert(artistProfiles)
      .values(insertProfile)
      .returning();
    return profile;
  }
}

export const storage = new DatabaseStorage();