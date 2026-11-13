// Generic Fetch Proxy for all cross-origin stream assets and manifests
import https from 'https';
import http from 'http';

export default async function handler(req, res) {
  // CORS Preflight
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS, POST');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Expose-Headers', '*');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  try {
    const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const target = urlObj.searchParams.get('url');

    if (!target) {
      res.statusCode = 400;
      return res.end('Missing url parameter');
    }

    const decodedTarget = decodeURIComponent(target);
    const client = decodedTarget.startsWith('https') ? https : http;

    const requestHeaders = {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Referer': 'https://netmirror.plus/',
      'Accept': '*/*'
    };

    if (req.headers.range) {
      requestHeaders['Range'] = req.headers.range;
    }

    client.get(decodedTarget, { headers: requestHeaders }, (proxyRes) => {
      res.statusCode = proxyRes.statusCode || 200;

      const forwardHeaders = ['content-type', 'content-length', 'content-range', 'accept-ranges', 'cache-control'];
      for (const h of forwardHeaders) {
        if (proxyRes.headers[h]) {
          res.setHeader(h, proxyRes.headers[h]);
        }
      }

      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS, POST');
      res.setHeader('Access-Control-Allow-Headers', '*');

      proxyRes.pipe(res);
    }).on('error', (err) => {
      console.error('[Fetch Proxy Error]', err);
      res.statusCode = 502;
      res.end('Proxy error: ' + (err.message || ''));
    });
  } catch (err) {
    console.error('[Fetch Proxy Exception]', err);
    res.statusCode = 500;
    res.end('Internal server error');
  }
}

