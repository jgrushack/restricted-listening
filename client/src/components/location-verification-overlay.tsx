import { Button } from "@/components/ui/button";
import { MapPin, Shield, XCircle, AlertTriangle, CheckCircle2 } from "lucide-react";
import { type LocationVerificationState } from "@/hooks/use-geolocation";

interface LocationVerificationOverlayProps {
  state: LocationVerificationState;
  error: string | null;
  onRequestLocation: () => void;
  onRetry: () => void;
  isVisible: boolean;
}

export default function LocationVerificationOverlay({
  state,
  error,
  onRequestLocation,
  onRetry,
  isVisible,
}: LocationVerificationOverlayProps) {
  if (!isVisible) return null;

  const renderStateContent = () => {
    switch (state) {
      case "idle":
        return (
          <div className="text-center">
            <div className="mb-6">
              <Shield className="h-16 w-16 text-music-purple mx-auto" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Location Access Required</h2>
            <p className="text-music-light-gray mb-6">
              This content is geo-restricted to Portland, OR. Please allow location access to verify your location.
            </p>
            <Button 
              onClick={onRequestLocation}
              className="bg-music-purple hover:bg-music-purple-light px-6 py-3 rounded-full font-semibold"
            >
              Allow Location Access
            </Button>
          </div>
        );

      case "checking":
        return (
          <div className="text-center">
            <div className="mb-6">
              <MapPin className="h-16 w-16 text-music-purple mx-auto animate-pulse-slow" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Verifying Location</h2>
            <p className="text-music-light-gray mb-6">
              We're checking your location to ensure you can access this exclusive content...
            </p>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-music-purple"></div>
            </div>
          </div>
        );

      case "requesting-permission":
        // This case is now handled by "idle"
        return null;

      case "outside-bounds":
      case "denied":
        return (
          <div className="text-center">
            <div className="mb-6">
              <XCircle className="h-16 w-16 text-red-500 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Access Restricted</h2>
            <p className="text-music-light-gray mb-6">
              {error || "Sorry, this content is not available in your current location."}
            </p>
            <Button 
              onClick={onRetry}
              className="bg-gray-600 hover:bg-gray-500 px-6 py-3 rounded-full font-semibold"
            >
              Retry
            </Button>
          </div>
        );

      case "error":
        return (
          <div className="text-center">
            <div className="mb-6">
              <AlertTriangle className="h-16 w-16 text-orange-500 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Location Error</h2>
            <p className="text-music-light-gray mb-6">
              {error || "Unable to access your location. Please check your browser settings and try again."}
            </p>
            <Button 
              onClick={onRetry}
              className="bg-music-purple hover:bg-music-purple-light px-6 py-3 rounded-full font-semibold"
            >
              Try Again
            </Button>
          </div>
        );

      case "verified":
        return (
          <div className="text-center">
            <div className="mb-6">
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Location Verified</h2>
            <p className="text-music-light-gray mb-6">
              Welcome! You have access to this exclusive content.
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className="bg-music-darker rounded-2xl p-8 max-w-md mx-4 border border-gray-800">
        {renderStateContent()}
      </div>
    </div>
  );
}
