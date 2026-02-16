import { useState, useEffect } from "react";
import { Music, CheckCircle, Settings, MapPin } from "lucide-react";
import { Link } from "wouter";
import LocationVerificationOverlay from "@/components/location-verification-overlay";
import MusicPlayerCard from "@/components/music-player-card";
import ArtistInformation from "@/components/artist-information";
import ShareSection from "@/components/share-section";
import { useGeolocation } from "@/hooks/use-geolocation";

export default function Home() {
  const [showOverlay, setShowOverlay] = useState(true);
  
  // Example geo-bounds for demonstration (Portland, OR area)
  // In production, this would come from your backend/API
  const geoBounds = {
    centerLat: 45.5152,
    centerLng: -122.6784,
    radiusMiles: 31, // 31 mile radius around Portland, OR
  };

  const { state, location, error, requestLocation, retry } = useGeolocation({
    // bounds: geoBounds, // Temporarily disabled for testing
    autoRequest: false, // Start with manual request
  });

  useEffect(() => {
    if (state === "verified") {
      // Add a small delay for better UX
      setTimeout(() => {
        setShowOverlay(false);
      }, 1000);
    } else if (state === "idle") {
      // Start with overlay visible for location request
      setShowOverlay(true);
    }

    // Listen for demo bypass event
    const handleDemoBypass = () => {
      setShowOverlay(false);
    };

    window.addEventListener('demo-bypass-location', handleDemoBypass);
    return () => window.removeEventListener('demo-bypass-location', handleDemoBypass);
  }, [state]);

  // Sample track and artist data with real Audius URL for testing
  const track = {
    title: "Can U Feel",
    artist: "Zero Point",
    genre: "Electronic",
    duration: "3:42",
    albumArt: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=800",
    audiusUrl: "https://audius.co/maddecent/edc2023-takeover-mix",
  };

  const artist = {
    name: "Zero Point",
    bio: "Zero Point is an innovative electronic music producer known for creating immersive soundscapes that blend futuristic beats with emotional depth. Based in the underground music scene, their tracks have gained recognition for pushing the boundaries of electronic music while maintaining accessibility for mainstream audiences.\n\n\"Can U Feel\" represents their latest exploration into the intersection of technology and human emotion, featuring intricate layering and a driving rhythm that captures the essence of modern electronic music.",
    instagramHandle: "zeropoint_music",
    twitterHandle: "zeropointbeats",
    website: "zeropointmusic.com",
    monthlyListeners: "124.5K",
    totalPlays: "2.1M",
    followers: "89.2K",
  };

  return (
    <div className="min-h-screen bg-music-dark text-white">
      <LocationVerificationOverlay
        state={state}
        error={error}
        onRequestLocation={requestLocation}
        onRetry={retry}
        isVisible={showOverlay}
      />

      {!showOverlay && (
        <div className="min-h-screen">
          {/* Header */}
          <header className="relative overflow-hidden">
            {/* Background gradient with music-themed pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-music-purple/20 via-music-dark to-music-darker"></div>
            <div className="absolute inset-0 opacity-10">
              <div 
                className="h-full w-full" 
                style={{
                  backgroundImage: `radial-gradient(circle at 25% 25%, hsl(271, 84%, 63%) 0%, transparent 50%), radial-gradient(circle at 75% 75%, hsl(267, 75%, 75%) 0%, transparent 50%)`
                }}
              ></div>
            </div>
            
            <div className="relative z-10 container mx-auto px-4 py-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <Music className="text-music-purple text-2xl" />
                  <h1 className="text-2xl font-bold">Fanlink</h1>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="flex flex-col items-end space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="text-green-500 w-5 h-5" />
                      <span className="text-music-light-gray">Location Verified</span>
                    </div>
                    <div className="bg-music-purple/20 border border-music-purple/50 rounded-full px-3 py-1">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-music-purple" />
                        <span className="text-music-purple font-semibold text-sm">
                          Portland, OR (31 mile radius)
                        </span>
                      </div>
                    </div>
                  </div>
                  <Link href="/admin" className="flex items-center space-x-2 text-music-light-gray hover:text-white transition-colors">
                    <Settings className="w-5 h-5" />
                    <span className="text-sm">Admin</span>
                  </Link>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="container mx-auto px-4 pb-8">
            <MusicPlayerCard track={track} />
            <ArtistInformation artist={artist} />
            <ShareSection trackTitle={track.title} artistName={track.artist} />
          </main>
        </div>
      )}
    </div>
  );
}
