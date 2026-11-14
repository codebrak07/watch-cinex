import https from 'https';
import crypto from 'crypto';
import { httpsAgent } from './dns-resolver.js';

function fetchJson(targetUrl) {
  return new Promise((resolve) => {
    https.get(targetUrl, {
      agent: httpsAgent,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Referer': 'https://netmirror.plus/'
      },
      timeout: 3000
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve(JSON.parse(d)); } catch { resolve(null); }
      });
    }).on('error', () => resolve(null));
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

    let netIdToUse = String(id || '').replace(/^dub_/, '').trim();
    let item = null;
    const cleanTmdbId = String(tmdbIdParam || '').replace(/^dub_/, '').trim();

    // Fast resolution: Only call external NetMirror catalog if TMDB ID is not already known
    if (!cleanTmdbId) {
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
    }

    const resolvedType = (item && item.media_type) || type;
    const isTvMedia = resolvedType === 'tv';
    const effectiveTmdbId = (item && item.tm_id) || cleanTmdbId || (netIdToUse ? '' : '127529');

    // Fast, resilient iframe provider cluster without cross-origin read blocking
    function getIframeSource(pref, tmdb, sNum, epNum, isTv) {
      if (pref === '3') {
        // Server 3 (Exact working cluster, completely untouched)
        return isTv
          ? `https://vidlink.pro/tv/${tmdb}/${sNum}/${epNum}?primaryColor=e50914&autoplay=true&fallback=true`
          : `https://vidlink.pro/movie/${tmdb}?primaryColor=e50914&autoplay=true&fallback=true`;
      } else if (pref === '2') {
        // Server 2 (2Embed High Speed Cluster)
        return isTv
          ? `https://www.2embed.cc/embedtv/${tmdb}&s=${sNum}&e=${epNum}`
          : `https://www.2embed.cc/embed/${tmdb}`;
      } else if (pref === '5') {
        // Server 5 (SmashyStream Cluster)
        return isTv
          ? `https://embed.smashystream.com/playere.php?tmdb=${tmdb}&season=${sNum}&episode=${epNum}`
          : `https://embed.smashystream.com/playere.php?tmdb=${tmdb}`;
      } else if (pref === '4') {
        // Server 4 (VidLink Mirror 4)
        return isTv
          ? `https://vidlink.pro/tv/${tmdb}/${sNum}/${epNum}?primaryColor=e50914&autoplay=true&server=4`
          : `https://vidlink.pro/movie/${tmdb}?primaryColor=e50914&autoplay=true&server=4`;
      } else if (pref === '6') {
        // Server 6 (VidLink Global High Speed)
        return isTv
          ? `https://vidlink.pro/tv/${tmdb}/${sNum}/${epNum}?primaryColor=e50914&autoplay=true&global=true`
          : `https://vidlink.pro/movie/${tmdb}?primaryColor=e50914&autoplay=true&global=true`;
      } else {
        // Server 1 (VidLink Mirror 1)
        return isTv
          ? `https://vidlink.pro/tv/${tmdb}/${sNum}/${epNum}?primaryColor=e50914&autoplay=true`
          : `https://vidlink.pro/movie/${tmdb}?primaryColor=e50914&autoplay=true`;
      }
    }

    const playerIframeUrl = getIframeSource(serverPref, effectiveTmdbId, se, ep, isTvMedia);

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
          src="${playerIframeUrl}"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
          referrerpolicy="no-referrer"
        ></iframe>
      </body>
      </html>
    `);
  } catch (err) {
    console.error('[DubbedPlayer Error]', err);
    res.statusCode = 500;
    return res.end('Stream temporarily unavailable: ' + err.message);
  }
}
