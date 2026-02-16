import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Music, MapPin, Plus, Save, Link, Copy, ExternalLink } from "lucide-react";
import InteractiveMap from "@/components/interactive-map";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertTrackSchema, insertGeoRestrictionSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { getAudiusTrack, getTrackIdFromUrl, getAudiusUser, getUnlistedTrack } from "@/lib/audius-client";
import { z } from "zod";

const trackFormSchema = insertTrackSchema.extend({
  geoRestriction: z
    .object({
      enabled: z.boolean(),
      centerLat: z.number().min(-90).max(90),
      centerLng: z.number().min(-180).max(180),
      radiusMiles: z.number().min(1).max(6214), // Max ~10000 km in miles
      locationName: z.string().min(1),
    })
    .optional(),
});

type TrackFormData = z.infer<typeof trackFormSchema>;

export default function Admin() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [audiusUrl, setAudiusUrl] = useState("");
  const [isLoadingFromAudius, setIsLoadingFromAudius] = useState(false);
  const [audiusUserId, setAudiusUserId] = useState("");
  const [audiusTrackId, setAudiusTrackId] = useState("");
  const [isLoadingUnlisted, setIsLoadingUnlisted] = useState(false);
  const [createdTrack, setCreatedTrack] = useState<any>(null);
  const [currentAudiusTrackId, setCurrentAudiusTrackId] = useState<string | null>(null);
  const [currentAudiusUserId, setCurrentAudiusUserId] = useState<string | null>(null);

  // Function to get city name from coordinates using reverse geocoding
  const getCityFromCoordinates = async (lat: number, lng: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
      );
      const data = await response.json();
      
      if (data.city && data.principalSubdivisionCode) {
        return `${data.city}, ${data.principalSubdivisionCode}`;
      } else if (data.locality && data.principalSubdivisionCode) {
        return `${data.locality}, ${data.principalSubdivisionCode}`;
      } else if (data.principalSubdivision && data.countryCode) {
        return `${data.principalSubdivision}, ${data.countryCode}`;
      }
      
      return "Unknown Location";
    } catch (error) {
      console.error("Error getting city name:", error);
      return "Unknown Location";
    }
  };

  const form = useForm<TrackFormData>({
    resolver: zodResolver(trackFormSchema),
    defaultValues: {
      title: "",
      artist: "",
      genre: "",
      duration: "",
      albumArt: "",
      audiusUrl: "",
      geoRestriction: {
        enabled: false,
        centerLat: 39.0458, // Geographic center of USA (near Lebanon, Kansas)
        centerLng: -98.2348,
        radiusMiles: 31, // ~50km in miles
        locationName: "Lebanon, KS",
      },
    },
  });

  // Function to extract track data from Audius URL
  const extractAudiusData = async (url: string) => {
    try {
      // Get the exact track ID from the URL
      const trackId = await getTrackIdFromUrl(url);
      if (!trackId) {
        throw new Error("Could not find the exact track from this URL. Please verify the Audius link is correct and the track exists.");
      }

      console.log("Found track ID:", trackId);
      
      // Get the track data using the exact ID
      const trackData = await getAudiusTrack(trackId);
      if (!trackData) {
        throw new Error("Could not retrieve track data. The track may not exist or be accessible.");
      }

      console.log("Retrieved track data:", trackData);

      // Format duration from seconds to MM:SS
      const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
      };

      // Get the best quality artwork
      const getArtwork = () => {
        if (trackData.artwork?.["1000x1000"]) return trackData.artwork["1000x1000"];
        if (trackData.artwork?.["480x480"]) return trackData.artwork["480x480"];
        if (trackData.artwork?.["150x150"]) return trackData.artwork["150x150"];
        return "https://via.placeholder.com/400x400/8b5cf6/ffffff?text=No+Image";
      };

      return {
        title: trackData.title,
        artist: trackData.user.name,
        genre: trackData.genre || "Electronic",
        duration: formatDuration(trackData.duration),
        albumArt: getArtwork(),
        audiusTrackId: trackData.id, // Store the actual track ID for streaming
        audiusUserId: trackData.user.id, // Store the user ID for artist data
      };
    } catch (error) {
      console.error("Error extracting Audius data:", error);
      throw new Error(`Failed to extract track data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleLoadUnlistedTrack = async () => {
    if (!audiusUserId || !audiusTrackId) {
      toast({
        title: "Error",
        description: "Please enter both User ID and Track ID",
        variant: "destructive",
      });
      return;
    }

    setIsLoadingUnlisted(true);
    try {
      const result = await getUnlistedTrack(audiusUserId, audiusTrackId);
      if (!result) {
        throw new Error("Could not access unlisted track. Check User ID and Track ID are correct.");
      }

      const { track } = result;
      
      // Format duration from seconds to MM:SS
      const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
      };

      // Get the best quality artwork
      const getArtwork = () => {
        if (track.artwork?.["1000x1000"]) return track.artwork["1000x1000"];
        if (track.artwork?.["480x480"]) return track.artwork["480x480"];
        if (track.artwork?.["150x150"]) return track.artwork["150x150"];
        return "https://via.placeholder.com/400x400/8b5cf6/ffffff?text=No+Image";
      };

      // Populate form with extracted data
      form.setValue("title", track.title);
      form.setValue("artist", track.user.name);
      form.setValue("genre", track.genre || "Electronic");
      form.setValue("duration", formatDuration(track.duration));
      form.setValue("albumArt", getArtwork());
      
      // Store the track ID for later use
      setCurrentAudiusTrackId(audiusTrackId);
      
      toast({
        title: "Success",
        description: "Unlisted track loaded successfully",
      });
    } catch (error) {
      console.error("Error loading unlisted track:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load unlisted track",
        variant: "destructive",
      });
    } finally {
      setIsLoadingUnlisted(false);
    }
  };

  const handleLoadFromAudius = async () => {
    if (!audiusUrl) {
      toast({
        title: "Error",
        description: "Please enter an Audius URL first",
        variant: "destructive",
      });
      return;
    }

    setIsLoadingFromAudius(true);
    try {
      const trackData = await extractAudiusData(audiusUrl);
      
      // Populate form with extracted data
      form.setValue("title", trackData.title);
      form.setValue("artist", trackData.artist);
      form.setValue("genre", trackData.genre);
      form.setValue("duration", trackData.duration);
      form.setValue("albumArt", trackData.albumArt);
      form.setValue("audiusUrl", audiusUrl);
      
      // Store the track ID and user ID for later use
      setCurrentAudiusTrackId(trackData.audiusTrackId);
      setCurrentAudiusUserId(trackData.audiusUserId);

      toast({
        title: "Success!",
        description: "Track data loaded from Audius URL",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load track data",
        variant: "destructive",
      });
    } finally {
      setIsLoadingFromAudius(false);
    }
  };

  // Handle map location selection
  const handleLocationSelect = async (lat: number, lng: number) => {
    form.setValue("geoRestriction.centerLat", lat);
    form.setValue("geoRestriction.centerLng", lng);
    
    // Auto-populate city name
    const cityName = await getCityFromCoordinates(lat, lng);
    form.setValue("geoRestriction.locationName", cityName);
  };

  const createTrackMutation = useMutation({
    mutationFn: async (data: TrackFormData) => {
      // First create the track
      const trackData = {
        title: data.title,
        artist: data.artist,
        genre: data.genre,
        duration: data.duration,
        albumArt: data.albumArt,
        audiusUrl: data.audiusUrl || null,
        audiusTrackId: currentAudiusTrackId,
        audiusUserId: currentAudiusUserId,
      };

      const track = await apiRequest("/api/tracks", "POST", trackData);

      // If geo restriction is enabled, create it
      if (data.geoRestriction?.enabled) {
        const geoData = {
          trackId: track.id,
          centerLat: data.geoRestriction.centerLat,
          centerLng: data.geoRestriction.centerLng,
          radiusKm: data.geoRestriction.radiusMiles * 1.60934, // Convert miles to km for storage
          cityName: data.geoRestriction.locationName,
          isActive: true,
        };

        await apiRequest("/api/geo-restrictions", "POST", geoData);
      }

      return track;
    },
    onSuccess: (track) => {
      setCreatedTrack(track);
      const isGeoGated = form.getValues("geoRestriction.enabled");
      toast({
        title: "Success!",
        description: isGeoGated 
          ? "Geo-gated track created successfully! Your shareable link is ready."
          : "Track created successfully! Your shareable link is ready.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tracks"] });
    },
    onError: (error) => {
      console.error("Error creating track:", error);
      toast({
        title: "Error",
        description: "Failed to create track. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: TrackFormData) => {
    setIsSubmitting(true);
    try {
      await createTrackMutation.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Link copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please copy the link manually",
        variant: "destructive",
      });
    }
  };

  const createNewTrack = () => {
    setCreatedTrack(null);
    form.reset();
    setAudiusUrl("");
    setCurrentAudiusTrackId(null);
    setCurrentAudiusUserId(null);
  };

  // Show success state with shareable link
  if (createdTrack) {
    const shareUrl = `${window.location.origin}/track/${createdTrack.shareId}`;
    
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Music className="h-8 w-8 text-music-purple" />
            <h1 className="text-3xl font-bold">Track Created Successfully!</h1>
          </div>

          <Card className="bg-gray-900 border-gray-700 mb-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Link className="h-5 w-5 text-music-purple" />
                Your Shareable Link
              </CardTitle>
              <CardDescription className="text-gray-400">
                Share this link to give access to your geo-gated track
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={shareUrl}
                  readOnly
                  className="bg-gray-800 border-gray-600 text-white flex-1"
                />
                <Button
                  type="button"
                  onClick={() => copyToClipboard(shareUrl)}
                  className="bg-music-purple hover:bg-music-purple-light"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={() => window.open(shareUrl, '_blank')}
                  variant="outline"
                  className="border-music-purple text-music-purple hover:bg-music-purple hover:text-white"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Go to Track
                </Button>
                <Button
                  type="button"
                  onClick={createNewTrack}
                  className="bg-music-purple hover:bg-music-purple-light"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Another Track
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Track Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-gray-300"><strong>Title:</strong> {createdTrack.title}</p>
              <p className="text-gray-300"><strong>Artist:</strong> {createdTrack.artist}</p>
              <p className="text-gray-300"><strong>Genre:</strong> {createdTrack.genre}</p>
              <p className="text-gray-300"><strong>Share ID:</strong> {createdTrack.shareId}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Music className="h-8 w-8 text-music-purple" />
          <h1 className="text-3xl font-bold">Restricted: Location based listening</h1>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-6">
            {/* Audius URL Section */}
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Link className="h-5 w-5 text-music-purple" />
                  Import from Audius
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Enter an Audius track URL to automatically populate track information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={audiusUrl}
                    onChange={(e) => setAudiusUrl(e.target.value)}
                    placeholder="https://audius.co/artist/track-name"
                    className="bg-gray-800 border-gray-600 text-white flex-1"
                  />
                  <Button
                    type="button"
                    onClick={handleLoadFromAudius}
                    disabled={isLoadingFromAudius || !audiusUrl}
                    className="bg-music-purple hover:bg-music-purple-light"
                  >
                    {isLoadingFromAudius ? "Loading..." : "Load Track Data"}
                  </Button>
                </div>
                
                <Separator className="bg-gray-600" />
                
                <div className="space-y-3">
                  <div className="text-sm text-gray-400">
                    For private/unlisted tracks, enter your User ID and Track ID directly:
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <Input
                      value={audiusUserId}
                      onChange={(e) => setAudiusUserId(e.target.value)}
                      placeholder="Your Audius User ID"
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                    <Input
                      value={audiusTrackId}
                      onChange={(e) => setAudiusTrackId(e.target.value)}
                      placeholder="Track ID"
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={handleLoadUnlistedTrack}
                    disabled={isLoadingUnlisted || !audiusUserId || !audiusTrackId}
                    className="bg-music-purple hover:bg-music-purple-light w-full"
                  >
                    {isLoadingUnlisted ? "Loading..." : "Load Private Track"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Track Information */}
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Track Information</CardTitle>
                <CardDescription className="text-gray-400">
                  Basic track details and metadata - this info is pulled from the track but you can edit it
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Track Title</FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-gray-800 border-gray-600 text-white" placeholder="Enter track title" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="artist"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Artist</FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-gray-800 border-gray-600 text-white" placeholder="Enter artist name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="genre"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Genre</FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-gray-800 border-gray-600 text-white" placeholder="Enter genre" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Duration</FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-gray-800 border-gray-600 text-white" placeholder="e.g., 3:45" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="albumArt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Album Art URL</FormLabel>
                      <FormControl>
                        <Input {...field} className="bg-gray-800 border-gray-600 text-white" placeholder="Enter album art URL" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>



            {/* Geographic Restrictions */}
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <MapPin className="h-5 w-5 text-music-purple" />
                  Geographic Restrictions
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Configure location-based access control for this track
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="geoRestriction.enabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-700 p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base text-white">Enable Geographic Restrictions</FormLabel>
                        <FormDescription className="text-gray-400">
                          Restrict access to this track based on user location
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {form.watch("geoRestriction.enabled") && (
                  <div className="space-y-4 border-l-2 border-music-purple pl-4">
                    <FormField
                      control={form.control}
                      name="geoRestriction.locationName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Location Name</FormLabel>
                          <FormControl>
                            <Input {...field} className="bg-gray-800 border-gray-600 text-white" placeholder="e.g., Lebanon, KS" />
                          </FormControl>
                          <FormDescription className="text-gray-400">
                            Auto-populated when you select a location on the map, but you can rename it. ex, "Town where I was born"
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Interactive Map */}
                    <InteractiveMap
                      centerLat={form.watch("geoRestriction.centerLat") || 39.0458}
                      centerLng={form.watch("geoRestriction.centerLng") || -98.2348}
                      radiusMiles={form.watch("geoRestriction.radiusMiles") || 31}
                      onLocationSelect={handleLocationSelect}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="geoRestriction.centerLat"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Latitude</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="number"
                                step="any"
                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                className="bg-gray-800 border-gray-600 text-white"
                                placeholder="39.0458"
                                readOnly
                              />
                            </FormControl>
                            <FormDescription className="text-gray-400">
                              Click on map to set location
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="geoRestriction.centerLng"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Longitude</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="number"
                                step="any"
                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                className="bg-gray-800 border-gray-600 text-white"
                                placeholder="-98.2348"
                                readOnly
                              />
                            </FormControl>
                            <FormDescription className="text-gray-400">
                              Click on map to set location
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="geoRestriction.radiusMiles"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Radius (Miles)</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="number"
                                min="1"
                                max="6214"
                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                className="bg-gray-800 border-gray-600 text-white"
                                placeholder="31"
                              />
                            </FormControl>
                            <FormDescription className="text-gray-400">
                              Adjust radius to see changes on map
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-music-purple hover:bg-music-purple-light px-8 py-2"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? "Creating Track..." : "Create Track"}
              </Button>
            </div>
          </div>
        </form>
        </Form>
      </div>
    </div>
  );
}