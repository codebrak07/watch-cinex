// MPD proxy with path-based segment rewrite, CloudFront cookie forwarding, and CORS injection
import https from 'https';
import { httpsAgent } from './dns-resolver.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Expose-Headers', '*');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  try {
    const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const explicitUrl = urlObj.searchParams.get('url');

    let hostParam = urlObj.searchParams.get('host') || 'https://sacdn.hakunaymatata.com/dash/';
    let scParam = urlObj.searchParams.get('sc') || '';

    if (explicitUrl) {
      try {
        let cleanUrl = explicitUrl;
        try { cleanUrl = decodeURIComponent(explicitUrl); } catch(e) {}
        const parsedExplicit = new URL(cleanUrl.startsWith('http') ? cleanUrl : `http://localhost/${cleanUrl.replace(/^\//, '')}`);
        if (parsedExplicit.searchParams.get('host')) hostParam = parsedExplicit.searchParams.get('host');
        if (parsedExplicit.searchParams.get('sc')) scParam = parsedExplicit.searchParams.get('sc');
      } catch (e) {}
    }

    if (!hostParam.endsWith('/')) {
      hostParam += '/';
    }

    // Always fetch authentic DASH manifest directly from netmirror.plus
    const targetUrl = `https://netmirror.plus/play/index_web.mpd?host=${encodeURIComponent(hostParam)}&sc=${encodeURIComponent(scParam)}`;

    https.get(targetUrl, {
      agent: httpsAgent,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://netmirror.plus/',
        'Accept': '*/*'
      }
    }, (proxyRes) => {
      let body = '';
      proxyRes.on('data', (chunk) => (body += chunk));
      proxyRes.on('end', () => {
        let origin = '';
        if (req.headers['x-forwarded-host']) {
          origin = `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers['x-forwarded-host']}`;
        } else if (req.headers.host) {
          origin = `https://${req.headers.host}`;
        }

        const hostToken = Buffer.from(hostParam).toString('base64url');
        const scToken = Buffer.from(scParam || 'none').toString('base64url');
        const rootBase = `${origin}/api/segment-proxy/${hostToken}/${scToken}/`;

        let rewritten = body;

        // 1. Rewrite absolute <BaseURL> to our path-based segment proxy root
        if (/<BaseURL>https?:\/\/[^<]+<\/BaseURL>/i.test(rewritten)) {
          rewritten = rewritten.replace(/<BaseURL>https?:\/\/[^<]+<\/BaseURL>/gi, `<BaseURL>${rootBase}</BaseURL>`);
        } else if (!/<BaseURL>/i.test(rewritten)) {
          // If no BaseURL exists in manifest, inject the rootBase into the Period or MPD element
          if (/<Period/i.test(rewritten)) {
            rewritten = rewritten.replace(/<Period([^>]*)>/i, `<Period$1>\n    <BaseURL>${rootBase}</BaseURL>`);
          } else {
            rewritten = rewritten.replace(/<MPD([^>]*)>/i, `<MPD$1>\n  <BaseURL>${rootBase}</BaseURL>`);
          }
        }

        // 2. Rewrite any direct absolute segment references starting with http(s)
        rewritten = rewritten.replace(/(https?:\/\/[^'"\s<>]+\.(?:m4s|ts)(?:\?[^'"\s<>]*)?)/gi, (match) => {
          return `${origin}/api/segment-proxy?url=${encodeURIComponent(match)}&sc=${encodeURIComponent(scParam)}`;
        });

        res.statusCode = proxyRes.statusCode || 200;
        res.setHeader('Content-Type', proxyRes.headers['content-type'] || 'application/dash+xml');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', '*');
        res.setHeader('Cache-Control', 'public, max-age=3600');
        res.end(rewritten);
      });
    }).on('error', (err) => {
      console.error('[MPD Proxy Error]', err.message);
      res.statusCode = 502;
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.end('');
    });
  } catch (err) {
    console.error('[MPD Proxy Exception]', err.message);
    res.statusCode = 500;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.end('');
  }
}
