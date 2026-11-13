# CineX

CineX is an open source, free movie and TV show streaming web platform built with React, Vite, and Tailwind CSS. It features a Netflix-inspired interface, multi-source streaming with automatic failover, and persistent authentication powered by Firebase.

---

## Overview

CineX provides a fluid media streaming experience with a modern UI. It integrates external video playback providers, catalog metadata from TMDB, and an in-app profile selection workflow directly on `/browse`.

Open source and community-driven, CineX is open for collaboration. Developers, designers, and contributors are welcome to participate and help enhance the platform.

---

## Features

- **Free Movie & TV Streaming**: Stream movies and series across multiple servers with built-in backup and failover mechanisms (ArtPlayer and NetMirror).
- **In-App Landing & Profile Switcher**: Interactive "Who's watching?" landing screen integrated directly on `/browse` with dynamic, smooth cross-fading show backdrops.
- **Firebase Authentication**: Persistent user sessions with support for Google Sign-In and Email/Password authentication.
- **Account-Based Profile Management**: Automatically filters and displays saved logged-in accounts, profile lock PINs, and custom avatars.
- **TMDB Catalog Integration**: Browse trending movies, top-rated TV series, category carousels, detailed metadata, and trailers.
- **Search & Watchlist**: Fast content discovery and persistent personal favorites list.
- **Responsive Design**: Mobile-friendly, high-contrast dark theme built with Tailwind CSS.

---

## Tech Stack

- **Frontend**: React 19, Vite
- **Styling**: Tailwind CSS, Lucide React Icons
- **Backend & Auth**: Firebase Auth (Persistence, Google Sign-In, Password Reset)
- **Metadata API**: The Movie Database (TMDB) API
- **Video Playback**: ArtPlayer custom player integration, NetMirror streaming cluster
- **Deployment**: Vercel / Netlify / Node.js serverless functions

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
   Create a `.env` file in the project root with the following keys:
   ```env
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_firebase_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   VITE_TMDB_API_KEY=your_tmdb_api_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Build for production:
   ```bash
   npm run build
   ```

---

## Contributing and Collaboration

We are ready to collaborate! Whether you want to add new streaming scrapers, improve the UI/UX, optimize playback performance, or fix bugs, your contributions are welcome.

### How to Contribute:
1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/your-feature-name`).
3. Commit your changes (`git commit -m "Add new feature"`).
4. Push to the branch (`git push origin feature/your-feature-name`).
5. Open a Pull Request detailing your changes.

Feel free to open an Issue for bug reports, discussions, or feature suggestions.

---

## Disclaimer

This project is developed for educational and research purposes only. CineX does not host, upload, or control any media files or streams; all content is retrieved from publicly available third-party sources and services on the internet. Please comply with the copyright laws and terms of service applicable in your jurisdiction.

---

## License

This project is open source and available under the MIT License.
