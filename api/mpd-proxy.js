import https from 'https';

export default async function handler(req, res) {
  try {
    const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const hostParam = urlObj.searchParams.get('host') || 'https://sacdn.hakunaymatata.com';
    const scParam = urlObj.searchParams.get('sc') || '';

    // Target the real NetMirror origin
    const targetUrl = `https://netmirror.plus/play/index_web.mpd?host=${encodeURIComponent(hostParam)}&sc=${encodeURIComponent(scParam)}`;

    https.get(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://netmirror.plus/',
        'Accept': '*/*'
      }
    }, proxyRes => {
      res.statusCode = proxyRes.statusCode || 200;
      res.setHeader('Content-Type', proxyRes.headers['content-type'] || 'application/dash+xml');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', '*');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      proxyRes.pipe(res);
    }).on('error', (err) => {
      console.error('[MPD Proxy Error]', err);
      res.statusCode = 502;
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.end('');
    });
  } catch (err) {
    res.statusCode = 500;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.end('');
  }
}

