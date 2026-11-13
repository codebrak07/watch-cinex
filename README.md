# WatchCineX

WatchCineX is an open source, free movie and TV show streaming web platform built with React, Vite, and Tailwind CSS. It features a Netflix-inspired interface, multi-server distributed streaming with transparent automatic failover, multi-language dubbed audio switching, and persistent authentication powered by Firebase.

Open source and community-driven, WatchCineX is ready to collaborate. Developers, designers, and contributors worldwide are welcome to participate, build new features, and enhance the streaming ecosystem.

---

## Key Highlights

- **Open Source Free Movie Streamer**: Stream movies and series across high-performance distributed streaming clusters with zero paywalls, subscriptions, or intrusive ads.
- **Ready to Collaborate**: Open codebase welcoming pull requests for new streaming mirrors, UI enhancements, multi-language audio parsers, and performance optimizations.
- **In-App Landing & Profile Switcher**: Interactive "Who's watching?" screen integrated directly on `/browse` featuring dynamic cross-fading backdrops of popular shows with zero routing flickers.
- **Multi-Server Streaming with Instant Failover**: Dual-cluster architecture (Primary High-Speed and Backup Cluster) that transparently recovers streams without breaking playback.
- **Multi-Language Dubbed Audio**: On-the-fly switching between Original Soundtrack, Hindi Dubbed, English, and other regional audio tracks.
- **Firebase Authentication & Session Persistence**: Secure Google Sign-In and Email/Password authentication with browser-local persistence so you stay logged in across reloads.
- **Built-in AdShield**: Active client-side anti-popup shield that blocks ad links, middle-click hijacks, and synthetic click dispatches.
- **TMDB Catalog Integration**: Real-time trending movies, top-rated TV series, category carousels, genre filtering, and trailers.
- **Local Storage Privacy**: Personal watchlists, profile PIN locks, and preferences are stored client-side in browser storage. Zero tracking or telemetry.

---

## Architecture Overview

```text
[ Browser / Client ]
        |
        +--> React Router (SPA with Vercel rewrites: /browse, /movies, /anime, /favorites)
        |
        +--> AuthContext (Firebase Google OAuth & Email Session Persistence)
        |
        +--> Catalog Layer (TMDB API via serverless proxy /api/tmdb/*)
        |
        +--> Video Playback Modal
                 |
                 +--> Server 1 (Primary High-Speed Cluster via /api/dubbed-player)
                 |         | (If Server 1 Busy or buffering)
                 |         v
                 +--> Server 2 (Backup Redundant Cluster with Auto-Failover)
```

---

## Tech Stack

- **Client Framework**: React 19, Vite
- **Styling & Motion**: Tailwind CSS, Framer Motion, Lucide Icons
- **Authentication**: Firebase Authentication (Google Identity Platform, Local Persistence)
- **Metadata Provider**: The Movie Database (TMDB) API
- **Video Player**: Custom responsive HTML5 video player engine with HLS and MPD stream support
- **Hosting & Serverless**: Vercel Serverless Edge Functions

---

## Getting Started

### Prerequisites

- Node.js (version 18 or higher recommended)
- npm or yarn
- TMDB API Key
- Firebase Project configuration

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/codebrak07/watch-cinex.git
   cd watch-cinex
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Create a `.env` file in the project root based on `.env.example`:
   ```env
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_firebase_app_id
   VITE_TMDB_API_KEY=your_tmdb_api_key
   ```

4. Run the local development server:
   ```bash
   npm run dev
   ```

5. Build for production:
   ```bash
   npm run build
   ```

---

## Deployment on Vercel

WatchCineX includes pre-configured SPA routing and API proxies in `vercel.json`:

```json
{
  "rewrites": [
    {
      "source": "/api/tmdb/:path*",
      "destination": "https://api.themoviedb.org/3/:path*"
    },
    {
      "source": "/((?!api/).*)",
      "destination": "/index.html"
    }
  ]
}
```

This configuration ensures:
1. Direct navigation and refreshes on routes like `/browse`, `/movies`, and `/anime` work without 404 errors.
2. Serverless proxy routes under `/api/` continue to execute without conflict.

---

## Player Keyboard Controls

- **Spacebar / K**: Play or Pause playback
- **Left Arrow (<-)**: Rewind 10 seconds
- **Right Arrow (->)**: Fast-forward 10 seconds
- **F**: Toggle Fullscreen mode
- **M**: Mute or Unmute audio
- **Escape**: Close video player modal

---

## Contributing and Collaboration

We are ready to collaborate! Whether you want to add new streaming scrapers, improve the UI/UX, optimize mobile touch controls, or fix bugs, your contributions are welcome.

### How to Contribute:
1. Fork the repository on GitHub.
2. Create your feature branch (`git checkout -b feature/your-feature-name`).
3. Commit your changes (`git commit -m "feat: add new feature"`).
4. Push to the branch (`git push origin feature/your-feature-name`).
5. Open a Pull Request detailing your changes.

Feel free to open an Issue for bug reports, discussions, or feature suggestions.

---

## Non-Hosting Disclaimer

WatchCineX does not host, upload, store, or transmit any video files, movies, TV episodes, or media on its servers. All media is retrieved, embedded, or streamed directly from non-affiliated third-party servers and public streaming clusters. WatchCineX operates strictly as a free, open-source indexing client and player interface.

---

## License

This project is open source and available under the MIT License.
