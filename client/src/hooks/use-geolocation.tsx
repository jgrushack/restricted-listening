import { useState, useEffect } from "react";
import { getCurrentPosition, isWithinBounds, type LocationData, type GeographicBounds } from "@/lib/geo-utils";

export type LocationVerificationState = 
  | "idle"
  | "requesting-permission"
  | "checking"
  | "verified"
  | "denied"
  | "error"
  | "outside-bounds";

export interface UseGeolocationResult {
  state: LocationVerificationState;
  location: LocationData | null;
  error: string | null;
  requestLocation: () => void;
  retry: () => void;
}

interface UseGeolocationOptions {
  bounds?: GeographicBounds;
  autoRequest?: boolean;
}

export function useGeolocation(options: UseGeolocationOptions = {}): UseGeolocationResult {
  const { bounds, autoRequest = false } = options;
  const [state, setState] = useState<LocationVerificationState>("idle");
  const [location, setLocation] = useState<LocationData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const requestLocation = async () => {
    setState("requesting-permission");
    setError(null);

    try {
      // Request actual geolocation from browser
      const userLocation = await getCurrentPosition();
      setState("checking");
      setLocation(userLocation);

      // Check if location is within bounds if bounds are provided
      if (bounds) {
        if (isWithinBounds(userLocation, bounds)) {
          setState("verified");
        } else {
          setState("outside-bounds");
        }
      } else {
        // No restrictions - always verify
        setState("verified");
      }
    } catch (error: any) {
      console.error("Geolocation error:", error);
      
      if (error.message.includes("denied") || error.message.includes("permission")) {
        setState("denied");
        setError("Location access was denied. Please enable location services to access this content.");
      } else {
        setState("error");
        setError("Unable to get your location. Please check your browser settings and try again.");
      }
    }
  };

  const retry = () => {
    setError(null);
    requestLocation();
  };

  useEffect(() => {
    if (autoRequest && state === "idle") {
      requestLocation();
    }
  }, [autoRequest, state]);

  // Re-check location when bounds change (new track with different restrictions)
  useEffect(() => {
    if (bounds && location) {
      const withinBounds = isWithinBounds(location, bounds);
      
      if (withinBounds) {
        setState("verified");
      } else {
        setState("outside-bounds");
      }
    } else if (!bounds && location) {
      // No restrictions - always verify
      setState("verified");
    }
  }, [bounds, location]);

  return {
    state,
    location,
    error,
    requestLocation,
    retry,
  };
}
