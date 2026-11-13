import https from 'https';
import crypto from 'crypto';

function fetchJson(targetUrl) {
  return new Promise((resolve) => {
    https.get(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Referer': 'https://netmirror.plus/'
      }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve(JSON.parse(d)); } catch { resolve(null); }
      });
    }).on('error', () => resolve(null));
  });
}

function fetchText(targetUrl, referer = 'https://netmirror.plus/') {
  return new Promise((resolve, reject) => {
    https.get(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': referer,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: d }));
    }).on('error', reject);
  });
}

export default async function handler(req, res) {
  try {
    const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const id = urlObj.searchParams.get('id');
    const se = urlObj.searchParams.get('se') || '1';
    const ep = urlObj.searchParams.get('ep') || '1';
    const type = urlObj.searchParams.get('type') || 'tv';
    const tmdbIdParam = urlObj.searchParams.get('tmdb_id');
    const titleParam = urlObj.searchParams.get('title') || '';
    const langParam = urlObj.searchParams.get('lang') || '';
    const serverPref = urlObj.searchParams.get('server') || '1';

    // Fallback domains pool for playback
    const candidateDomains = [
      'webvp.watch21.shop',
      'webvp.watch212.shop',
      'bet.watch22.shop',
      'dv.watch22.shop',
      'limit.watch22.shop'
    ];

    // Priority ordering based on selected server preference
    let orderedDomains = [];
    if (serverPref === '2') {
      orderedDomains = ['bet.watch22.shop', 'dv.watch22.shop', 'limit.watch22.shop', 'webvp.watch21.shop', 'webvp.watch212.shop'];
    } else if (serverPref === '4') {
      orderedDomains = ['webvp.watch212.shop', 'webvp.watch21.shop', 'dv.watch22.shop', 'bet.watch22.shop', 'limit.watch22.shop'];
    } else if (serverPref === '5') {
      orderedDomains = ['dv.watch22.shop', 'bet.watch22.shop', 'limit.watch22.shop', 'webvp.watch21.shop', 'webvp.watch212.shop'];
    } else if (serverPref === '6') {
      orderedDomains = ['limit.watch22.shop', 'bet.watch22.shop', 'dv.watch22.shop', 'webvp.watch21.shop', 'webvp.watch212.shop'];
    } else {
      orderedDomains = ['webvp.watch21.shop', 'webvp.watch212.shop', 'bet.watch22.shop', 'dv.watch22.shop', 'limit.watch22.shop'];
    }

    let primaryDomain = orderedDomains[0];

    const timestamp = Math.floor(Date.now() / 1000);
    const secret = process.env.NETMIRROR_SECRET || 'net###@@sss';

    let targetPage = null;
    let netIdToUse = String(id || '').replace(/^dub_/, '').trim();
    let item = null;

    // Check if we have a direct NetMirror ID
    if (netIdToUse && !isNaN(Number(netIdToUse))) {
      let details = await fetchJson(`https://api2.imdb3.shop/api/${type}/${netIdToUse}`);
      if (!details || !details.results || details.results.length === 0) {
        const altType = type === 'tv' ? 'movie' : 'tv';
        const altDetails = await fetchJson(`https://api2.imdb3.shop/api/${altType}/${netIdToUse}`);
        if (altDetails && altDetails.results && altDetails.results.length > 0) {
          details = altDetails;
        }
      }
      if (details && details.results && details.results.length > 0) {
        item = details.results[0];
      }
    }

    // If ID was not passed or details not found, resolve directly from NetMirror catalog using title
    if (!item && titleParam) {
      const cleanTitle = titleParam
        .replace(/\[.*?\]|\(.*?\)/g, '')
        .replace(/\bS\d+(-S\d+)?\b/gi, '')
        .trim();
      const relatedData = await fetchJson(`https://api2.imdb4.shop/api/related/${encodeURIComponent(cleanTitle)}?page=0`);
      if (relatedData && relatedData.results && relatedData.results.length > 0) {
        let matched = null;
        if (langParam && langParam !== 'default') {
          matched = relatedData.results.find(r => r.title && r.title.toLowerCase().includes(langParam.toLowerCase()));
        }
        if (!matched) {
          matched = relatedData.results.find(r => r.title && !r.title.includes('[')) ||
                    relatedData.results.find(r => r.title && r.title.toLowerCase().includes('original')) ||
                    relatedData.results[0];
        }
        if (matched && matched.id) {
          netIdToUse = String(matched.id).replace(/^dub_/, '').trim();
          const targetType = matched.media_type || type;
          let details = await fetchJson(`https://api2.imdb3.shop/api/${targetType}/${matched.id}`);
          if (!details || !details.results || details.results.length === 0) {
            const altType = targetType === 'tv' ? 'movie' : 'tv';
            const altDetails = await fetchJson(`https://api2.imdb3.shop/api/${altType}/${matched.id}`);
            if (altDetails && altDetails.results && altDetails.results.length > 0) {
              details = altDetails;
            }
          }
          if (details && details.results && details.results.length > 0) {
            item = details.results[0];
          }
        }
      }
    }

    const resolvedType = (item && item.media_type) || type;
    const isTvMedia = resolvedType === 'tv';
    const cleanTmdbId = String(tmdbIdParam || '').replace(/^dub_/, '').trim();
    const effectiveTmdbId = (item && item.tm_id) || cleanTmdbId || (netIdToUse ? '' : '127529');
    const nextServer = serverPref === '1' ? '2' : (serverPref === '2' ? '3' : '1');
    const fallbackPlayerUrl = `/api/dubbed-player?id=${netIdToUse || ''}&tmdb_id=${effectiveTmdbId}&se=${se}&ep=${ep}&type=${resolvedType}&server=${nextServer}&title=${encodeURIComponent(titleParam)}&lang=${encodeURIComponent(langParam)}`;

    function isValidPage(page) {
      if (!page || page.status !== 200 || !page.body || page.body.length < 200) return false;
      const b = page.body;
      if (
        b.includes('Server Busy') || 
        b.includes('Time not Found') || 
        b.includes('Not Found. or Come from listed Website.') || 
        b.includes('const qualities = [];') ||
        b.includes('qualities = [];') ||
        b.includes('Server 1 did not send WATCHBOX_READY') ||
        b.includes('Server 2 did not send WATCHBOX_READY')
      ) {
        return false;
      }
      return true;
    }

    if (serverPref !== '3' && item && item.dp) {
      // 1. Play via watchbox.php with DP token (Used for all NetMirror dubbed/original releases)
      const signTarget = `${item.tm_id || effectiveTmdbId}:${timestamp}`;
      const sig = crypto.createHmac('sha256', secret).update(signTarget).digest('hex');
      const na = Buffer.from(item.title || 'Video').toString('base64');

      for (const domain of orderedDomains) {
        const watchboxUrl = `https://${domain}/play/watchbox.php?id=${item.id}&se=${se}&ep=${ep}&dp=${encodeURIComponent(item.dp || '')}&na=${encodeURIComponent(na)}&year=${encodeURIComponent(item.release_date || '2023')}&tm_id=${item.tm_id || effectiveTmdbId}&ts=${timestamp}&sig=${sig}&nid=&exten=&tv=${isTvMedia ? '1' : ''}&token=&warp=`;
        const resCandidate = await fetchText(watchboxUrl, 'https://netmirror.plus/');
        if (isValidPage(resCandidate)) {
          targetPage = resCandidate;
          primaryDomain = domain;
          break;
        }
      }
    }

    // 2. If watchbox is unavailable or failed (e.g. Server Busy), fall back to external.php across candidate domains
    if (serverPref !== '3' && !isValidPage(targetPage)) {
      const signTarget = `${effectiveTmdbId}:${timestamp}`;
      const sig = crypto.createHmac('sha256', secret).update(signTarget).digest('hex');

      for (const domain of orderedDomains) {
        const externalUrl = `https://${domain}/play/external.php?tm_id=${effectiveTmdbId}&se=${se}&ep=${ep}&tm_type=${resolvedType}&ts=${timestamp}&sig=${sig}&exten=`;
        const resCandidate = await fetchText(externalUrl, 'https://netmirror.plus/');
        if (isValidPage(resCandidate)) {
          targetPage = resCandidate;
          primaryDomain = domain;
          break;
        }
      }
    }

    // 3. Resilient Global Cluster Fallback: if Server 1 and 2 are busy or have no stream, or Server 3 requested
    if (!isValidPage(targetPage) || serverPref === '3') {
      const globalUrl = isTvMedia
        ? `https://vidlink.pro/tv/${effectiveTmdbId}/${se}/${ep}?primaryColor=e50914&autoplay=true`
        : `https://vidlink.pro/movie/${effectiveTmdbId}?primaryColor=e50914&autoplay=true`;

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Referrer-Policy', 'no-referrer');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      res.statusCode = 200;
      return res.end(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
          <meta name="referrer" content="no-referrer">
          <title>Stream Player</title>
          <style>
            html, body {
              margin: 0;
              padding: 0;
              width: 100%;
              height: 100%;
              overflow: hidden;
              background: #000;
            }
            iframe {
              width: 100%;
              height: 100%;
              border: 0;
              display: block;
              background: #000;
            }
          </style>
        </head>
        <body>
          <iframe
            src="${globalUrl}"
            allow="autoplay *; encrypted-media *; picture-in-picture *; fullscreen *"
            allowfullscreen
            referrerpolicy="no-referrer"
          ></iframe>
        </body>
        </html>
      `);
    }

    let cleanHtml = targetPage.body;

    // Check if NetMirror has no streams for this title (e.g. qualities empty or not found)
    if (cleanHtml.includes('const qualities = [];') || cleanHtml.includes('Not Found. or Come from listed Website.') || cleanHtml.includes('Server Busy')) {
      if (serverPref === '1') {
        res.writeHead(302, { 'Location': fallbackPlayerUrl });
        return res.end();
      }
    }

    // Bypass NetMirror forced browser extension check:
    // NetMirror mangles the direct stream into 'http://play_url' to force their extension.
    // We restore the real stream URL so ArtPlayer plays the direct video stream without ERR_NAME_NOT_RESOLVED!
    cleanHtml = cleanHtml.replace(/return\s+['"]https?:\/\/play_url['"];?/gi, 'return play_url;');
    cleanHtml = cleanHtml.replace(/function\s+play_url\s*\([^)]*\)\s*\{[\s\S]*?return\s+strp\([^)]*\);?\s*\}/gi, 'function play_url(u){ return u; }');
    cleanHtml = cleanHtml.replace(/function\s+strp\s*\([^)]*\)\s*\{[\s\S]*?return\s+['"][^'"]*play_url['"];?\s*\}/gi, 'function strp(u){ return u; }');

    // Replace backward and forward buttons with clean, high-res inline SVG icons
    cleanHtml = cleanHtml.replace(
      /'<div class="backword"><img src="rewind.svg"><\/div>'/g,
      `'<div class="backword" title="Rewind 10s"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="filter:drop-shadow(0 2px 6px rgba(0,0,0,0.9));"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><text x="12" y="15.5" font-size="7.5" font-weight="900" fill="white" stroke="none" text-anchor="middle" font-family="system-ui, sans-serif">10</text></svg></div>'`
    );
    cleanHtml = cleanHtml.replace(
      /'<div class="forword"><img src="forward22.svg"><\/div>'/g,
      `'<div class="forword" title="Forward 10s"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="filter:drop-shadow(0 2px 6px rgba(0,0,0,0.9));"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><text x="12" y="15.5" font-size="7.5" font-weight="900" fill="white" stroke="none" text-anchor="middle" font-family="system-ui, sans-serif">10</text></svg></div>'`
    );

    // Block ad scripts and popunder networks to eliminate Cross-Origin Read Block (CORB)
    cleanHtml = cleanHtml.replace(/<script[^>]*\b(ad|banner|popcash|popunder|syndication|clickadu|juicyads|propellerads|exoclick|histats|google-analytics|doubleclick)[^>]*>[\s\S]*?<\/script>/gi, '');
    cleanHtml = cleanHtml.replace(/<iframe[^>]*\b(ad|banner|popcash|popunder|syndication)[^>]*>[\s\S]*?<\/iframe>/gi, '');

    // Ensure full permissions policy on any nested iframe (resolves Permissions policy violation: encrypted-media)
    cleanHtml = cleanHtml.replace('<iframe id="serverFrame"', '<iframe id="serverFrame" allow="autoplay *; encrypted-media *; picture-in-picture *; fullscreen *" allowfullscreen');
    cleanHtml = cleanHtml.replace(/document\.domain\s*=\s*[^;]+;?/g, '');

    // Completely remove Cloudflare RUM analytics script to eliminate CORS errors on localhost
    cleanHtml = cleanHtml.replace(/<script[^>]*cloudflareinsights\.com[^>]*>[\s\S]*?<\/script>/gi, '');
    cleanHtml = cleanHtml.replace(/<script[^>]*beacon\.min\.js[^>]*>[\s\S]*?<\/script>/gi, '');
    cleanHtml = cleanHtml.replace(/https:\/\/[^'"]+\/cdn-cgi\/rum[^\s'"]*/gi, '');

    // Prevent ArtPlayer or NetMirror from hiding the mouse cursor
    cleanHtml = cleanHtml.replace(/cursor\s*:\s*none\s*!important/gi, 'cursor: default !important');
    cleanHtml = cleanHtml.replace(/cursor\s*:\s*none/gi, 'cursor: default');
    cleanHtml = cleanHtml.replace(/\.art-hide-cursor\s*\*?/g, '.art-hide-cursor-disabled');

    // If external.php timer triggers (NetMirror Server 1 unavailable), seamlessly jump to fast fallback
    cleanHtml = cleanHtml.replace(
      'showLoading("Not Found", "Stream is not available.");',
      `window.location.replace("${fallbackPlayerUrl}");`
    );

    // Prevent iframe from ever redirecting out to netmirror.plus (avoids X-Frame-Options sameorigin block)
    cleanHtml = cleanHtml.replace(/https?:\/\/netmirror\.(?:plus|com|app|org|shop)[^\s'"]*/gi, fallbackPlayerUrl);
    cleanHtml = cleanHtml.replace(/top\.location\s*=\s*[^;]+;?/gi, '');
    cleanHtml = cleanHtml.replace(/window\.top\.location\s*=\s*[^;]+;?/gi, '');

    // Inject base href and no-referrer policy so media CDNs allow segment fetching without CORB
    const headMeta = `<head><meta name="referrer" content="no-referrer"><base href="https://${primaryDomain}/play/">`;
    if (cleanHtml.includes('<head>')) {
      cleanHtml = cleanHtml.replace('<head>', headMeta);
    } else {
      cleanHtml = `<meta name="referrer" content="no-referrer"><base href="https://${primaryDomain}/play/">` + cleanHtml;
    }

    // Clean up unnecessary NetMirror UI elements (e.g. "How To Download" button) & enhance controls
    const injectedCleanStyles = `
      <style>
        /* Anti-Ad & Anti-Popup Overlays */
        iframe[src*="doubleclick"], iframe[src*="adservice"], iframe[src*="googleads"], 
        iframe[src*="popunder"], iframe[src*="popcash"], iframe[src*="syndication"],
        div[id*="ad-"], div[class*="ad-"], div[id*="banner"], div[class*="banner"],
        .jw-ad, .ad-container, [id*="player_ad"], .art-layer-ad, [class*="advertisement"],
        a[target="_blank"][href*="redirect"], a[target="_blank"][href*="click"],
        .server, .server-btn, .popup-window, .popup-window-ext, #toastBox, a[href*="download"], [class*="download"] {
          display: none !important;
          visibility: hidden !important;
          pointer-events: none !important;
          opacity: 0 !important;
          height: 0 !important;
          width: 0 !important;
          overflow: hidden !important;
        }

        /* Keep mouse cursor permanently visible on screen */
        *, *::before, *::after, html, body, .art-video-player, .artplayer-app, video, .art-mask, .art-layers, .art-layer, .art-bottom, .art-controls, .art-hide-cursor, .art-hide-cursor * {
          cursor: default !important;
        }
        button, a, select, input, .art-control, .art-icon, .backword, .forword, [role="button"], .art-progress, .art-video {
          cursor: pointer !important;
        }

        /* Backward & Forward 10s Buttons */
        .backword, .forword {
          display: flex !important;
          visibility: visible !important;
          opacity: 0.85 !important;
          align-items: center !important;
          justify-content: center !important;
          cursor: pointer !important;
          pointer-events: auto !important;
          background: rgba(0, 0, 0, 0.45) !important;
          border-radius: 50% !important;
          padding: 8px !important;
          border: 1px solid rgba(255, 255, 255, 0.25) !important;
          backdrop-filter: blur(4px) !important;
          transition: transform 0.2s ease, opacity 0.2s ease, background 0.2s ease !important;
          z-index: 40 !important;
          user-select: none !important;
        }
        .backword:hover, .forword:hover {
          opacity: 1 !important;
          transform: scale(1.15) !important;
          background: rgba(0, 0, 0, 0.75) !important;
          border-color: rgba(255, 255, 255, 0.5) !important;
        }
        .backword:active, .forword:active {
          transform: scale(0.95) !important;
        }
        .backword img, .forword img {
          display: none !important;
        }

        html, body, .artplayer-app {
          width: 100% !important;
          height: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
          overflow: hidden !important;
          background: #000 !important;
        }
      </style>
      <script>
        // Neutralize popups and redirects inside player iframe
        (function() {
          try {
            window.open = function() { console.warn('Popup blocked'); return null; };
            window.alert = function() {};
            window.confirm = function() { return false; };
            window.prompt = function() { return null; };
            // Intercept link clicks with external targets
            document.addEventListener('click', function(e) {
              var target = e.target && e.target.closest('a');
              if (target && target.href && !target.href.includes(window.location.host)) {
                e.preventDefault();
                e.stopPropagation();
              }
            }, true);
          } catch(e) {}
        })();

        // Ensure cursor remains visible even during playback and auto-hide
        setInterval(function() {
          try {
            var hidden = document.querySelectorAll('.art-hide-cursor');
            for (var i = 0; i < hidden.length; i++) {
              hidden[i].classList.remove('art-hide-cursor');
            }
          } catch (e) {}
        }, 150);

        window.addEventListener('mousemove', function() {
          try {
            document.documentElement.style.cursor = 'default';
            document.body.style.cursor = 'default';
            var p = document.querySelector('.art-video-player');
            if (p) {
              p.classList.remove('art-hide-cursor');
              p.style.cursor = 'default';
            }
            var v = document.querySelector('video');
            if (v) {
              v.style.cursor = 'pointer';
            }
          } catch (e) {}
        }, true);

        window.addEventListener('keydown', function(e) {
          if (e.key === 'ArrowLeft') {
            if (window.art) {
              art.backward = 10;
              if (art.notice) art.notice.show = 'Rewind 10s';
            }
          } else if (e.key === 'ArrowRight') {
            if (window.art) {
              art.forward = 10;
              if (art.notice) art.notice.show = 'Forward 10s';
            }
          } else if (e.key === ' ' || e.code === 'Space') {
            if (window.art) {
              art.toggle();
            }
          }
        });
      </script>
    `;

    if (cleanHtml.includes('</head>')) {
      cleanHtml = cleanHtml.replace('</head>', `${injectedCleanStyles}</head>`);
    } else {
      cleanHtml = cleanHtml + injectedCleanStyles;
    }

    // Neutralize any frame-busting scripts
    cleanHtml = cleanHtml.replace(/if\s*\(\s*top\s*!==\s*self\s*\)\s*top\.location\s*=\s*self\.location;?/g, '');
    cleanHtml = cleanHtml.replace(/if\s*\(\s*window\.top\s*!==\s*window\.self\s*\)\s*window\.top\.location\s*=\s*window\.self\.location;?/g, '');

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.statusCode = 200;
    return res.end(cleanHtml);
  } catch (err) {
    console.error('[DubbedPlayer Error]', err);
    res.statusCode = 500;
    return res.end('NetMirror stream temporarily unavailable: ' + err.message);
  }
}
