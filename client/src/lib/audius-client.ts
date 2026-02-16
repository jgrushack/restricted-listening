// Audius API - using the public API endpoints
import axios from 'axios';

const AUDIUS_API_HOST = "https://discoveryprovider.audius.co";

export interface AudiusTrack {
  id: string;
  title: string;
  user: {
    id: string;
    name: string;
    handle: string;
    bio?: string;
    location?: string;
    follower_count?: number;
    followee_count?: number;
    track_count?: number;
    playlist_count?: number;
    profile_picture?: {
      "150x150"?: string;
      "480x480"?: string;
      "1000x1000"?: string;
    };
    cover_photo?: {
      "640x"?: string;
      "2000x"?: string;
    };
    twitter_handle?: string;
    instagram_handle?: string;
    tiktok_handle?: string;
    website?: string;
  };
  genre: string;
  duration: number;
  artwork?: {
    "150x150"?: string;
    "480x480"?: string;
    "1000x1000"?: string;
  };
  permalink: string;
  stream_url?: string;
}

export interface AudiusUser {
  id: string;
  name: string;
  handle: string;
  bio?: string;
  location?: string;
  follower_count?: number;
  followee_count?: number;
  track_count?: number;
  playlist_count?: number;
  profile_picture?: {
    "150x150"?: string;
    "480x480"?: string;
    "1000x1000"?: string;
  };
  cover_photo?: {
    "640x"?: string;
    "2000x"?: string;
  };
  twitter_handle?: string;
  instagram_handle?: string;
  tiktok_handle?: string;
  website?: string;
}

// Extract track ID from Audius URL
export function extractTrackIdFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    if (!urlObj.hostname.includes('audius.co')) {
      return null;
    }
    
    const pathParts = urlObj.pathname.split('/').filter(part => part.length > 0);
    if (pathParts.length < 2) {
      return null;
    }
    
    // Extract artist and track from URL path
    const artist = pathParts[0];
    const trackSlug = pathParts[pathParts.length - 1];
    
    // Return a search query combining artist and track
    // This will be used for searching since direct ID extraction is unreliable
    return `${artist} ${trackSlug.replace(/-/g, ' ')}`;
  } catch (error) {
    console.error("Error parsing Audius URL:", error);
    return null;
  }
}

