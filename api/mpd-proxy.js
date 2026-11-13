// MPD proxy with optional explicit URL and segment rewrite
import https from 'https';

export default async function handler(req, res) {
  try {
    const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    // If caller supplies a full MPD URL via ?url=, use that; otherwise fall back to NetMirror construction
    const explicitUrl = urlObj.searchParams.get('url');
    let targetUrl = '';
    if (explicitUrl) {
      targetUrl = decodeURIComponent(explicitUrl);
    } else {
      const hostParam = urlObj.searchParams.get('host') || 'https://sacdn.hakunaymatata.com';
      const scParam = urlObj.searchParams.get('sc') || '';
      targetUrl = `https://netmirror.plus/play/index_web.mpd?host=${encodeURIComponent(hostParam)}&sc=${encodeURIComponent(scParam)}`;
    }

    https.get(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://netmirror.plus/',
        'Accept': '*/*'
      }
    }, (proxyRes) => {
      // Buffer the manifest so we can rewrite any .m4s segment URLs to go through our segment‑proxy
      let body = '';
      proxyRes.on('data', (chunk) => (body += chunk));
      proxyRes.on('end', () => {
        const rewritten = body.replace(/(https?:\/\/[^'"\s]+\.m4s)/g, (match) => {
          const enc = encodeURIComponent(match);
          return `/api/segment-proxy?url=${enc}`;
        });
        res.statusCode = proxyRes.statusCode || 200;
        res.setHeader('Content-Type', proxyRes.headers['content-type'] || 'application/dash+xml');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', '*');
        res.end(rewritten);
      });
    }).on('error', (err) => {
      console.error('[MPD Proxy Error]', err);
      res.statusCode = 502;
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.end('');
    });
  } catch (err) {
    console.error('[MPD Proxy Exception]', err);
    res.statusCode = 500;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.end('');
  }
}
