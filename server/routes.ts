import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTrackSchema, insertGeoRestrictionSchema, insertArtistProfileSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Track routes
  app.get("/api/tracks", async (req, res) => {
    try {
      const tracks = await storage.getAllTracks();
      res.json(tracks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tracks" });
    }
  });

  app.get("/api/tracks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const track = await storage.getTrack(id);
      if (!track) {
        return res.status(404).json({ error: "Track not found" });
      }
      
      // Also get geo restrictions for this track
      const geoRestrictions = await storage.getGeoRestrictionsByTrackId(id);
      res.json({ ...track, geoRestrictions });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch track" });
    }
  });

  // Get track by share ID for public access
  app.get("/api/tracks/share/:shareId", async (req, res) => {
    try {
      const shareId = req.params.shareId;
      const track = await storage.getTrackByShareId(shareId);
      if (!track) {
        return res.status(404).json({ error: "Track not found" });
      }
      res.json(track);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch track" });
    }
  });

  app.post("/api/tracks", async (req, res) => {
    try {
      const validatedData = insertTrackSchema.parse(req.body);
      const track = await storage.createTrack(validatedData);
      
      // Return the track with the share URL
      const shareUrl = `${req.protocol}://${req.get('host')}/track/${track.shareId}`;
      res.status(201).json({ 
        ...track, 
        shareUrl 
      });
    } catch (error) {
      res.status(400).json({ error: "Invalid track data", details: error });
    }
  });

  app.put("/api/tracks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertTrackSchema.partial().parse(req.body);
      const track = await storage.updateTrack(id, validatedData);
      if (!track) {
        return res.status(404).json({ error: "Track not found" });
      }
      res.json(track);
    } catch (error) {
      res.status(400).json({ error: "Invalid track data", details: error });
    }
  });

  app.delete("/api/tracks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteTrack(id);
      if (!deleted) {
        return res.status(404).json({ error: "Track not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete track" });
    }
  });

  // Geo restriction routes
  app.get("/api/tracks/:trackId/geo-restrictions", async (req, res) => {
    try {
      const trackId = parseInt(req.params.trackId);
      const restrictions = await storage.getGeoRestrictionsByTrackId(trackId);
      res.json(restrictions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch geo restrictions" });
    }
  });

  app.post("/api/geo-restrictions", async (req, res) => {
    try {
      const validatedData = insertGeoRestrictionSchema.parse(req.body);
      const restriction = await storage.createGeoRestriction(validatedData);
      res.status(201).json(restriction);
    } catch (error) {
      res.status(400).json({ error: "Invalid geo restriction data", details: error });
    }
  });

  app.put("/api/geo-restrictions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertGeoRestrictionSchema.partial().parse(req.body);
      const restriction = await storage.updateGeoRestriction(id, validatedData);
      if (!restriction) {
        return res.status(404).json({ error: "Geo restriction not found" });
      }
      res.json(restriction);
    } catch (error) {
      res.status(400).json({ error: "Invalid geo restriction data", details: error });
    }
  });

  app.delete("/api/geo-restrictions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteGeoRestriction(id);
      if (!deleted) {
        return res.status(404).json({ error: "Geo restriction not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete geo restriction" });
    }
  });

  // Artist profile routes
  app.get("/api/artist-profiles", async (req, res) => {
    try {
      const profiles = await storage.getAllArtistProfiles();
      res.json(profiles);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch artist profiles" });
    }
  });

  app.post("/api/artist-profiles", async (req, res) => {
    try {
      const validatedData = insertArtistProfileSchema.parse(req.body);
      const profile = await storage.createArtistProfile(validatedData);
      res.status(201).json(profile);
    } catch (error) {
      res.status(400).json({ error: "Invalid artist profile data", details: error });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
