// MPD proxy with explicit URL, relative/absolute segment rewrite, and CORS injection
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
    const explicitUrl = urlObj.searchParams.get('url');
    let targetUrl = '';

    if (explicitUrl) {
      targetUrl = decodeURIComponent(explicitUrl);
    } else {
      const hostParam = urlObj.searchParams.get('host') || 'https://sacdn.hakunaymatata.com';
      const scParam = urlObj.searchParams.get('sc') || '';
      targetUrl = `https://netmirror.plus/play/index_web.mpd?host=${encodeURIComponent(hostParam)}&sc=${encodeURIComponent(scParam)}`;
    }

    const client = targetUrl.startsWith('https') ? https : http;
    const upstreamUrlObj = new URL(targetUrl);
    const upstreamBase = `${upstreamUrlObj.protocol}//${upstreamUrlObj.host}${upstreamUrlObj.pathname.substring(0, upstreamUrlObj.pathname.lastIndexOf('/') + 1)}`;

    client.get(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://netmirror.plus/',
        'Accept': '*/*'
      }
    }, (proxyRes) => {
      let body = '';
      proxyRes.on('data', (chunk) => (body += chunk));
      proxyRes.on('end', () => {
        // Rewrite all .m4s segment URLs (both absolute and relative) to go through /api/segment-proxy
        let rewritten = body.replace(/((?:https?:\/\/[^'"\s<>]+\.m4s|[\w\-./]+\.m4s)(?:\?[^'"\s<>]*)?)/gi, (match) => {
          let fullSegmentUrl = match;
          if (!fullSegmentUrl.startsWith('http://') && !fullSegmentUrl.startsWith('https://')) {
            fullSegmentUrl = upstreamBase + fullSegmentUrl;
          }
          return `/api/segment-proxy?url=${encodeURIComponent(fullSegmentUrl)}`;
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
