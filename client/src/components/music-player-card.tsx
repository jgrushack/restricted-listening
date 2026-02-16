import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2, Loader2 } from "lucide-react";
import { getTrackStreamUrl, extractTrackIdFromUrl } from "@/lib/audius-client";
import audiusLogo from "@assets/671bf90dcd69d970b1ae1196_LogoGlyph-Mono-White_1024@2x_1750436010716.webp";

interface MusicPlayerCardProps {
  track: {
    title: string;
    artist: string;
    genre: string;
    duration: string;
    albumArt: string;
    audiusUrl?: string;
    audiusTrackId?: string;
  };
}

export default function MusicPlayerCard({ track }: MusicPlayerCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load stream URL when component mounts
  useEffect(() => {
    const loadStreamUrl = async () => {
      if (!track.audiusTrackId) {
        setError("No Audius track ID available");
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        const url = await getTrackStreamUrl(track.audiusTrackId);
        
        if (url) {
          setStreamUrl(url);
        } else {
          setError("Unable to load track stream");
        }
      } catch (err) {
        setError("Failed to load track");
        console.error("Error loading stream URL:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadStreamUrl();
  }, [track.audiusUrl]);

  // Initialize audio element when stream URL is available
  useEffect(() => {
    if (!streamUrl) return;

    const audio = new Audio(streamUrl);
    audio.preload = "metadata";
    
    audio.addEventListener('loadedmetadata', () => {
      setDuration(audio.duration);
    });

    audio.addEventListener('timeupdate', () => {
      setCurrentTime(audio.currentTime);
      setProgress((audio.currentTime / audio.duration) * 100);
    });

    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
    });

    audio.addEventListener('error', () => {
      setError("Playback error occurred");
      setIsPlaying(false);
    });

    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.remove();
    };
  }, [streamUrl]);

  const togglePlay = async () => {
    if (!audioRef.current || !streamUrl) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (err) {
      setError("Playback failed");
      console.error("Playbook error:", err);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;
    
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    setProgress((newTime / duration) * 100);
  };

  const openExternalLink = (url: string | undefined) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-music-darker rounded-3xl p-8 border border-gray-800 shadow-2xl">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Album Artwork */}
          <div className="space-y-6">
            <div className="relative group">
              <img 
                src={track.albumArt}
                alt={`${track.title} album artwork`}
                className="w-full aspect-square object-cover rounded-2xl shadow-lg group-hover:shadow-2xl transition-shadow duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <button 
                onClick={togglePlay}
                disabled={isLoading || !streamUrl || !!error}
                className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              >
                <div className="bg-music-purple hover:bg-music-purple-light w-16 h-16 rounded-full flex items-center justify-center shadow-lg disabled:opacity-50">
                  {isLoading ? (
                    <Loader2 className="text-white text-xl animate-spin" />
                  ) : isPlaying ? (
                    <Pause className="text-white text-xl" />
                  ) : (
                    <Play className="text-white text-xl ml-1" />
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* Track Information */}
          <div className="space-y-6">
            <div>
              <h2 className="text-4xl font-bold mb-2">{track.title}</h2>
              <p className="text-xl text-music-purple font-semibold mb-1">{track.artist}</p>
              <p className="text-music-light-gray">{track.genre} • 2024</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-900/20 border border-red-600 rounded-xl p-4 text-red-400 text-center">
                <p className="font-medium">Playback Error</p>
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Audio Player Controls */}
            <div className="bg-music-dark rounded-xl p-4 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <button 
                    onClick={togglePlay}
                    disabled={isLoading || !streamUrl || !!error}
                    className="bg-music-purple hover:bg-music-purple-light w-12 h-12 rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
                  >
                    {isLoading ? (
                      <Loader2 className="text-white animate-spin" />
                    ) : isPlaying ? (
                      <Pause className="text-white" />
                    ) : (
                      <Play className="text-white ml-0.5" />
                    )}
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="text-music-light-gray hover:text-white transition-colors">
                    <Volume2 className="w-5 h-5" />
                  </button>
                  <div className="w-20 h-1 bg-gray-700 rounded-full">
                    <div className="w-3/4 h-full bg-music-purple rounded-full"></div>
                  </div>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="flex items-center space-x-3 text-sm text-music-light-gray">
                <span>{formatTime(currentTime)}</span>
                <div 
                  className="flex-1 h-1 bg-gray-700 rounded-full cursor-pointer"
                  onClick={handleProgressClick}
                >
                  <div 
                    className="h-full bg-music-purple rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <span>{duration ? formatTime(duration) : track.duration}</span>
              </div>
            </div>

            {/* Audius Link */}
            <div className="flex justify-center">
              <Button 
                onClick={() => openExternalLink(track.audiusUrl)}
                className="bg-music-purple hover:bg-music-purple-light px-8 py-3 rounded-full font-semibold transition-colors duration-200 flex items-center justify-center space-x-3"
              >
                <img src={audiusLogo} alt="Audius" className="w-5 h-5" />
                <span>View on Audius</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
