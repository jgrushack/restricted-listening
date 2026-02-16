# Restricted: Location Based Listening

A geo-gated music streaming platform powered by [Audius](https://audius.co). Create shareable track links that only unlock when listeners are physically within a specific geographic area.

## What It Does

**Restricted** lets artists and creators attach a geographic boundary to any Audius track. When someone opens a shared link, their location is verified against the boundary before they can listen. This enables location-exclusive releases, venue-locked listening experiences, and region-specific drops.

### Key Features

- **Geo-Gated Playback** — Set a pin on the map, define a radius, and only listeners inside that area can access the track
- **Audius Integration** — Import any public or private/unlisted Audius track with full metadata, artwork, and streaming
- **Shareable Links** — Each track gets a unique URL (`/track/{shareId}`) for easy distribution
- **Dynamic Visuals** — Backgrounds automatically adapt to the album artwork's color palette
- **Artist Profiles** — Pulls bio, social links (Instagram, Twitter, TikTok), and stats directly from Audius
- **Location Feedback** — Clear notifications showing whether you're inside or outside the listening zone, with distance info
- **Social Sharing** — Built-in Facebook and Twitter sharing with branded messaging
- **Non-Restricted Mode** — Optionally create tracks without any geo-restriction

## How It Works

1. **Admin creates a track** — Paste an Audius URL (or enter User ID + Track ID for unlisted tracks), set the geographic boundary on an interactive map
2. **System generates a share link** — A unique URL is created for the track
3. **Listener opens the link** — Their browser requests location access
4. **Location is verified** — Coordinates are checked against the track's boundary using the Haversine formula
5. **Access granted or denied** — If inside the zone, the music player loads with full Audius streaming; if outside, a notification shows the restriction details

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite |
| UI | Shadcn/ui, Radix UI, Tailwind CSS |
| State | TanStack Query v5 |
| Routing | Wouter |
| Backend | Express.js, TypeScript |
| Database | PostgreSQL, Drizzle ORM |
| Music API | Audius SDK + REST API |
| Maps | Leaflet |
| Geolocation | Browser Geolocation API |

## Project Structure

```
├── client/
│   ├── src/
│   │   ├── components/       # UI components (music player, map, artist info, sharing)
│   │   ├── hooks/            # Custom hooks (geolocation, color extraction, toast)
│   │   ├── lib/              # Utilities (Audius client, geo calculations, query client)
│   │   └── pages/            # Admin (homepage) and Track (share page)
│   └── index.html
├── server/
│   ├── routes.ts             # API endpoints
│   ├── storage.ts            # Database operations
│   └── db.ts                 # Database connection
├── shared/
│   └── schema.ts             # Drizzle ORM schema + Zod validation
└── package.json
```

## Database Schema

- **tracks** — Title, artist, genre, duration, album art, Audius track/user IDs, unique share ID
- **geo_restrictions** — Center coordinates, radius (km), city name, linked to track
- **artist_profiles** — Name, bio, social handles, listener stats

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database
- npm

### Setup

```bash
# Install dependencies
npm install

# Set up environment variables
# DATABASE_URL=your_postgresql_connection_string

# Push database schema
npm run db:push

# Start development server
npm run dev
```

The app runs on port 5000 in development.

### Production Build

```bash
npm run build
npm start
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tracks` | List all tracks |
| POST | `/api/tracks` | Create a new track |
| GET | `/api/tracks/share/:shareId` | Get track by share link |
| GET | `/api/tracks/:id/geo-restrictions` | Get geo-restrictions for a track |

## License

MIT
