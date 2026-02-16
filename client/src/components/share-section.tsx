import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FaFacebook, FaTwitter } from "react-icons/fa";
import { Link2, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ShareSectionProps {
  trackTitle: string;
  artistName: string;
}

export default function ShareSection({ trackTitle, artistName }: ShareSectionProps) {
  const [linkCopied, setLinkCopied] = useState(false);
  const { toast } = useToast();

  const shareToFacebook = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`Restricted: Location based listening - "${trackTitle}" by ${artistName}`);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`, '_blank', 'width=600,height=400');
  };

  const shareToTwitter = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`Restricted: Location based listening - "${trackTitle}" by ${artistName}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank', 'width=600,height=400');
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setLinkCopied(true);
      toast({
        title: "Link copied!",
        description: "The link has been copied to your clipboard.",
      });
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy link",
        description: "Please copy the link manually from your browser's address bar.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <div className="bg-music-darker rounded-3xl p-8 border border-gray-800 text-center">
        <h3 className="text-2xl font-bold mb-4">Share This Track</h3>
        <p className="text-music-light-gray mb-6">Help spread the word about "{trackTitle}" by {artistName}</p>
        
        <div className="flex flex-wrap justify-center gap-4">
          <Button 
            onClick={shareToFacebook}
            className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-full font-semibold transition-colors duration-200 flex items-center space-x-2"
          >
            <FaFacebook />
            <span>Facebook</span>
          </Button>
          <Button 
            onClick={shareToTwitter}
            className="bg-blue-400 hover:bg-blue-300 px-6 py-3 rounded-full font-semibold transition-colors duration-200 flex items-center space-x-2"
          >
            <FaTwitter />
            <span>Twitter</span>
          </Button>
          <Button 
            onClick={copyLink}
            className="bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-full font-semibold transition-colors duration-200 flex items-center space-x-2"
          >
            {linkCopied ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
            <span>{linkCopied ? "Copied!" : "Copy Link"}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
