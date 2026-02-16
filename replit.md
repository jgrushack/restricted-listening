# Geo-Gated Music Streaming Application

## Overview

This is a full-stack web application that provides a geo-restricted music streaming experience. The app allows users to access exclusive music tracks only when they are physically located within specific geographic boundaries. Built with a modern React frontend and Express.js backend, it demonstrates location-based content delivery with a sleek, music-focused user interface.

## System Architecture

The application follows a monorepo structure with clear separation between client and server code:

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Bundler**: Vite for fast development and optimized builds
- **UI Framework**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom music-themed color palette
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Icons**: Lucide React and React Icons for comprehensive icon coverage

### Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js for REST API
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Session Management**: Connect-pg-simple for PostgreSQL session storage
- **Development**: tsx for TypeScript execution in development

### Database Schema
The application uses PostgreSQL with the following key tables:
- **users**: User authentication and profile data
- **tracks**: Music track metadata including streaming URLs
- **geo_restrictions**: Geographic boundaries for track access control
- **artist_profiles**: Artist information and social media links

## Key Components

### Geolocation System
- **Location Verification**: HTML5 Geolocation API for precise location detection
- **Boundary Checking**: Haversine formula for distance calculations
- **Access Control**: Real-time verification against database-stored geographic restrictions
- **User Experience**: Progressive loading states with clear feedback

### Music Player Interface
- **Track Display**: Album artwork, metadata, and playback controls
- **External Integration**: Links to Spotify, YouTube, Apple Music, and SoundCloud
- **Responsive Design**: Mobile-first approach with touch-friendly controls
- **Visual Feedback**: Animated states and hover effects

### UI Components
- **Component Library**: Comprehensive set of accessible UI components
- **Theme System**: Dark mode optimized with music industry aesthetics
- **Responsive Layout**: Mobile-first design with desktop enhancements
- **Animation**: Smooth transitions and loading states

## Data Flow

1. **User Access**: User visits the application
2. **Location Request**: Browser requests geolocation permission
3. **Verification**: Location coordinates validated against database restrictions
4. **Content Delivery**: If authorized, music content becomes accessible
5. **Playback Integration**: External music service links provided for actual playback
6. **Social Sharing**: Users can share tracks through integrated social features

## External Dependencies

### Core Libraries
- **React Ecosystem**: React, React DOM, TanStack Query
- **UI Framework**: Radix UI primitives, Class Variance Authority
- **Styling**: Tailwind CSS, clsx for conditional classes
- **Database**: Drizzle ORM, Neon Database serverless driver
- **Development**: Vite, TypeScript, ESBuild

### Third-party Integrations
- **Music Platforms**: Spotify, YouTube, Apple Music, SoundCloud (via deep links)
- **Geolocation**: Browser native Geolocation API
- **Social Sharing**: Facebook and Twitter sharing APIs

## Deployment Strategy

### Development Environment
- **Runtime**: Replit with Node.js 20, PostgreSQL 16
- **Hot Reload**: Vite development server with HMR
- **Database**: Managed PostgreSQL instance
- **Port Configuration**: Frontend on 5000, auto-proxied to port 80

### Production Build
- **Frontend**: Vite build to static assets
- **Backend**: ESBuild bundle for Node.js deployment
- **Database**: Drizzle migrations for schema management
- **Deployment**: Replit Autoscale deployment target

### Environment Configuration
- **Database URL**: PostgreSQL connection string from environment
- **Session Secret**: Secure session management
- **CORS**: Configured for frontend-backend communication

## Changelog

- June 20, 2025: Initial setup and core functionality
- June 20, 2025: Simplified location verification flow for demo purposes - always grants access after 2-second verification animation, removed bypass button for cleaner UX
- June 20, 2025: Streamlined to Audius-only platform - removed all other streaming services, updated music player to show only "Connect on Audius" button with official logo
- June 20, 2025: Updated interactive map to display continental United States with proper coordinate mapping and zoom controls
- June 20, 2025: Removed redundant Audius URL field from admin form since tracks are imported directly from Audius URLs
- June 25, 2025: Restructured application flow - admin page is now homepage for creating tracks, tracks generate unique shareable links (/track/{shareId}), implemented PostgreSQL database with share ID functionality, added success state with copy-to-clipboard and link testing features
- June 26, 2025: Fixed Audius API track extraction to pull correct track information from URLs, changed default location from Portland OR to geographic center of USA (Lebanon, KS), added auto-population of city names from map pin location with manual editing capability, enabled creation of non-geo-gated tracks
- June 26, 2025: Resolved critical Audius playback error - fixed audiusTrackId data flow from admin form to database to music player, ensuring proper track streaming functionality
- June 26, 2025: Enhanced artist information system - changed "Connect on Audius" to "View on Audius", added "Follow on Audius" button, integrated real artist bio and social media links (Instagram, Twitter, TikTok) from Audius API, added conditional display for social links
- June 26, 2025: Completed comprehensive artist statistics display - added followers, following, track count, playlist count to 3-column grid layout with proper number formatting and conditional visibility
- June 26, 2025: Implemented full geo-restriction enforcement - restored real browser geolocation API, added bounds re-checking for different tracks, displays red notification banner for users outside allowed areas, hides music player and share sections when geo-restricted
- June 26, 2025: Added dynamic album artwork-based backgrounds - implemented custom color extraction from album art using canvas sampling, creates gradient backgrounds adapting to track artwork colors, added green success notification for verified geo-restricted access alongside existing red restriction banners
- June 26, 2025: Updated branding and interface - changed page title to "Restricted: Location based listening", removed previous/next track buttons from music player for cleaner interface, added "Powered by Audius" badge linking to audius.org at bottom of track pages
- June 26, 2025: Fixed notification display units - updated both red restriction and green success banners to show radius in miles instead of kilometers, properly displaying location names and converted radius values from admin setup
- June 26, 2025: Enhanced admin form messaging - updated Track Information description to clarify data is pulled from Audius but editable, improved Location Name field description with friendly example encouraging creative naming like "Town where I was born"
- June 26, 2025: Updated social media sharing text - changed Facebook and Twitter share messages to use consistent "Restricted: Location based listening" branding instead of generic track sharing text
- June 26, 2025: Fixed homepage branding consistency - updated HTML meta tags, title, and Open Graph properties to use "Restricted: Location based listening" instead of outdated "Zero Point - Can U Feel" references
- June 26, 2025: Resolved browser caching issue - added JavaScript override in main.tsx to force correct page title display, ensuring "Restricted: Location based listening" shows consistently across all browsers despite aggressive HTML caching
- June 28, 2025: Added private/unlisted Audius track support - installed axios, implemented streamUnlistedTrack and getUnlistedTrack functions, enhanced admin form with User ID and Track ID fields for accessing private tracks that don't appear in public search results

## User Preferences

Preferred communication style: Simple, everyday language.