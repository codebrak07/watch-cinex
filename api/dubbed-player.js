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
    const serverPref = urlObj.searchParams.get('server') || '1';

    const primaryDomain = serverPref === '2' ? 'bet.watch22.shop' : 'webvp.watch21.shop';
    const fallbackDomain = serverPref === '2' ? 'webvp.watch21.shop' : 'bet.watch22.shop';

    const timestamp = Math.floor(Date.now() / 1000);
    const secret = 'net###@@sss';
    const effectiveTmdbId = tmdbIdParam || id || '127529';

    let targetPage = null;

    // Check if we have a direct NetMirror ID
    let item = null;
    let netIdToUse = id;
    if (netIdToUse && !isNaN(Number(netIdToUse))) {
      const details = await fetchJson(`https://api2.imdb3.shop/api/${type}/${netIdToUse}`);
      if (details && details.results && details.results.length > 0) {
        item = details.results[0];
      }
    } else if (effectiveTmdbId) {
      const searchRes = await fetchJson(`https://api2.imdb3.shop/api/${type}/${effectiveTmdbId}`);
      if (searchRes && searchRes.results && searchRes.results.length > 0 && searchRes.results[0].dp) {
        item = searchRes.results[0];
      }
    }

    if (item && item.dp) {
      // 1. Play via watchbox.php with DP token (Used for all NetMirror dubbed/original releases)
      const signTarget = `${item.tm_id || effectiveTmdbId}:${timestamp}`;
      const sig = crypto.createHmac('sha256', secret).update(signTarget).digest('hex');
      const na = Buffer.from(item.title || 'Video').toString('base64');

      const watchboxUrl = `https://${primaryDomain}/play/watchbox.php?id=${item.id}&se=${se}&ep=${ep}&dp=${encodeURIComponent(item.dp || '')}&na=${encodeURIComponent(na)}&year=${encodeURIComponent(item.release_date || '2023')}&tm_id=${item.tm_id || effectiveTmdbId}&ts=${timestamp}&sig=${sig}&nid=&exten=&tv=${type === 'tv' ? '1' : ''}&token=&warp=`;
      targetPage = await fetchText(watchboxUrl, 'https://netmirror.plus/');

      if (targetPage.status !== 200 || !targetPage.body || targetPage.body.length < 500) {
        const fallbackUrl = `https://${fallbackDomain}/play/watchbox.php?id=${item.id}&se=${se}&ep=${ep}&dp=${encodeURIComponent(item.dp || '')}&na=${encodeURIComponent(na)}&year=${encodeURIComponent(item.release_date || '2023')}&tm_id=${item.tm_id || effectiveTmdbId}&ts=${timestamp}&sig=${sig}&nid=&exten=&tv=${type === 'tv' ? '1' : ''}&token=&warp=`;
        const fbPage = await fetchText(fallbackUrl, 'https://netmirror.plus/');
        if (fbPage.status === 200 && fbPage.body.length > 500) {
          targetPage = fbPage;
        }
      }
    } else {
      // 2. Play generic TMDB show/movie via external.php on NetMirror servers
      const signTarget = `${effectiveTmdbId}:${timestamp}`;
      const sig = crypto.createHmac('sha256', secret).update(signTarget).digest('hex');

      const externalUrl = `https://${primaryDomain}/play/external.php?tm_id=${effectiveTmdbId}&se=${se}&ep=${ep}&tm_type=${type}&ts=${timestamp}&sig=${sig}&exten=`;
      targetPage = await fetchText(externalUrl, 'https://netmirror.plus/');

      if (targetPage.status !== 200 || !targetPage.body || targetPage.body.length < 500) {
        const fallbackUrl = `https://${fallbackDomain}/play/external.php?tm_id=${effectiveTmdbId}&se=${se}&ep=${ep}&tm_type=${type}&ts=${timestamp}&sig=${sig}&exten=`;
        const fbPage = await fetchText(fallbackUrl, 'https://netmirror.plus/');
        if (fbPage.status === 200 && fbPage.body.length > 500) {
          targetPage = fbPage;
        }
      }
    }

    const fallbackPlayerUrl = type === 'tv'
      ? `https://vidlink.pro/tv/${effectiveTmdbId}/${se}/${ep}?primaryColor=e50914&autoplay=false&fallback=true`
      : `https://vidlink.pro/movie/${effectiveTmdbId}?primaryColor=e50914&autoplay=false&fallback=true`;

    if (!targetPage || !targetPage.body || targetPage.body.length < 200) {
      res.writeHead(302, { 'Location': fallbackPlayerUrl });
      return res.end();
    }

    let cleanHtml = targetPage.body;

    // Check if NetMirror has no streams for this title (e.g. qualities empty or not found)
    if (cleanHtml.includes('const qualities = [];') || cleanHtml.includes('Not Found. or Come from listed Website.')) {
      res.writeHead(302, { 'Location': fallbackPlayerUrl });
      return res.end();
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

    // Ensure full permissions policy on any nested iframe (resolves Permissions policy violation: encrypted-media)
    cleanHtml = cleanHtml.replace('<iframe id="serverFrame"', '<iframe id="serverFrame" allow="autoplay *; encrypted-media *; picture-in-picture *; fullscreen *" allowfullscreen');
    cleanHtml = cleanHtml.replace(/document\.domain\s*=\s*[^;]+;?/g, '');

    // Completely remove Cloudflare RUM analytics script to eliminate CORS errors on localhost
    cleanHtml = cleanHtml.replace(/<script[^>]*cloudflareinsights\.com[^>]*>[\s\S]*?<\/script>/gi, '');
    cleanHtml = cleanHtml.replace(/<script[^>]*beacon\.min\.js[^>]*>[\s\S]*?<\/script>/gi, '');
    cleanHtml = cleanHtml.replace(/https:\/\/[^'"]+\/cdn-cgi\/rum[^\s'"]*/gi, '');

    // If external.php timer triggers (NetMirror Server 1 unavailable), seamlessly jump to fast fallback
    cleanHtml = cleanHtml.replace(
      'showLoading("Not Found", "Stream is not available.");',
      `window.location.replace("${fallbackPlayerUrl}");`
    );

    // Inject base href so all relative media/icons resolve properly to the origin server
    if (cleanHtml.includes('<head>')) {
      cleanHtml = cleanHtml.replace('<head>', `<head><base href="https://${primaryDomain}/play/">`);
    } else {
      cleanHtml = `<base href="https://${primaryDomain}/play/">` + cleanHtml;
    }

    // Clean up unnecessary NetMirror UI elements (e.g. "How To Download" button) & enhance controls
    const injectedCleanStyles = `
      <style>
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
        *, *::before, *::after, html, body, .art-video-player, .artplayer-app, video, .art-mask, .art-layers, .art-layer, .art-bottom, .art-controls {
          cursor: default !important;
        }
        button, a, select, input, .art-control, .art-icon, .backword, .forword, [role="button"], .art-progress {
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

    cleanHtml = cleanHtml.replace('</head>', `${injectedCleanStyles}</head>`);

    // Neutralize any frame-busting scripts
    cleanHtml = cleanHtml.replace(/if\s*\(\s*top\s*!==\s*self\s*\)\s*top\.location\s*=\s*self\.location;?/g, '');
    cleanHtml = cleanHtml.replace(/if\s*\(\s*window\.top\s*!==\s*window\.self\s*\)\s*window\.top\.location\s*=\s*window\.self\.location;?/g, '');

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.statusCode = 200;
    return res.end(cleanHtml);
  } catch (err) {
    console.error('[DubbedPlayer Error]', err);
    res.statusCode = 500;
    return res.end('NetMirror stream temporarily unavailable: ' + err.message);
  }
}
