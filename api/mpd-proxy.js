// MPD proxy with explicit URL, relative/absolute segment rewrite, CloudFront cookie forwarding, and CORS injection
import https from 'https';

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

    let hostParam = urlObj.searchParams.get('host') || 'https://sacdn.hakunaymatata.com';
    let scParam = urlObj.searchParams.get('sc') || '';

    if (explicitUrl) {
      try {
        const decoded = decodeURIComponent(explicitUrl);
        const parsedExplicit = new URL(decoded.startsWith('http') ? decoded : `http://localhost/${decoded}`);
        if (parsedExplicit.searchParams.get('host')) hostParam = parsedExplicit.searchParams.get('host');
        if (parsedExplicit.searchParams.get('sc')) scParam = parsedExplicit.searchParams.get('sc');
      } catch (e) {}
    }

    // Always fetch authentic DASH manifest directly from netmirror.plus
    const targetUrl = `https://netmirror.plus/play/index_web.mpd?host=${encodeURIComponent(hostParam)}&sc=${encodeURIComponent(scParam)}`;

    https.get(targetUrl, {
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

        // 1. Rewrite <BaseURL> tags in DASH manifest so chunk requests go through /api/segment-proxy with CloudFront authorization
        let rewritten = body.replace(/<BaseURL>([^<]+)<\/BaseURL>/gi, (match, rawBase) => {
          let fullBase = rawBase.trim();
          return `<BaseURL>${origin}/api/segment-proxy?url=${encodeURIComponent(fullBase)}&amp;sc=${encodeURIComponent(scParam)}&amp;rel=</BaseURL>`;
        });

        // 2. Rewrite any direct .m4s or .ts segment references
        rewritten = rewritten.replace(/((?:https?:\/\/[^'"\s<>]+\.(?:m4s|ts)|[\w\-./]+\.(?:m4s|ts))(?:\?[^'"\s<>]*)?)/gi, (match) => {
          let fullSegmentUrl = match;
          return `${origin}/api/segment-proxy?url=${encodeURIComponent(fullSegmentUrl)}&sc=${encodeURIComponent(scParam)}`;
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