// Get track ID by searching for exact artist and track match
export async function getTrackIdFromUrl(url: string): Promise<string | null> {
  try {
    const urlObj = new URL(url);
    if (!urlObj.hostname.includes('audius.co')) {
      return null;
    }
    
    const pathParts = urlObj.pathname.split('/').filter(part => part.length > 0);
    if (pathParts.length < 2) {
      return null;
    }
    
    const artist = pathParts[0];
    const trackSlug = pathParts[pathParts.length - 1];
    
    // Search for tracks by this artist
    const searchQuery = artist;
    console.log(`Searching for tracks by artist: "${artist}"`);
    
    const response = await fetch(`${AUDIUS_API_HOST}/v1/tracks/search?query=${encodeURIComponent(searchQuery)}&limit=50`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });
    
    if (!response.ok) {
      console.warn(`Search failed: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    console.log(`Found ${data.data?.length || 0} tracks for artist ${artist}`);
    
    if (!data.data || data.data.length === 0) {
      console.warn(`No tracks found for artist: ${artist}`);
      return null;
    }
    
    // Look for exact match with the artist handle and track slug
    const exactMatch = data.data.find((track: any) => {
      const trackPermalink = track.permalink || '';
      const userHandle = track.user?.handle || '';
      
      // Check if this track matches the URL structure
      const expectedPath = `/${userHandle}/${trackSlug}`;
      const actualPath = `/${artist}/${trackSlug}`;
      
      console.log(`Comparing: ${trackPermalink} vs ${actualPath}`);
      console.log(`User handle: ${userHandle}, Track title: ${track.title}`);
      
      return trackPermalink === actualPath || 
             (userHandle.toLowerCase() === artist.toLowerCase() && 
              track.title?.toLowerCase().replace(/[^a-z0-9]/g, '') === trackSlug.toLowerCase().replace(/[^a-z0-9]/g, ''));
    });
    
    if (exactMatch) {
      console.log(`Found exact match: ${exactMatch.title} by ${exactMatch.user?.name}`);
      return exactMatch.id;
    }
    
    console.warn(`No exact match found for URL: ${url}`);
    console.log("Available tracks:", data.data.map((t: any) => `${t.title} by ${t.user?.name} (${t.user?.handle})`));
    return null;
    
  } catch (error) {
    console.error("Error getting track ID from URL:", error);
    return null;
  }
}

// Get track data from Audius API
export async function getAudiusTrack(trackId: string): Promise<AudiusTrack | null> {
  try {
    const response = await fetch(`${AUDIUS_API_HOST}/v1/tracks/${trackId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });
    
    if (!response.ok) {
      console.warn(`Track ${trackId} not found or API error: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    if (data && data.data) {
      return data.data;
    }
    
    return null;
  } catch (error) {
    console.error("Error fetching Audius track:", error);
    return null;
  }
}

// Get track stream URL from Audius
export async function getTrackStreamUrl(trackId: string): Promise<string | null> {
  try {
    // Audius streaming endpoint - this will redirect to the actual stream URL
    const streamUrl = `${AUDIUS_API_HOST}/v1/tracks/${trackId}/stream`;
    
    // Audius returns redirects to the actual streaming servers
    // We can use this URL directly in the HTML5 audio element
    return streamUrl;
  } catch (error) {
    console.error("Error getting stream URL:", error);
    return null;
  }
}

// Get user/artist data from Audius by user ID
export async function getAudiusUser(userId: string): Promise<AudiusUser | null> {
  try {
    const response = await fetch(`${AUDIUS_API_HOST}/v1/users/${userId}`);
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    if (data && data.data) {
      return data.data;
    }
    
    return null;
  } catch (error) {
    console.error("Error fetching Audius user:", error);
    return null;
  }
}

// Search for tracks using Audius API
export async function searchTracks(query: string, limit: number = 10): Promise<AudiusTrack[]> {
  try {
    console.log(`Searching Audius for: "${query}"`);
    
    const searchParams = new URLSearchParams({
      query,
      limit: limit.toString()
    });
    
    const searchUrl = `${AUDIUS_API_HOST}/v1/tracks/search?${searchParams}`;
    console.log(`API URL: ${searchUrl}`);
    
    const response = await fetch(searchUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    console.log(`Response status: ${response.status}`);
    
    if (!response.ok) {
      console.warn(`Search failed: ${response.status} ${response.statusText}`);
      return [];
    }
    
    const data = await response.json();
    console.log("API Response:", data);
    
    const tracks = data.data || [];
    console.log(`Found ${tracks.length} tracks`);
    
    return tracks;
  } catch (error) {
    console.error("Error searching tracks:", error);
    return [];
  }
}

/**
 * Streams an unlisted Audius track if you have the link (trackId) and are the owner.
 */
export async function streamUnlistedTrack(discoveryNodeUrl: string, userId: string, trackId: string): Promise<string> {
  // ─── STEP 1: List your unlisted tracks ────────────────────────────────────
  const listRes = await axios.get(
    `${discoveryNodeUrl}/users/${userId}/tracks`,
    { params: { user_id: userId, filter_tracks: 'unlisted' } }
  );
  const found = listRes.data.data.find((t: any) => String(t.track_id) === String(trackId));
  if (!found) {
    throw new Error(`Track ${trackId} not found or not unlisted for user ${userId}.`);
  }

  // ─── STEP 2: Check access permissions ────────────────────────────────────
  const accessRes = await axios.get(
    `${discoveryNodeUrl}/tracks/${trackId}/access-info`,
    { params: { user_id: userId } }
  );
  const { stream } = accessRes.data.data.access;
  if (!stream) {
    throw new Error(`No streaming access for track ${trackId}.`);
  }

  // ─── STEP 3: Build & return the stream URL ───────────────────────────────
  return `${discoveryNodeUrl}/tracks/${trackId}/stream?user_id=${userId}`;
}

/**
 * Get unlisted track data and stream URL for owner
 */
export async function getUnlistedTrack(userId: string, trackId: string): Promise<{ track: AudiusTrack; streamUrl: string } | null> {
  try {
    // First, get the track data from unlisted tracks
    const listRes = await axios.get(
      `${AUDIUS_API_HOST}/users/${userId}/tracks`,
      { params: { user_id: userId, filter_tracks: 'unlisted' } }
    );
    
    const trackData = listRes.data.data.find((t: any) => String(t.track_id) === String(trackId));
    if (!trackData) {
      return null;
    }

    // Get the stream URL
    const streamUrl = await streamUnlistedTrack(AUDIUS_API_HOST, userId, trackId);
    
    return {
      track: trackData,
      streamUrl
    };
  } catch (error) {
    console.error("Error getting unlisted track:", error);
    return null;
  }
}