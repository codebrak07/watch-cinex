import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, HelpCircle, Code, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="max-w-6xl mx-auto px-4 py-16 text-neutral-400 text-xs font-sans mt-20 border-t border-white/10">
      {/* NetMirror-style Disclaimer Banner */}
      <div className="bg-neutral-900/80 border border-neutral-800 rounded-lg p-4 mb-10 text-neutral-400 leading-relaxed text-[11px] flex flex-col gap-2">
        <div className="flex items-center gap-2 text-white font-semibold text-xs">
          <Shield size={14} className="text-[#e50914]" />
          <span>Non-Hosting & Content Disclaimer</span>
        </div>
        <p>
          <strong className="text-neutral-200">WatchCineX</strong> does not host, store, upload, or transmit any video files, media, or copyrighted content on its servers. All movies, shows, and streams accessible through this platform are retrieved, embedded, or indexed from non-affiliated, publicly available third-party servers and streaming clusters (including ArtPlayer and NetMirror). WatchCineX operates strictly as a free, open-source indexing client and player interface.
        </p>
      </div>

      {/* Footer Navigation Columns */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10 leading-loose">
        <div className="flex flex-col gap-2.5">
          <span className="text-white font-medium text-[13px] mb-1">Legal & Policies</span>
          <Link to="/legal-notices" className="hover:text-white transition-colors">DMCA & Content Disclaimer</Link>
          <Link to="/terms-of-use" className="hover:text-white transition-colors">Terms of Service</Link>
          <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link to="/cookie-preferences" className="hover:text-white transition-colors">Cookie & Storage Preferences</Link>
        </div>

        <div className="flex flex-col gap-2.5">
          <span className="text-white font-medium text-[13px] mb-1">Help & Streaming</span>
          <Link to="/help-centre" className="hover:text-white transition-colors">Streaming FAQ & Help</Link>
          <Link to="/audio-description" className="hover:text-white transition-colors">Audio & Subtitle Guide</Link>
          <Link to="/corporate-information" className="hover:text-white transition-colors">Streaming Architecture</Link>
        </div>

        <div className="flex flex-col gap-2.5">
          <span className="text-white font-medium text-[13px] mb-1">About & Open Source</span>
          <Link to="/media-centre" className="hover:text-white transition-colors">About WatchCineX</Link>
          <Link to="/jobs" className="hover:text-white transition-colors">Contribute & Collaborate</Link>
          <a 
            href="https://github.com/codebrak07/watch-cinex" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:text-white transition-colors inline-flex items-center gap-1.5"
          >
            GitHub Repository
          </a>
          <Link to="/gift-cards" className="hover:text-white transition-colors">Free Forever Promise</Link>
        </div>

        <div className="flex flex-col gap-2.5">
          <span className="text-white font-medium text-[13px] mb-1">Community & Contact</span>
          <Link to="/contact-us" className="hover:text-white transition-colors">Contact & Takedowns</Link>
          <Link to="/contact-us" className="hover:text-white transition-colors">Report Broken Stream</Link>
          <Link to="/browse" className="hover:text-white transition-colors">Browse Catalog</Link>
        </div>
      </div>

      {/* Copyright & Meta */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-6 border-t border-neutral-900 text-[11px] text-neutral-500 font-mono">
        <div>
          &copy; {new Date().getFullYear()} CineX &bull; Open Source Free Movie Streamer
        </div>
        <div className="text-neutral-400">
          Ready to Collaborate &bull; Built with React &amp; Tailwind
        </div>
      </div>
    </footer>
  );
}

