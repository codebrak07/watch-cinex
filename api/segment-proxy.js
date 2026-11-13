// Segment Proxy for MPEG-DASH and HLS video chunks (.m4s, .ts, etc.)
import https from 'https';
import http from 'http';

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
    const urlParam = urlObj.searchParams.get('url');
    if (!urlParam) {
      res.statusCode = 400;
      return res.end('Missing url parameter');
    }

    const targetUrl = decodeURIComponent(urlParam);
    const client = targetUrl.startsWith('https') ? https : http;

    const requestHeaders = {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Referer': 'https://netmirror.plus/',
      'Accept': '*/*'
    };

    if (req.headers.range) {
      requestHeaders['Range'] = req.headers.range;
    }

    client.get(targetUrl, { headers: requestHeaders }, (proxyRes) => {
      res.statusCode = proxyRes.statusCode || 200;

      const forwardHeaders = ['content-type', 'content-length', 'content-range', 'accept-ranges', 'cache-control'];
      for (const h of forwardHeaders) {
        if (proxyRes.headers[h]) {
          res.setHeader(h, proxyRes.headers[h]);
        }
      }

      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', '*');

      proxyRes.pipe(res);
    }).on('error', (err) => {
      console.error('[Segment Proxy Error]', err);
      res.statusCode = 502;
      res.end('');
    });
  } catch (err) {
    console.error('[Segment Proxy Exception]', err);
    res.statusCode = 500;
    res.end('');
  }
}
