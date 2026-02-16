import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { useState, useEffect } from "react";
import MusicPlayerCard from "@/components/music-player-card";
import ArtistInformation from "@/components/artist-information";
import ShareSection from "@/components/share-section";
import LocationVerificationOverlay from "@/components/location-verification-overlay";
import { useGeolocation, type LocationVerificationState } from "@/hooks/use-geolocation";
import { useColorExtraction } from "@/hooks/use-color-extraction";
import { calculateDistance } from "@/lib/geo-utils";
import { extractTrackIdFromUrl, getAudiusTrack, getAudiusUser } from "@/lib/audius-client";
import poweredByAudius from "@assets/badgePoweredByAudiusDark@2x_1750977438760.png";

export default function Track() {
  const { shareId } = useParams<{ shareId: string }>();
  const [isLocationVerified, setIsLocationVerified] = useState(false);

  // Fetch track data by share ID
  const { data: track, isLoading: trackLoading, error: trackError } = useQuery({
    queryKey: ['/api/tracks/share', shareId],
    queryFn: async () => {
      const response = await fetch(`/api/tracks/share/${shareId}`);
      if (!response.ok) {
        throw new Error('Track not found');
      }
      return response.json();
    },
    enabled: !!shareId,
  });

  // Fetch geo restrictions for the track
  const { data: restrictions = [] } = useQuery({
    queryKey: ['/api/tracks', track?.id, 'geo-restrictions'],
    queryFn: async () => {
      const response = await fetch(`/api/tracks/${track.id}/geo-restrictions`);
      if (!response.ok) return [];
      return response.json();
    },
    enabled: !!track?.id,
  });

  // Fetch Audius track data for enhanced playback
  const { data: audiusTrack } = useQuery({
    queryKey: ['audius-track', track?.audiusTrackId],
    queryFn: async () => {
      if (!track?.audiusTrackId) return null;
      return await getAudiusTrack(track.audiusTrackId);
    },
    enabled: !!track?.audiusTrackId,
  });

  // Fetch artist data from Audius
  const { data: audiusArtist } = useQuery({
    queryKey: ["audius-user", track?.audiusUserId],
    queryFn: async () => {
      if (!track?.audiusUserId) return null;
      return await getAudiusUser(track.audiusUserId);
    },
    enabled: !!track?.audiusUserId,
  });

  // Set up geolocation with bounds from restrictions
  const bounds = restrictions.length > 0 ? {
    centerLat: restrictions[0].centerLat,
    centerLng: restrictions[0].centerLng,
    radiusKm: restrictions[0].radiusKm,
  } : undefined;

  const {
    state: locationState,
    location,
    error: locationError,
    requestLocation,
    retry
  } = useGeolocation({ bounds, autoRequest: true });

  // Extract colors from album artwork for dynamic background
  const albumArtwork = track?.albumArt || audiusTrack?.artwork?.["1000x1000"];
  const colorPalette = useColorExtraction(albumArtwork);

  // Update verification status based on location state
  useEffect(() => {
    if (locationState === "verified") {
      setIsLocationVerified(true);
    } else {
      // All other states (idle, requesting-permission, checking, outside-bounds, denied, error) should show restriction
      setIsLocationVerified(false);
    }
  }, [locationState, restrictions]);

  if (trackLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading track...</div>
      </div>
    );
  }

  if (trackError || !track) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Track not found</div>
      </div>
    );
  }

  // Create track data for the music player
  const playerTrack = {
    title: track.title,
    artist: track.artist,
    genre: track.genre,
    duration: track.duration,
    albumArt: track.albumArt,
    audiusUrl: track.audiusUrl,
    audiusTrackId: track.audiusTrackId,
  };

  // Create artist information from Audius API data
  const artistInfo = {
    name: track.artist,
    bio: audiusArtist?.bio || `About ${track.artist}`,
    instagramHandle: audiusArtist?.instagram_handle,
    twitterHandle: audiusArtist?.twitter_handle,
    tiktokHandle: audiusArtist?.tiktok_handle,
    website: audiusArtist?.website,
    trackCount: audiusArtist?.track_count ? `${audiusArtist.track_count}` : undefined,
    playlistCount: audiusArtist?.playlist_count ? `${audiusArtist.playlist_count}` : undefined,
    albumCount: undefined, // Album count not available in Audius API
    followers: audiusArtist?.follower_count ? `${audiusArtist.follower_count.toLocaleString()}` : undefined,
    following: audiusArtist?.followee_count ? `${audiusArtist.followee_count.toLocaleString()}` : undefined,
    audiusHandle: audiusArtist?.handle,
  };

  const showLocationOverlay = restrictions.length > 0 && !isLocationVerified;
  const isGeoRestricted = restrictions.length > 0;
  const hasLocationAccess = !isGeoRestricted || isLocationVerified;

  // Dynamic background style
  const backgroundStyle = colorPalette 
    ? { background: colorPalette.gradient }
    : { background: 'linear-gradient(135deg, #7c3aed, #3b82f6, #1e1b4b)' };

  return (
    <div className="min-h-screen relative" style={backgroundStyle}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Location status notifications */}
          {isGeoRestricted && !isLocationVerified && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6 text-center">
              <h2 className="text-xl font-bold text-red-300 mb-2">Location Restricted Content</h2>
              <p className="text-red-200 mb-4">
                This track is only available in specific locations. You need to be in the correct geographic area to access the full experience.
              </p>
              <div className="text-sm text-red-300">
                <strong>Restricted Area:</strong> {restrictions[0]?.cityName || 'Specified location'} ({Math.round((restrictions[0]?.radiusKm || 0) * 0.621371)} mile radius)
              </div>
            </div>
          )}
          
          {isGeoRestricted && isLocationVerified && (
            <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-6 text-center">
              <h2 className="text-xl font-bold text-green-300 mb-2">Location Verified</h2>
              <p className="text-green-200 mb-4">
                You're in the right place! This exclusive content is now available to you.
              </p>
              <div className="text-sm text-green-300">
                <strong>Access granted for:</strong> {restrictions[0]?.cityName || 'Specified location'} ({Math.round((restrictions[0]?.radiusKm || 0) * 0.621371)} mile radius)
              </div>
            </div>
          )}

          {/* Show music player only if location is verified or track is not geo-restricted */}
          {hasLocationAccess && <MusicPlayerCard track={playerTrack} />}
          
          {/* Always show artist information */}
          <ArtistInformation artist={artistInfo} />
          
          {/* Show share section only if location is verified or track is not geo-restricted */}
          {hasLocationAccess && <ShareSection trackTitle={track.title} artistName={track.artist} />}
          
          {/* Powered by Audius badge */}
          <div className="flex justify-center">
            <a 
              href="https://audius.org"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-opacity hover:opacity-80"
            >
              <img 
                src={poweredByAudius}
                alt="Powered by Audius"
                className="h-12 w-auto"
              />
            </a>
          </div>
        </div>
      </div>

      {showLocationOverlay && (
        <LocationVerificationOverlay
          state={locationState}
          error={locationError}
          onRequestLocation={requestLocation}
          onRetry={retry}
          isVisible={true}
        />
      )}
    </div>
  );
}