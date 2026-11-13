import React, { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Shield, FileText, HelpCircle, Volume2, Database, Mail, Code, Info, Heart, CheckCircle2, AlertTriangle, ExternalLink, Sparkles, Terminal, Cpu } from 'lucide-react';
import logoImg from '../assets/cinex.png';
import Footer from './Footer';

export default function SampleInfoPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;

  // Guarantee that navigating to any documentation page opens at the top
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [path]);

  const getPageData = () => {
    switch (path) {
      case '/legal-notices':
        return {
          title: 'DMCA & Non-Hosting Content Disclaimer',
          subtitle: 'Legal guidelines regarding content indexing, third-party media nodes, and copyright compliance.',
          icon: <Shield size={32} className="text-[#e50914]" />,
          content: (
            <div className="space-y-8 text-neutral-300 text-sm leading-relaxed">
              <div className="bg-red-950/30 border border-red-800/40 p-5 rounded-xl flex items-start gap-3 shadow-lg">
                <AlertTriangle size={22} className="text-[#e50914] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-white font-bold text-sm">Fundamental Non-Hosting Policy</h4>
                  <p className="text-neutral-300 text-xs md:text-sm">
                    WatchCineX does not host, store, upload, copy, or transmit any video files, media streams, movies, or TV episodes on its servers. We do not own, control, or distribute any media played on this platform. All content is retrieved, embedded, or indexed from external, non-affiliated third-party servers and public streaming clusters.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h2 className="text-white text-lg font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#e50914]" />
                  1. Nature of the Service &amp; Indexing Functionality
                </h2>
                <p>
                  WatchCineX operates exclusively as an open-source web-based media client and aggregator. It provides a modern, user-friendly interface that allows users to discover publicly available entertainment media on the World Wide Web.
                </p>
                <p>
                  The video players embedded within WatchCineX act merely as viewing conduits that load media links from public web servers. WatchCineX does not operate physical storage arrays, video-on-demand content distribution networks (CDNs), or media transcoding pipelines for copyrighted videos. Consequently, WatchCineX possesses neither the technical ability nor the legal custody to alter, delete, or take down files stored on third-party file-hosting infrastructures.
                </p>
              </div>

              <div className="space-y-3">
                <h2 className="text-white text-lg font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#e50914]" />
                  2. Digital Millennium Copyright Act (DMCA) Guidelines
                </h2>
                <p>
                  We maintain strict adherence to intellectual property laws and respect the legitimate rights of copyright holders globally. If you believe your copyrighted material is being streamed without authorization:
                </p>
                <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 space-y-2 text-xs text-neutral-300">
                  <p>
                    <strong className="text-white">Primary Action: Contact File Hosts.</strong> Because video files are hosted on independent third-party servers, contacting WatchCineX cannot remove the video from the Internet. To permanently stop infringement, takedown notices must be served to the actual file host or hosting service provider where the media is physically stored.
                  </p>
                  <p>
                    <strong className="text-white">Secondary Action: Index Removal.</strong> If you represent an authorized copyright owner and request that a title reference or metadata pointer be removed from WatchCineX&apos;s search index, our team will expeditiously process valid takedown requests submitted to our contact channel.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h2 className="text-white text-lg font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#e50914]" />
                  3. Requirements for Valid Index Takedown Notices
                </h2>
                <p>
                  To request the removal of an index reference from WatchCineX, your written communication must include:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-xs text-neutral-400">
                  <li>Identification of the copyrighted work claimed to have been infringed.</li>
                  <li>The exact URL or title entry on WatchCineX that you request to have unindexed.</li>
                  <li>Evidence demonstrating that you are the copyright holder or authorized to act on behalf of the owner.</li>
                  <li>Sufficient contact information including your legal name, organization, physical address, email address, and telephone number.</li>
                  <li>A statement made under penalty of perjury that the information provided in the notice is accurate.</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h2 className="text-white text-lg font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#e50914]" />
                  4. Trademarks &amp; Attribution
                </h2>
                <p>
                  All product names, logos, brands, trademarks, and registered trademarks featured or referenced within WatchCineX are the property of their respective owners. Their inclusion does not imply any affiliation with, endorsement by, or sponsorship of WatchCineX.
                </p>
              </div>
            </div>
          )
        };

      case '/terms-of-use':
        return {
          title: 'Terms of Service',
          subtitle: 'General conditions governing non-commercial access, user responsibility, and software licensing.',
          icon: <FileText size={32} className="text-[#e50914]" />,
          content: (
            <div className="space-y-8 text-neutral-300 text-sm leading-relaxed">
              <div className="space-y-3">
                <h2 className="text-white text-lg font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#e50914]" />
                  1. Acceptance &amp; Scope of Terms
                </h2>
                <p>
                  By visiting, browsing, or utilizing WatchCineX, you explicitly acknowledge and agree to comply with these Terms of Service. If you do not agree to all terms outlined herein, your sole remedy is to cease using the platform immediately.
                </p>
                <p>
                  WatchCineX is an open-source software project developed exclusively for research, education, and personal entertainment. The application code is maintained collaboratively by public contributors under open source standards.
                </p>
              </div>

              <div className="space-y-3">
                <h2 className="text-white text-lg font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#e50914]" />
                  2. 100% Free Access &amp; No Hidden Charges
                </h2>
                <p>
                  WatchCineX is free to access. We do not require, offer, or solicit:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-xs text-neutral-400">
                  <li>Paid subscription plans or membership tiers.</li>
                  <li>Credit card, bank account, or payment processing details.</li>
                  <li>Gift card redemptions, premium unlock fees, or paywalls.</li>
                </ul>
                <p className="text-xs text-neutral-400">
                  Any third-party website, application, or entity attempting to charge fees under the name &quot;WatchCineX&quot; or &quot;CineX&quot; is fraudulent and unaffiliated with this project.
                </p>
              </div>

              <div className="space-y-3">
                <h2 className="text-white text-lg font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#e50914]" />
                  3. Individual User Responsibility
                </h2>
                <p>
                  Users bear sole responsibility for ensuring that their access to public streams conforms with all statutory regulations and intellectual property laws applicable in their local jurisdiction. WatchCineX does not endorse, encourage, or facilitate the unauthorized distribution or viewing of copyrighted material.
                </p>
              </div>

              <div className="space-y-3">
                <h2 className="text-white text-lg font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#e50914]" />
                  4. Disclaimer of Service Guarantees
                </h2>
                <p>
                  WatchCineX is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis without warranties of any kind, whether express, implied, or statutory. Because media feeds originate from external decentralized servers, WatchCineX does not guarantee:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-xs text-neutral-400">
                  <li>Uninterrupted or error-free video stream playback.</li>
                  <li>Specific audio track synchronization or video resolution.</li>
                  <li>Permanent availability of any given movie, show, or season.</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h2 className="text-white text-lg font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#e50914]" />
                  5. Open Source License &amp; Contributions
                </h2>
                <p>
                  The front-end client architecture, layout styling, and proxy router are built on modern web standards. You are welcome to collaborate and share improvements with the team.
                </p>
              </div>
            </div>
          )
        };

      case '/privacy':
        return {
          title: 'Privacy Policy',
          subtitle: 'Our strict zero-telemetry policy, client-side authentication, and local browser storage.',
          icon: <Shield size={32} className="text-[#e50914]" />,
          content: (
            <div className="space-y-8 text-neutral-300 text-sm leading-relaxed">
              <div className="bg-emerald-950/30 border border-emerald-800/40 p-5 rounded-xl shadow-lg">
                <h3 className="text-white font-bold mb-1.5 text-sm flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-emerald-400" />
                  Privacy-First &amp; Zero Tracking Commitment
                </h3>
                <p className="text-neutral-300 text-xs md:text-sm">
                  WatchCineX is built with a deep commitment to user privacy. We do not sell, license, or monetize your viewing habits. We do not use third-party tracking pixels, behavioural analytics suites, or ad network profiling tokens.
                </p>
              </div>

              <div className="space-y-3">
                <h2 className="text-white text-lg font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#e50914]" />
                  1. Authentication &amp; Account Persistence
                </h2>
                <p>
                  When you sign in with Google or create an account with email and password, authentication is processed client-side via Firebase Authentication (powered by Google Identity Platform).
                </p>
                <p>
                  Your authentication credentials are verified directly through encrypted Google endpoints. We retain only your authenticated email identifier in browser session storage so that your login persists across visits without re-prompting.
                </p>
              </div>

              <div className="space-y-3">
                <h2 className="text-white text-lg font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#e50914]" />
                  2. Local Browser Storage (localStorage)
                </h2>
                <p>
                  All your personalized settings, custom profiles, and favorites lists live entirely within your own browser using <code className="text-red-400 bg-neutral-900 px-1.5 py-0.5 rounded text-xs">localStorage</code>. This data never touches an external analytics database:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                  <div className="bg-neutral-900 border border-neutral-800 p-3.5 rounded-lg">
                    <span className="text-white font-mono text-xs font-bold block mb-1">cinex_auth_user</span>
                    <p className="text-neutral-400 text-xs">Caches your authenticated session snapshot to keep you logged in across browser refreshes.</p>
                  </div>
                  <div className="bg-neutral-900 border border-neutral-800 p-3.5 rounded-lg">
                    <span className="text-white font-mono text-xs font-bold block mb-1">cinex_active_profile</span>
                    <p className="text-neutral-400 text-xs">Remembers your currently selected profile avatar and name on the landing showcase.</p>
                  </div>
                  <div className="bg-neutral-900 border border-neutral-800 p-3.5 rounded-lg">
                    <span className="text-white font-mono text-xs font-bold block mb-1">netflix_favorites</span>
                    <p className="text-neutral-400 text-xs">Maintains your curated list of bookmarked movies and series locally in your browser.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h2 className="text-white text-lg font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#e50914]" />
                  3. External API &amp; Server Interactions
                </h2>
                <p>
                  To render posters, ratings, cast lists, and trailers, WatchCineX requests metadata from The Movie Database (TMDB) API via serverless reverse proxy. When playing a title, your browser establishes a direct streaming connection to the chosen video server. These external services maintain their own independent privacy policies.
                </p>
              </div>
            </div>
          )
        };

      case '/help-centre':
        return {
          title: 'Streaming FAQ & Help Centre',
          subtitle: 'Technical troubleshooting, audio selection, server switching, and buffering solutions.',
          icon: <HelpCircle size={32} className="text-[#e50914]" />,
          content: (
            <div className="space-y-6 text-neutral-300 text-sm leading-relaxed">
              <div className="border border-neutral-800 rounded-xl p-5 bg-neutral-900/50 space-y-2">
                <h3 className="text-white font-bold text-base flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  How do I switch servers when a stream buffers or shows &quot;Connecting&quot;?
                </h3>
                <p className="text-neutral-300 text-xs md:text-sm">
                  WatchCineX connects to multiple high-speed distributed streaming clusters. In the player modal, locate the top-left server toggle:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                  <div className="bg-neutral-950 p-3 rounded-lg border border-neutral-800">
                    <strong className="text-white block mb-0.5">Server 1 (Primary High Speed):</strong>
                    Direct high-throughput pipeline optimized for quick startup and HD quality.
                  </div>
                  <div className="bg-neutral-950 p-3 rounded-lg border border-neutral-800">
                    <strong className="text-white block mb-0.5">Server 2 (Backup Cluster):</strong>
                    High-redundancy secondary mirror that steps in whenever peak traffic affects Server 1.
                  </div>
                </div>
              </div>

              <div className="border border-neutral-800 rounded-xl p-5 bg-neutral-900/50 space-y-2">
                <h3 className="text-white font-bold text-base flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  How do I choose Hindi, English, or regional dubbed audio tracks?
                </h3>
                <p className="text-neutral-300 text-xs md:text-sm">
                  When playing a title that has official dubbed releases, look for the amber <strong className="text-white">&quot;Audio Track&quot;</strong> dropdown next to the server toggle. You can switch between <span className="text-amber-300 font-mono">Original Audio</span>, <span className="text-amber-300 font-mono">Hindi Dub</span>, <span className="text-amber-300 font-mono">English</span>, and other available regional feeds without reloading the page.
                </p>
              </div>

              <div className="border border-neutral-800 rounded-xl p-5 bg-neutral-900/50 space-y-2">
                <h3 className="text-white font-bold text-base flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  How does WatchCineX protect against ads and popup redirects?
                </h3>
                <p className="text-neutral-300 text-xs md:text-sm">
                  Our front-end incorporates an active anti-popup shield (<strong className="text-white">AdShield</strong>). It intercepts programmatic click dispatches, middle-click hijacks, and synthetic window-open triggers commonly embedded in third-party media streams, keeping your browser focused safely on the content.
                </p>
              </div>

              <div className="border border-neutral-800 rounded-xl p-5 bg-neutral-900/50 space-y-2">
                <h3 className="text-white font-bold text-base flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  What keyboard shortcuts are supported in the video player?
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs font-mono">
                  <div className="bg-neutral-950 p-2 rounded border border-neutral-800 text-center">
                    <span className="text-red-400 font-bold block">Space / K</span>
                    <span className="text-neutral-400 text-[11px]">Play / Pause</span>
                  </div>
                  <div className="bg-neutral-950 p-2 rounded border border-neutral-800 text-center">
                    <span className="text-red-400 font-bold block">← (Left)</span>
                    <span className="text-neutral-400 text-[11px]">Rewind 10s</span>
                  </div>
                  <div className="bg-neutral-950 p-2 rounded border border-neutral-800 text-center">
                    <span className="text-red-400 font-bold block">→ (Right)</span>
                    <span className="text-neutral-400 text-[11px]">Forward 10s</span>
                  </div>
                  <div className="bg-neutral-950 p-2 rounded border border-neutral-800 text-center">
                    <span className="text-red-400 font-bold block">F</span>
                    <span className="text-neutral-400 text-[11px]">Fullscreen</span>
                  </div>
                </div>
              </div>
            </div>
          )
        };

      case '/audio-description':
        return {
          title: 'Audio & Subtitle Guide',
          subtitle: 'Comprehensive guide to multi-language dubbed feeds, audio tracks, and closed captions.',
          icon: <Volume2 size={32} className="text-[#e50914]" />,
          content: (
            <div className="space-y-8 text-neutral-300 text-sm leading-relaxed">
              <div className="space-y-3">
                <h2 className="text-white text-lg font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#e50914]" />
                  Multi-Audio Stream Feeds
                </h2>
                <p>
                  WatchCineX automatically scans for and indexes official multi-language dubbed audio feeds. For international movies, anime, and blockbuster TV shows, our system indexes releases with native audio as well as dubbed tracks in Hindi, English, Spanish, Japanese, and Korean.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-neutral-900 p-5 rounded-xl border border-neutral-800 space-y-2">
                  <h3 className="text-white font-bold text-sm flex items-center gap-2">
                    <Volume2 size={16} className="text-amber-400" />
                    Audio Selector Dropdown
                  </h3>
                  <p className="text-neutral-400 text-xs">
                    Located in the player controls overlay at the top left. Clicking this allows you to toggle between original soundtrack and regional language dubbed versions instantly.
                  </p>
                </div>

                <div className="bg-neutral-900 p-5 rounded-xl border border-neutral-800 space-y-2">
                  <h3 className="text-white font-bold text-sm flex items-center gap-2">
                    <Sparkles size={16} className="text-amber-400" />
                    Dubbed Posters Showcase
                  </h3>
                  <p className="text-neutral-400 text-xs">
                    For shows with rich dubbed libraries, click the &quot;Dubbed Posters&quot; button inside the player to open a visual grid of all regional releases with ratings and episode metadata.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h2 className="text-white text-lg font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#e50914]" />
                  Subtitles &amp; Closed Captions (CC)
                </h2>
                <p>
                  Subtitles are loaded natively through the HTML5 player controls. Click the caption icon on the playback bar to enable or disable English subtitles or switch between multiple language caption tracks.
                </p>
              </div>
            </div>
          )
        };

      case '/cookie-preferences':
        return {
          title: 'Cookie & Storage Preferences',
          subtitle: 'Review, manage, or purge local browser storage and session keys.',
          icon: <Database size={32} className="text-[#e50914]" />,
          content: (
            <div className="space-y-8 text-neutral-300 text-sm leading-relaxed">
              <p>
                WatchCineX operates without advertising cookies or tracking scripts. All user-specific settings are kept client-side inside your own browser storage.
              </p>

              <div className="space-y-3">
                <div className="bg-neutral-900 p-4 rounded-xl border border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-white font-bold text-sm">Session Authentication Token</h4>
                    <p className="text-neutral-400 text-xs">Stores your signed-in profile session so you do not have to authenticate on each visit.</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-800/40 shrink-0">Essential</span>
                </div>

                <div className="bg-neutral-900 p-4 rounded-xl border border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-white font-bold text-sm">Active Profile &amp; PIN Settings</h4>
                    <p className="text-neutral-400 text-xs">Maintains your active avatar, name, and profile lock PIN across browser tabs.</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-800/40 shrink-0">Essential</span>
                </div>

                <div className="bg-neutral-900 p-4 rounded-xl border border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-white font-bold text-sm">Favorites List (My List)</h4>
                    <p className="text-neutral-400 text-xs">Preserves your saved bookmarks and customized movie watchlists.</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-800/40 shrink-0">Essential</span>
                </div>
              </div>

              <div className="pt-6 border-t border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-white font-bold text-sm">Clear All Local Data</h4>
                  <p className="text-neutral-400 text-xs">Purges all cached profiles, watchlists, and session tokens from this device.</p>
                </div>
                <button
                  onClick={() => {
                    if (window.confirm('Clear all local WatchCineX preferences and sign out?')) {
                      localStorage.clear();
                      window.location.href = '/browse';
                    }
                  }}
                  className="bg-neutral-800 hover:bg-red-700 text-white text-xs font-bold px-5 py-2.5 rounded-lg transition-colors cursor-pointer shrink-0"
                >
                  Clear Storage &amp; Reset App
                </button>
              </div>
            </div>
          )
        };

      case '/contact-us':
        return {
          title: 'Contact Us & DMCA Notices',
          subtitle: 'Direct communication channel for feedback, stream inquiries, and DMCA notifications.',
          icon: <Mail size={32} className="text-[#e50914]" />,
          content: (
            <div className="space-y-8 text-neutral-300 text-sm leading-relaxed">
              <div>
                <h2 className="text-white text-lg font-bold mb-2">Get in Touch</h2>
                <p>
                  Have feedback, feature suggestions, need to report a broken stream, or have legal/DMCA inquiries? You can reach out directly to our team via email below.
                </p>
              </div>

              <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
                <div className="space-y-1">
                  <span className="flex items-center gap-2 text-white font-bold text-base">
                    <Mail size={20} className="text-[#e50914]" />
                    Direct Contact Email
                  </span>
                  <p className="text-neutral-400 text-xs">
                    For general support, feedback, content removal, or DMCA requests:
                  </p>
                  <a 
                    href="mailto:workforchronoae@gmail.com" 
                    className="text-white hover:text-red-400 font-mono text-sm font-semibold select-all block transition-colors mt-1"
                  >
                    workforchronoae@gmail.com
                  </a>
                </div>

                <a
                  href="mailto:workforchronoae@gmail.com"
                  className="bg-[#e50914] hover:bg-[#b20710] text-white text-xs font-bold px-5 py-2.5 rounded-lg transition-colors cursor-pointer shrink-0 inline-flex items-center gap-2"
                >
                  <Mail size={14} />
                  <span>Send Email</span>
                </a>
              </div>

              <div className="bg-neutral-900/40 border border-neutral-800 p-5 rounded-xl text-xs text-neutral-400 space-y-2">
                <strong className="text-white block text-sm">DMCA Notice Reminder:</strong>
                <p>
                  Please remember that WatchCineX does not host, upload, or control any video streams or server files. To permanently take down media, notices must be submitted directly to the third-party file hosts streaming the content.
                </p>
                <p>
                  Valid index removal requests with verifiable copyright documentation sent to <strong className="text-neutral-200">workforchronoae@gmail.com</strong> are reviewed and addressed within 48 to 72 business hours.
                </p>
              </div>
            </div>
          )
        };

      case '/corporate-information':
        return {
          title: 'Streaming Architecture & Infrastructure',
          subtitle: 'Technical specifications, player pipeline, and engineering design of WatchCineX.',
          icon: <Cpu size={32} className="text-[#e50914]" />,
          content: (
            <div className="space-y-8 text-neutral-300 text-sm leading-relaxed">
              <div className="space-y-3">
                <h2 className="text-white text-lg font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#e50914]" />
                  Engineered for Performance &amp; Low Latency
                </h2>
                <p>
                  WatchCineX is architected with modern web technologies to deliver an ultra-responsive client experience without unnecessary overhead, bloated tracking bundles, or intrusive third-party scripts.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-neutral-900 p-5 rounded-xl border border-neutral-800 space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-red-600/20 text-[#e50914] flex items-center justify-center font-bold">
                    UI
                  </div>
                  <h4 className="text-white font-bold text-sm">React 19 &amp; Vite</h4>
                  <p className="text-neutral-400 text-xs">
                    Lightning-fast build system with hot-module reloading and optimized static client chunks.
                  </p>
                </div>

                <div className="bg-neutral-900 p-5 rounded-xl border border-neutral-800 space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold">
                    FX
                  </div>
                  <h4 className="text-white font-bold text-sm">Tailwind &amp; Motion</h4>
                  <p className="text-neutral-400 text-xs">
                    Hardware-accelerated CSS animations, dynamic backdrop cross-fades, and responsive mobile layouts.
                  </p>
                </div>

                <div className="bg-neutral-900 p-5 rounded-xl border border-neutral-800 space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold">
                    API
                  </div>
                  <h4 className="text-white font-bold text-sm">Serverless Proxies</h4>
                  <p className="text-neutral-400 text-xs">
                    Edge function proxy routing that validates stream integrity and handles automatic cluster failovers.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h2 className="text-white text-lg font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#e50914]" />
                  Multi-Cluster Failover System
                </h2>
                <p>
                  To prevent downtime when external streaming servers experience heavy load or network congestion, WatchCineX implements transparent dual-cluster failover:
                </p>
                <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 font-mono text-xs text-neutral-300 space-y-1">
                  <div className="text-neutral-400">// Automatic Fallback Engine Flow</div>
                  <div>Primary Cluster (Server 1) &rarr; Health Check &rarr; Video Ready</div>
                  <div className="text-amber-400">&nbsp;&nbsp;&rdquor; If Server 1 Busy &rarr; Auto-Switch to Backup Cluster (Server 2)</div>
                  <div className="text-emerald-400">&nbsp;&nbsp;&rdquor; Zero Interruption &bull; Stream Restored Seamlessly</div>
                </div>
              </div>
            </div>
          )
        };

      case '/media-centre':
        return {
          title: 'About WatchCineX',
          subtitle: 'The open-source story, core philosophy, and technical architecture of WatchCineX.',
          icon: <Info size={32} className="text-[#e50914]" />,
          content: (
            <div className="space-y-10 text-neutral-300 text-sm leading-relaxed">
              {/* Introduction & Origin */}
              <div className="space-y-4">
                <h2 className="text-white text-xl font-bold flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#e50914]" />
                  The Origin &amp; Vision
                </h2>
                <p>
                  Modern digital streaming has become increasingly divided across fragmented subscription models, regional library locks, and mounting monthly fees. At the same time, traditional free streaming platforms have historically compromised the viewing experience with malicious redirect chains, unsolicited popups, intrusive trackers, and cluttered, unmaintained interfaces.
                </p>
                <p>
                  <strong className="text-white font-semibold">WatchCineX</strong> was established to change this paradigm. Our vision is to deliver a refined, Netflix-grade streaming client that is completely open source, privacy-focused, and accessible to everyone without paywalls or subscriptions. By uniting a modern React single-page architecture with decentralized streaming cluster integration and client-side popup protection, WatchCineX brings a seamless cinema experience directly to your browser.
                </p>
              </div>

              {/* Core Pillars */}
              <div className="space-y-4">
                <h2 className="text-white text-xl font-bold flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#e50914]" />
                  Core Engineering Pillars
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-neutral-900/90 p-5 rounded-xl border border-neutral-800 space-y-2 hover:border-neutral-700 transition-colors">
                    <div className="flex items-center gap-2 text-white font-bold text-sm">
                      <Sparkles size={16} className="text-[#e50914]" />
                      <span>100% Free Forever</span>
                    </div>
                    <p className="text-neutral-400 text-xs">
                      No subscription fees, account paywalls, VIP memberships, or monetization tiers. WatchCineX is and will always remain free for global movie and series enthusiasts.
                    </p>
                  </div>

                  <div className="bg-neutral-900/90 p-5 rounded-xl border border-neutral-800 space-y-2 hover:border-neutral-700 transition-colors">
                    <div className="flex items-center gap-2 text-white font-bold text-sm">
                      <Shield size={16} className="text-[#e50914]" />
                      <span>Built-In AdShield Engine</span>
                    </div>
                    <p className="text-neutral-400 text-xs">
                      An integrated client-side protection system intercepts middle-click hijacks, uninvited new-tab redirects, and click-jacking triggers before they can disrupt your playback.
                    </p>
                  </div>

                  <div className="bg-neutral-900/90 p-5 rounded-xl border border-neutral-800 space-y-2 hover:border-neutral-700 transition-colors">
                    <div className="flex items-center gap-2 text-white font-bold text-sm">
                      <Cpu size={16} className="text-[#e50914]" />
                      <span>Dual-Cluster Failover</span>
                    </div>
                    <p className="text-neutral-400 text-xs">
                      Our streaming pipeline connects to multiple high-speed server clusters (Primary and Backup). If a source cluster experiences temporary latency, the player automatically reroutes with minimal interruption.
                    </p>
                  </div>

                  <div className="bg-neutral-900/90 p-5 rounded-xl border border-neutral-800 space-y-2 hover:border-neutral-700 transition-colors">
                    <div className="flex items-center gap-2 text-white font-bold text-sm">
                      <Volume2 size={16} className="text-[#e50914]" />
                      <span>Multi-Language Audio Feeds</span>
                    </div>
                    <p className="text-neutral-400 text-xs">
                      Enjoy international films and popular series in your preferred language. Toggle dynamically between original audio, Hindi dubs, English feeds, and regional tracks with one click.
                    </p>
                  </div>

                  <div className="bg-neutral-900/90 p-5 rounded-xl border border-neutral-800 space-y-2 hover:border-neutral-700 transition-colors">
                    <div className="flex items-center gap-2 text-white font-bold text-sm">
                      <Database size={16} className="text-[#e50914]" />
                      <span>Strict Client-Side Privacy</span>
                    </div>
                    <p className="text-neutral-400 text-xs">
                      Your viewing history, custom watchlists, and profile preferences remain in your browser local storage. We collect zero analytics trackers, telemetry scripts, or behavior fingerprints.
                    </p>
                  </div>

                  <div className="bg-neutral-900/90 p-5 rounded-xl border border-neutral-800 space-y-2 hover:border-neutral-700 transition-colors">
                    <div className="flex items-center gap-2 text-white font-bold text-sm">
                      <Code size={16} className="text-[#e50914]" />
                      <span>Community-Driven &amp; Open</span>
                    </div>
                    <p className="text-neutral-400 text-xs">
                      Built with modern web standards (React 19, Vite, Tailwind CSS). We welcome developers, designers, and curators worldwide to collaborate and enhance the platform.
                    </p>
                  </div>
                </div>
              </div>

              {/* Technical Architecture */}
              <div className="space-y-4">
                <h2 className="text-white text-xl font-bold flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#e50914]" />
                  Technical Architecture
                </h2>
                <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-800 space-y-4">
                  <p className="text-xs md:text-sm text-neutral-300">
                    WatchCineX operates as a distributed client-serverless hybrid that prioritizes speed, resilience, and user safety:
                  </p>
                  <div className="space-y-3 text-xs">
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-neutral-800 text-[#e50914] font-bold flex items-center justify-center shrink-0 border border-neutral-700 text-xs">1</span>
                      <div>
                        <strong className="text-white block text-sm">Catalog Aggregation Layer</strong>
                        <span className="text-neutral-400">Media metadata, posters, backdrops, cast listings, and trending charts are queried via The Movie Database (TMDB) through edge serverless API proxies to protect API keys and ensure fast cached delivery.</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-neutral-800 text-[#e50914] font-bold flex items-center justify-center shrink-0 border border-neutral-700 text-xs">2</span>
                      <div>
                        <strong className="text-white block text-sm">Decentralized Stream Resolution</strong>
                        <span className="text-neutral-400">When you select a title, WatchCineX queries public streaming clusters to resolve active video streams and dubbed audio variants without storing media files on our infrastructure.</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-neutral-800 text-[#e50914] font-bold flex items-center justify-center shrink-0 border border-neutral-700 text-xs">3</span>
                      <div>
                        <strong className="text-white block text-sm">Isolated Player Sandboxing</strong>
                        <span className="text-neutral-400">The video playback engine is isolated within a secured player framework, utilizing strict sandboxing to neutralize frame-busting scripts, malicious redirects, and unsolicited third-party popups.</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-neutral-800 text-[#e50914] font-bold flex items-center justify-center shrink-0 border border-neutral-700 text-xs">4</span>
                      <div>
                        <strong className="text-white block text-sm">Instant State Recovery</strong>
                        <span className="text-neutral-400">Player position, chosen audio language, volume levels, and continue watching timestamps are persisted locally so you can resume precisely where you left off.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Roadmap & Open Collaboration */}
              <div className="space-y-4">
                <h2 className="text-white text-xl font-bold flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#e50914]" />
                  Roadmap &amp; Future Development
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-1.5">
                    <strong className="text-white block text-sm">Advanced Subtitles</strong>
                    <p className="text-neutral-400">Custom subtitle styling, font resizing, and multi-language external SRT/VTT caption synchronization.</p>
                  </div>
                  <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-1.5">
                    <strong className="text-white block text-sm">PWA Offline Shell</strong>
                    <p className="text-neutral-400">Progressive Web App installation for desktop and mobile home screens with instant cached launch speeds.</p>
                  </div>
                  <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-1.5">
                    <strong className="text-white block text-sm">Smart Watch Parties</strong>
                    <p className="text-neutral-400">Synchronized playback rooms allowing remote groups of friends to watch shows and movies together in real-time.</p>
                  </div>
                </div>
              </div>

              {/* Get in Touch Callout */}
              <div className="bg-gradient-to-r from-neutral-900 to-neutral-950 p-6 rounded-xl border border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-white font-bold text-base">Ready to Collaborate?</h3>
                  <p className="text-neutral-400 text-xs">
                    Have feedback, feature ideas, or want to contribute to the code? Get in touch with the team at <a href="mailto:workforchronoae@gmail.com" className="text-neutral-200 hover:text-white underline font-mono">workforchronoae@gmail.com</a>.
                  </p>
                </div>
                <a
                  href="mailto:workforchronoae@gmail.com"
                  className="bg-[#e50914] hover:bg-[#b20710] text-white text-xs font-bold px-5 py-2.5 rounded-lg transition-colors shrink-0 inline-flex items-center gap-2 cursor-pointer shadow-lg"
                >
                  <Mail size={14} />
                  <span>Contact Team</span>
                </a>
              </div>
            </div>
          )
        };

      case '/jobs':
        return {
          title: 'Contribute & Collaborate',
          subtitle: 'Ready to collaborate! Join developers and designers to build the future of WatchCineX.',
          icon: <Heart size={32} className="text-[#e50914]" />,
          content: (
            <div className="space-y-8 text-neutral-300 text-sm leading-relaxed">
              <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-800 space-y-3">
                <h3 className="text-white font-bold text-base flex items-center gap-2">
                  <Code size={18} className="text-[#e50914]" />
                  Open Source Collaboration - Developers Welcome!
                </h3>
                <p className="text-neutral-300 text-xs md:text-sm">
                  WatchCineX is actively looking for collaborators. Whether you want to contribute front-end polish, refine responsive mobile navigation, optimize multi-audio track parsing, or integrate new streaming nodes, we welcome your contributions.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-white text-lg font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#e50914]" />
                  Contribution Areas
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="bg-neutral-950 p-4 rounded-lg border border-neutral-800">
                    <strong className="text-white block mb-1">Front-End UX</strong>
                    <p className="text-neutral-400">Enhance player gesture controls, improve TV/remote navigation, and optimize keyboard shortcuts.</p>
                  </div>
                  <div className="bg-neutral-950 p-4 rounded-lg border border-neutral-800">
                    <strong className="text-white block mb-1">Stream Scrapers</strong>
                    <p className="text-neutral-400">Maintain and expand backup server clusters, multi-audio feed parsers, and subtitle sources.</p>
                  </div>
                  <div className="bg-neutral-950 p-4 rounded-lg border border-neutral-800">
                    <strong className="text-white block mb-1">Documentation</strong>
                    <p className="text-neutral-400">Expand user guides, troubleshoot common streaming errors, and translate UI into other languages.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h2 className="text-white text-lg font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#e50914]" />
                  How to Get Involved
                </h2>
                <p className="text-xs md:text-sm text-neutral-300">
                  We are actively building new features, responsive player improvements, and stream mirrors. If you are interested in contributing code, designing layouts, or sharing feedback, reach out to our team at <a href="mailto:workforchronoae@gmail.com" className="text-[#e50914] underline font-bold">workforchronoae@gmail.com</a>.
                </p>
              </div>
            </div>
          )
        };

      case '/gift-cards':
      case '/investor-relations':
        return {
          title: '100% Free Forever Promise',
          subtitle: 'No corporate investors, subscription fees, or gift cards - ever.',
          icon: <CheckCircle2 size={32} className="text-emerald-500" />,
          content: (
            <div className="space-y-8 text-neutral-300 text-sm leading-relaxed">
              <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-800 space-y-3">
                <h3 className="text-white font-bold text-base flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  Community-Driven &amp; Non-Commercial
                </h3>
                <p className="text-neutral-300 text-xs md:text-sm">
                  WatchCineX is not a commercial enterprise or corporation. There are no stockholders, venture capitalists, private equity investors, or corporate sponsors. We do not issue gift cards, vouchers, merchandise, or premium subscription tiers.
                </p>
                <p className="text-neutral-400 text-xs">
                  Everything developed under WatchCineX is free for all users worldwide. Enjoy the platform, share it with friends, and if you have feedback or ideas, feel free to reach out to us at <a href="mailto:workforchronoae@gmail.com" className="text-neutral-200 hover:text-white underline font-mono">workforchronoae@gmail.com</a>!
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-neutral-900/80 p-5 rounded-xl border border-neutral-800 space-y-2">
                  <h4 className="text-white font-bold text-sm">Why We Don&apos;t Accept Funding</h4>
                  <p className="text-neutral-400 text-xs">
                    Accepting investor capital inevitably forces monetization, tracking ads, subscription paywalls, and user exploitation. By keeping WatchCineX independent and open-source, our only priority is user experience and platform reliability.
                  </p>
                </div>

                <div className="bg-neutral-900/80 p-5 rounded-xl border border-neutral-800 space-y-2">
                  <h4 className="text-white font-bold text-sm">Lightweight Infrastructure</h4>
                  <p className="text-neutral-400 text-xs">
                    By relying on decentralized streaming nodes and edge serverless caching, operational overhead is minimal. This allows the service to remain agile, cost-effective, and permanently open without commercial pressures.
                  </p>
                </div>
              </div>

              <div className="bg-neutral-900/40 border border-neutral-800 p-5 rounded-xl text-xs text-neutral-400 space-y-2">
                <strong className="text-white block text-sm">Protection Against Scams:</strong>
                <p>
                  WatchCineX will never contact you demanding payment, gift cards, credit card numbers, or cryptocurrency donations. Any third-party site selling &quot;WatchCineX Premium Passes&quot; or gift cards is fraudulent.
                </p>
              </div>
            </div>
          )
        };

      default:
        return {
          title: 'Information & Legal Documentation',
          subtitle: 'Official documentation and guidelines for WatchCineX.',
          icon: <Info size={32} className="text-[#e50914]" />,
          content: (
            <p className="text-neutral-400 text-sm">
              Please choose a topic from the navigation links below or return to the <Link to="/browse" className="text-[#e50914] underline">Browse Catalog</Link>.
            </p>
          )
        };
    }
  };

  const data = getPageData();

  return (
    <div className="min-h-screen bg-[#141414] text-neutral-200 flex flex-col font-sans antialiased selection:bg-[#e50914] selection:text-white">
      {/* CineX Header */}
      <header className="bg-black/90 backdrop-blur-md border-b border-white/10 px-6 md:px-16 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <img
            src={logoImg}
            alt="CineX Logo"
            onClick={() => navigate('/browse')}
            className="h-8 md:h-10 w-auto cursor-pointer select-none object-contain"
          />
          <div className="h-4 w-[1px] bg-neutral-700" />
          <span className="text-xs md:text-sm font-medium text-neutral-400">Documentation &amp; Legal</span>
        </div>

        <button
          onClick={() => navigate('/browse')}
          className="flex items-center gap-2 text-xs font-semibold text-neutral-300 hover:text-white transition-colors bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-700 px-3.5 py-1.5 rounded-md cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Back to Browse</span>
        </button>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-12 flex flex-col gap-8">
        {/* Header Title Block */}
        <div className="flex items-start gap-4 pb-6 border-b border-neutral-800">
          <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800 shrink-0">
            {data.icon}
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              {data.title}
            </h1>
            <p className="text-xs md:text-sm text-neutral-400 mt-1">
              {data.subtitle}
            </p>
          </div>
        </div>

        {/* Dynamic Page Content */}
        <div className="pb-10">
          {data.content}
        </div>
      </main>

      {/* Global Unified Footer */}
      <Footer />
    </div>
  );
}
