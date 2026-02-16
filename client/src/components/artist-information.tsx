import { FaInstagram, FaTwitter, FaGlobe, FaTiktok } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import audiusLogo from "@assets/671bf90dcd69d970b1ae1196_LogoGlyph-Mono-White_1024@2x_1750436010716.webp";

interface ArtistInformationProps {
  artist: {
    name: string;
    bio: string;
    instagramHandle?: string;
    twitterHandle?: string;
    tiktokHandle?: string;
    website?: string;
    trackCount?: string;
    playlistCount?: string;
    albumCount?: string;
    followers?: string;
    following?: string;
    audiusHandle?: string;
  };
}

export default function ArtistInformation({ artist }: ArtistInformationProps) {
  const openSocialLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <div className="bg-music-darker rounded-3xl p-8 border border-gray-800">
        <div className="grid lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-6">
            <h3 className="text-2xl font-bold mb-4">About {artist.name}</h3>
            <div className="space-y-4 text-music-light-gray leading-relaxed">
              {artist.bio.split('\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
            
            {/* Stats Section */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-700">
              {artist.followers && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{artist.followers}</div>
                  <div className="text-sm text-music-light-gray">Followers</div>
                </div>
              )}
              {artist.following && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{artist.following}</div>
                  <div className="text-sm text-music-light-gray">Following</div>
                </div>
              )}
              {artist.trackCount && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{artist.trackCount}</div>
                  <div className="text-sm text-music-light-gray">Tracks</div>
                </div>
              )}
              {artist.playlistCount && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{artist.playlistCount}</div>
                  <div className="text-sm text-music-light-gray">Playlists</div>
                </div>
              )}
              {artist.albumCount && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{artist.albumCount}</div>
                  <div className="text-sm text-music-light-gray">Albums</div>
                </div>
              )}
            </div>
          </div>
          
          <div className="lg:col-span-2 space-y-6">
            <h4 className="text-xl font-semibold">Follow {artist.name}</h4>
            <div className="space-y-3">
              {artist.audiusHandle && (
                <Button 
                  onClick={() => openSocialLink(`https://audius.co/${artist.audiusHandle}`)}
                  className="bg-music-purple hover:bg-music-purple-light px-6 py-2 rounded-full font-semibold transition-colors duration-200 flex items-center justify-center space-x-2 w-full"
                >
                  <img src={audiusLogo} alt="Audius" className="w-4 h-4" />
                  <span>Follow on Audius</span>
                </Button>
              )}
              {artist.instagramHandle && (
                <button 
                  onClick={() => openSocialLink(`https://instagram.com/${artist.instagramHandle}`)}
                  className="flex items-center space-x-3 text-music-light-gray hover:text-white transition-colors w-full text-left"
                >
                  <FaInstagram className="text-xl" />
                  <span>@{artist.instagramHandle}</span>
                </button>
              )}
              {artist.twitterHandle && (
                <button 
                  onClick={() => openSocialLink(`https://twitter.com/${artist.twitterHandle}`)}
                  className="flex items-center space-x-3 text-music-light-gray hover:text-white transition-colors w-full text-left"
                >
                  <FaTwitter className="text-xl" />
                  <span>@{artist.twitterHandle}</span>
                </button>
              )}
              {artist.tiktokHandle && (
                <button 
                  onClick={() => openSocialLink(`https://tiktok.com/@${artist.tiktokHandle}`)}
                  className="flex items-center space-x-3 text-music-light-gray hover:text-white transition-colors w-full text-left"
                >
                  <FaTiktok className="text-xl" />
                  <span>@{artist.tiktokHandle}</span>
                </button>
              )}
              {artist.website && (
                <button 
                  onClick={() => openSocialLink(artist.website!)}
                  className="flex items-center space-x-3 text-music-light-gray hover:text-white transition-colors w-full text-left"
                >
                  <FaGlobe className="text-xl" />
                  <span>{artist.website}</span>
                </button>
              )}
            </div>
            

          </div>
        </div>
      </div>
    </div>
  );
}
