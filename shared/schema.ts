import { pgTable, text, serial, integer, boolean, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const tracks = pgTable("tracks", {
  id: serial("id").primaryKey(),
  shareId: text("share_id").notNull().unique(), // Unique identifier for sharing
  title: text("title").notNull(),
  artist: text("artist").notNull(),
  genre: text("genre").notNull(),
  duration: text("duration").notNull(),
  albumArt: text("album_art").notNull(),
  audiusUrl: text("audius_url"),
  audiusTrackId: text("audius_track_id"),
  audiusUserId: text("audius_user_id"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const geoRestrictions = pgTable("geo_restrictions", {
  id: serial("id").primaryKey(),
  trackId: integer("track_id").references(() => tracks.id).notNull(),
  centerLat: real("center_lat").notNull(),
  centerLng: real("center_lng").notNull(),
  radiusKm: real("radius_km").notNull(),
  cityName: text("city_name"),
  isActive: boolean("is_active").default(true),
});

export const artistProfiles = pgTable("artist_profiles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  bio: text("bio").notNull(),
  instagramHandle: text("instagram_handle"),
  twitterHandle: text("twitter_handle"),
  website: text("website"),
  monthlyListeners: text("monthly_listeners"),
  totalPlays: text("total_plays"),
  followers: text("followers"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertTrackSchema = createInsertSchema(tracks).omit({
  id: true,
  shareId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGeoRestrictionSchema = createInsertSchema(geoRestrictions).omit({
  id: true,
});

export const insertArtistProfileSchema = createInsertSchema(artistProfiles).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Track = typeof tracks.$inferSelect;
export type InsertTrack = z.infer<typeof insertTrackSchema>;
export type GeoRestriction = typeof geoRestrictions.$inferSelect;
export type InsertGeoRestriction = z.infer<typeof insertGeoRestrictionSchema>;
export type ArtistProfile = typeof artistProfiles.$inferSelect;
export type InsertArtistProfile = z.infer<typeof insertArtistProfileSchema>;
