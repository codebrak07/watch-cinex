import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Shield, FileText, HelpCircle, Volume2, Database, Mail, Code, Info, Heart, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';
import logoImg from '../assets/cinex.png';
import Footer from './Footer';

export default function SampleInfoPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;

  const getPageData = () => {
    switch (path) {
      case '/legal-notices':
        return {
          title: 'DMCA & Content Disclaimer',
          subtitle: 'Important legal notices regarding content hosting, indexing, and copyright compliance.',
          icon: <Shield size={32} className="text-[#e50914]" />,
          content: (
            <div className="space-y-6 text-neutral-300 text-sm leading-relaxed">
              <div className="bg-red-950/30 border border-red-800/40 p-4 rounded-lg flex items-start gap-3">
                <AlertTriangle size={20} className="text-[#e50914] shrink-0 mt-0.5" />
                <p className="text-neutral-200 text-xs md:text-sm">
                  <strong>Notice:</strong> WatchCineX does not host, store, or upload any video files, movies, TV episodes, or media on its servers. We do not own the content played through this platform. All media is retrieved, embedded, or streamed directly from non-affiliated third-party servers and public streaming clusters.
                </p>
              </div>

              <div>
                <h2 className="text-white text-lg font-bold mb-2">1. Non-Hosting & Indexing Policy</h2>
                <p>
                  WatchCineX operates strictly as a modern web-based player client and media indexer. None of the video streams, media files, audio tracks, or subtitles available on this website are stored on or transmitted through our own physical or cloud servers. All video playback URLs are loaded from external, public third-party services (such as NetMirror, ArtPlayer, and public CDN clusters).
                </p>
                <p className="mt-2">
                  As an indexer and player wrapper, WatchCineX has no control over the content, availability, licensing, or terms of third-party streaming providers.
                </p>
              </div>

              <div>
                <h2 className="text-white text-lg font-bold mb-2">2. Copyright & DMCA Takedown Procedure</h2>
                <p>
                  We fully respect the intellectual property rights of copyright holders and content creators. If your copyrighted work is accessible via a link on our platform, please recognize that because WatchCineX does not host or store any media, issuing a takedown to us will not remove the video from the Internet or from the third-party server hosting it.
                </p>
                <p className="mt-2">
                  To permanently remove infringing material, copyright owners must submit takedown notices directly to the file host or streaming server where the media actually resides.
                </p>
                <p className="mt-2">
                  If you would like a specific indexing reference or title metadata link removed from WatchCineX, you may contact our open source maintainers via our contact page or open an issue on our official GitHub repository with valid proof of ownership and the exact URL in question.
                </p>
              </div>

              <div>
                <h2 className="text-white text-lg font-bold mb-2">3. Trademark Disclaimers</h2>
                <p>
                  All trademarks, service marks, trade names, trade dress, product names, and logos appearing on the site are the property of their respective owners. Their use on WatchCineX is solely for descriptive, identification, and research purposes and does not imply endorsement, affiliation, or sponsorship.
                </p>
              </div>
            </div>
          )
        };

      case '/terms-of-use':
        return {
          title: 'Terms of Service',
          subtitle: 'Terms governing the access and non-commercial use of the WatchCineX web platform.',
          icon: <FileText size={32} className="text-[#e50914]" />,
          content: (
            <div className="space-y-6 text-neutral-300 text-sm leading-relaxed">
              <div>
                <h2 className="text-white text-lg font-bold mb-2">1. Acceptance of Terms</h2>
                <p>
                  By accessing or using WatchCineX, you agree to be bound by these Terms of Service. WatchCineX is a free, open-source software project created strictly for educational, research, and personal entertainment purposes.
                </p>
              </div>

              <div>
                <h2 className="text-white text-lg font-bold mb-2">2. 100% Free & No Subscriptions</h2>
                <p>
                  WatchCineX does not charge any subscription fees, membership dues, or payments of any kind. We will never ask for your credit card, bank account, or payment details. Any website claiming to charge for WatchCineX is fraudulent.
                </p>
              </div>

              <div>
                <h2 className="text-white text-lg font-bold mb-2">3. User Responsibility & Compliance</h2>
                <p>
                  You are solely responsible for ensuring that your access and use of third-party streaming links complies with the laws, intellectual property statutes, and regulations applicable in your country or jurisdiction. WatchCineX does not endorse, encourage, or facilitate unauthorized distribution of copyrighted media.
                </p>
              </div>

              <div>
                <h2 className="text-white text-lg font-bold mb-2">4. Disclaimer of Warranties</h2>
                <p>
                  The platform and its player interfaces are provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis without warranties of any kind, whether express or implied. WatchCineX makes no representations regarding the uptime, speed, audio availability, or uninterrupted accessibility of third-party video clusters.
                </p>
              </div>

              <div>
                <h2 className="text-white text-lg font-bold mb-2">5. Open Source Collaboration</h2>
                <p>
                  WatchCineX is open source. You are welcome to review, inspect, fork, and contribute to our codebase via GitHub in accordance with the project&apos;s open source license.
                </p>
              </div>
            </div>
          )
        };

      case '/privacy':
        return {
          title: 'Privacy Policy',
          subtitle: 'How WatchCineX handles user data, authentication, and browser storage.',
          icon: <Shield size={32} className="text-[#e50914]" />,
          content: (
            <div className="space-y-6 text-neutral-300 text-sm leading-relaxed">
              <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-lg">
                <h3 className="text-white font-semibold mb-1 text-sm flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-500" />
                  Zero Telemetry &amp; Privacy-First Philosophy
                </h3>
                <p className="text-neutral-400 text-xs">
                  We believe in complete privacy. WatchCineX does not track your online activity, monitor the titles you watch, sell your information to advertisers, or inject tracking pixels.
                </p>
              </div>

              <div>
                <h2 className="text-white text-lg font-bold mb-2">1. Authentication via Firebase &amp; Google</h2>
                <p>
                  When you sign in with Google or create an email account on WatchCineX, authentication is handled securely through Firebase Authentication (Google Identity Platform). We store your account identifier and email address strictly to maintain your active session across devices and to customize your profile avatar.
                </p>
              </div>

              <div>
                <h2 className="text-white text-lg font-bold mb-2">2. Local Browser Storage (localStorage)</h2>
                <p>
                  To maximize speed and privacy, WatchCineX keeps your personal watchlists, favorites, and profile customization stored directly in your browser&apos;s <code className="text-red-400 bg-neutral-900 px-1 py-0.5 rounded">localStorage</code>:
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-1 text-xs text-neutral-400">
                  <li><strong className="text-neutral-200">cinex_auth_user:</strong> Remembers your active login status so you don&apos;t have to log in on every refresh.</li>
                  <li><strong className="text-neutral-200">cinex_active_profile:</strong> Remembers your chosen avatar and profile name.</li>
                  <li><strong className="text-neutral-200">netflix_favorites:</strong> Stores your saved movies and TV shows for quick access.</li>
                </ul>
              </div>

              <div>
                <h2 className="text-white text-lg font-bold mb-2">3. Third-Party Network Requests</h2>
                <p>
                  When you browse titles, metadata and cover art are loaded via the public TMDB API. When you stream a title, the video player initiates an HTTP request directly to the chosen streaming provider (e.g. NetMirror or ArtPlayer). Those external services have their own independent privacy practices.
                </p>
              </div>
            </div>
          )
        };

      case '/help-centre':
        return {
          title: 'Streaming FAQ & Help Centre',
          subtitle: 'Answers to common streaming issues, audio selection, buffering, and server switching.',
          icon: <HelpCircle size={32} className="text-[#e50914]" />,
          content: (
            <div className="space-y-6 text-neutral-300 text-sm leading-relaxed">
              <div className="border border-neutral-800 rounded-lg p-5 bg-neutral-900/40">
                <h3 className="text-white font-semibold text-base mb-2">Why is a movie or episode showing &quot;Server Busy&quot; or buffering?</h3>
                <p className="text-neutral-400 text-xs md:text-sm">
                  External streaming clusters experience heavy peak traffic. WatchCineX includes an automatic background failover engine between <strong className="text-white">ArtPlayer</strong> and <strong className="text-white">NetMirror</strong>. If a server is slow, open the player controls and select an alternate server or audio language from the dropdown to instantly re-route the stream.
                </p>
              </div>

              <div className="border border-neutral-800 rounded-lg p-5 bg-neutral-900/40">
                <h3 className="text-white font-semibold text-base mb-2">How do I change audio to Hindi or other dubbed languages?</h3>
                <p className="text-neutral-400 text-xs md:text-sm">
                  When playing a title via the primary player (ArtPlayer), click the <strong className="text-white">&quot;Audio: Original&quot;</strong> selector in the top-left corner of the video modal. If dubbed releases are available for that title, you can switch between Original, Hindi, English, and other regional tracks with zero reload time.
                </p>
              </div>

              <div className="border border-neutral-800 rounded-lg p-5 bg-neutral-900/40">
                <h3 className="text-white font-semibold text-base mb-2">Do I need an account to watch?</h3>
                <p className="text-neutral-400 text-xs md:text-sm">
                  No! WatchCineX is completely free and open. You can stream any title immediately without logging in. Creating or signing in with a Google account allows you to sync your favorite watchlists, profile PIN locks, and resume timestamps across sessions.
                </p>
              </div>

              <div className="border border-neutral-800 rounded-lg p-5 bg-neutral-900/40">
                <h3 className="text-white font-semibold text-base mb-2">Are popups and intrusive ads blocked?</h3>
                <p className="text-neutral-400 text-xs md:text-sm">
                  Yes. WatchCineX includes an integrated <strong className="text-white">AdShield</strong> that intercepts external popups, redirect hijacking, and middle-click dispatches, ensuring a clean and safe viewing experience.
                </p>
              </div>
            </div>
          )
        };

      case '/audio-description':
        return {
          title: 'Audio & Subtitle Guide',
          subtitle: 'Learn how to customize audio tracks, switch to dubbed versions, and enable subtitles.',
          icon: <Volume2 size={32} className="text-[#e50914]" />,
          content: (
            <div className="space-y-6 text-neutral-300 text-sm leading-relaxed">
              <div>
                <h2 className="text-white text-lg font-bold mb-2">Multi-Audio &amp; Dubbed Variants</h2>
                <p>
                  WatchCineX integrates directly with multi-audio streaming clusters. For movies and shows released with multi-language audio (such as Hindi, English, Korean, or Japanese), our player dynamically indexes the available dubbed feeds.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-neutral-900 p-4 rounded-lg border border-neutral-800">
                  <h3 className="text-white font-bold text-sm mb-1">Switching Audio Tracks</h3>
                  <p className="text-neutral-400 text-xs">
                    Look for the Audio Track selector at the top-left of the player modal. Click to choose your preferred language feed (e.g. Hindi Dubbed, Original Audio, English).
                  </p>
                </div>
                <div className="bg-neutral-900 p-4 rounded-lg border border-neutral-800">
                  <h3 className="text-white font-bold text-sm mb-1">Enabling Subtitles (CC)</h3>
                  <p className="text-neutral-400 text-xs">
                    Click the &quot;CC&quot; icon in the video player control bar to toggle closed captions and select subtitles in English or other supported languages.
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-white text-lg font-bold mb-2">Audio Desync or Missing Tracks?</h2>
                <p>
                  If a particular audio track is out of sync or buffers, switch the provider toggle in the player to reload the stream from the backup cluster server.
                </p>
              </div>
            </div>
          )
        };

      case '/cookie-preferences':
        return {
          title: 'Cookie & Storage Preferences',
          subtitle: 'Review and manage how WatchCineX stores preferences in your browser.',
          icon: <Database size={32} className="text-[#e50914]" />,
          content: (
            <div className="space-y-6 text-neutral-300 text-sm leading-relaxed">
              <p>
                WatchCineX does not use third-party advertising cookies or cross-site tracking beacons. We rely solely on your browser&apos;s local storage to remember your settings and session.
              </p>

              <div className="space-y-3">
                <div className="bg-neutral-900 p-4 rounded-lg border border-neutral-800 flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-semibold text-sm">Essential Session &amp; Profile Storage</h4>
                    <p className="text-neutral-400 text-xs">Keeps you signed in and stores your active profile name and avatar.</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2 py-1 rounded border border-emerald-800/40">Always Active</span>
                </div>

                <div className="bg-neutral-900 p-4 rounded-lg border border-neutral-800 flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-semibold text-sm">Favorites &amp; Watchlist</h4>
                    <p className="text-neutral-400 text-xs">Stores the movies and TV shows you have added to My List.</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2 py-1 rounded border border-emerald-800/40">Always Active</span>
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-800">
                <button
                  onClick={() => {
                    if (window.confirm('Clear all local WatchCineX preferences and sign out?')) {
                      localStorage.clear();
                      window.location.href = '/browse';
                    }
                  }}
                  className="bg-neutral-800 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded transition-colors"
                >
                  Clear All Local Storage &amp; Reset Preferences
                </button>
              </div>
            </div>
          )
        };

      case '/contact-us':
        return {
          title: 'Contact Us & DMCA Notices',
          subtitle: 'Reach out to the WatchCineX maintainers for inquiries, feedback, or DMCA notifications.',
          icon: <Mail size={32} className="text-[#e50914]" />,
          content: (
            <div className="space-y-6 text-neutral-300 text-sm leading-relaxed">
              <div>
                <h2 className="text-white text-lg font-bold mb-2">Get in Touch</h2>
                <p>
                  Have feedback, feature suggestions, or need to report a broken stream? As an open source project, our primary collaboration and discussion hub is hosted on GitHub.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <a
                  href="https://github.com/codebrak07/watch-cinex/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-neutral-900 hover:bg-neutral-800 p-5 rounded-lg border border-neutral-800 flex flex-col gap-2 transition-colors group"
                >
                  <div className="flex items-center justify-between text-white font-bold text-sm">
                    <span className="flex items-center gap-2">
                      <Code size={16} className="text-[#e50914]" />
                      GitHub Issue Tracker
                    </span>
                    <ExternalLink size={14} className="text-neutral-500 group-hover:text-white" />
                  </div>
                  <p className="text-neutral-400 text-xs">
                    Report bugs, streaming issues, or submit pull requests directly to the repository.
                  </p>
                </a>

                <div className="bg-neutral-900 p-5 rounded-lg border border-neutral-800 flex flex-col gap-2">
                  <span className="flex items-center gap-2 text-white font-bold text-sm">
                    <Mail size={16} className="text-[#e50914]" />
                    Email Inquiries
                  </span>
                  <p className="text-neutral-400 text-xs">
                    For legal notices and general project queries:
                  </p>
                  <span className="text-neutral-200 font-mono text-xs select-all">
                    aalekhmaheshwari@gmail.com
                  </span>
                </div>
              </div>

              <div className="bg-neutral-900/60 border border-neutral-800 p-4 rounded-lg text-xs text-neutral-400">
                <strong className="text-white block mb-1">DMCA Notice Reminder:</strong>
                Please remember that WatchCineX does not host, upload, or control any video streams or server files. To permanently take down media, notices must be submitted directly to the third-party file hosts streaming the content.
              </div>
            </div>
          )
        };

      case '/corporate-information':
        return {
          title: 'Streaming Architecture & Technology',
          subtitle: 'Technical specifications, player engines, and infrastructure powering WatchCineX.',
          icon: <Code size={32} className="text-[#e50914]" />,
          content: (
            <div className="space-y-6 text-neutral-300 text-sm leading-relaxed">
              <div>
                <h2 className="text-white text-lg font-bold mb-2">Modern Web Stack</h2>
                <p>
                  WatchCineX is engineered with a high-performance modern web framework to provide instantaneous page navigation, responsive playback, and robust failovers.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-neutral-900 p-4 rounded-lg border border-neutral-800">
                  <h4 className="text-white font-bold text-sm mb-1">Frontend Core</h4>
                  <p className="text-neutral-400 text-xs">React 19, Vite, Tailwind CSS, and Framer Motion for 60fps animations.</p>
                </div>
                <div className="bg-neutral-900 p-4 rounded-lg border border-neutral-800">
                  <h4 className="text-white font-bold text-sm mb-1">Playback Engines</h4>
                  <p className="text-neutral-400 text-xs">ArtPlayer custom integration with HLS / MPD support and NetMirror clusters.</p>
                </div>
                <div className="bg-neutral-900 p-4 rounded-lg border border-neutral-800">
                  <h4 className="text-white font-bold text-sm mb-1">Metadata API</h4>
                  <p className="text-neutral-400 text-xs">The Movie Database (TMDB) for live trending titles, cast lists, and artwork.</p>
                </div>
              </div>
            </div>
          )
        };

      case '/media-centre':
        return {
          title: 'About WatchCineX',
          subtitle: 'The open source mission behind creating a fast, ad-free streaming player.',
          icon: <Info size={32} className="text-[#e50914]" />,
          content: (
            <div className="space-y-6 text-neutral-300 text-sm leading-relaxed">
              <div>
                <h2 className="text-white text-lg font-bold mb-2">Our Mission</h2>
                <p>
                  WatchCineX was created to provide movie and television enthusiasts with an elegant, modern, and accessible interface for streaming publicly available media without intrusive popups, sluggish players, or paywalls.
                </p>
                <p className="mt-2">
                  Built as an open-source alternative, WatchCineX focuses on speed, multi-audio accessibility, and seamless playback across desktop and mobile devices.
                </p>
              </div>

              <div className="bg-neutral-900 p-5 rounded-lg border border-neutral-800">
                <h3 className="text-white font-bold text-sm mb-1">Open Source &amp; Community Driven</h3>
                <p className="text-neutral-400 text-xs">
                  The entire project is public and community-driven. Anyone can review the code, suggest improvements, or help maintain server scrapers.
                </p>
              </div>
            </div>
          )
        };

      case '/jobs':
        return {
          title: 'Contribute & Collaborate',
          subtitle: 'Ready to collaborate! Join developers and designers to improve WatchCineX.',
          icon: <Heart size={32} className="text-[#e50914]" />,
          content: (
            <div className="space-y-6 text-neutral-300 text-sm leading-relaxed">
              <div className="bg-neutral-900 p-5 rounded-lg border border-neutral-800">
                <h3 className="text-white font-bold text-base mb-2">We Are Ready to Collaborate!</h3>
                <p className="text-neutral-400 text-xs md:text-sm">
                  Whether you are a React developer, UI designer, or streaming enthusiast, we welcome contributions of all levels. Help us add new streaming scraper mirrors, optimize audio switching, or improve responsive mobile layouts.
                </p>
              </div>

              <div>
                <h2 className="text-white text-lg font-bold mb-2">How to Contribute</h2>
                <ol className="list-decimal pl-5 space-y-2 text-xs md:text-sm text-neutral-300">
                  <li>Visit our GitHub repository at <a href="https://github.com/codebrak07/watch-cinex" target="_blank" rel="noopener noreferrer" className="text-[#e50914] underline">github.com/codebrak07/watch-cinex</a>.</li>
                  <li>Fork the repository to your own account.</li>
                  <li>Create a feature branch for your changes (<code className="text-neutral-200 bg-neutral-900 px-1 py-0.5 rounded">git checkout -b feature/awesome-feature</code>).</li>
                  <li>Commit your code and submit a Pull Request describing your improvements.</li>
                </ol>
              </div>
            </div>
          )
        };

      case '/gift-cards':
      case '/investor-relations':
        return {
          title: '100% Free Forever Promise',
          subtitle: 'WatchCineX has no memberships, investors, or paywalls.',
          icon: <CheckCircle2 size={32} className="text-emerald-500" />,
          content: (
            <div className="space-y-6 text-neutral-300 text-sm leading-relaxed">
              <div className="bg-neutral-900 p-5 rounded-lg border border-neutral-800">
                <h3 className="text-white font-bold text-base mb-2">No Fees, No Subscriptions, No Gift Cards</h3>
                <p className="text-neutral-400 text-xs md:text-sm">
                  WatchCineX is not a commercial enterprise and has no corporate investors, gift card balances, or paid subscription tiers. Everything is 100% free and open for public use and education.
                </p>
              </div>
            </div>
          )
        };

      default:
        return {
          title: 'Information Centre',
          subtitle: 'Documentation and information for WatchCineX.',
          icon: <Info size={32} className="text-[#e50914]" />,
          content: (
            <p className="text-neutral-400 text-sm">
              Please use the navigation links or return to <Link to="/browse" className="text-[#e50914] underline">Browse Catalog</Link>.
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
