import https from 'https';

function fetchJson(targetUrl) {
  return new Promise((resolve) => {
    https.get(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
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

export default async function handler(req, res) {
  try {
    const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const title = urlObj.searchParams.get('title') || urlObj.searchParams.get('q') || '';

    if (!title) {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.statusCode = 200;
      return res.end(JSON.stringify({ results: [] }));
    }

    const cleanTitle = title
      .replace(/\[.*?\]|\(.*?\)/g, '')
      .replace(/\bS\d+(-S\d+)?\b/gi, '')
      .trim();

    const data = await fetchJson(`https://api2.imdb4.shop/api/related/${encodeURIComponent(cleanTitle)}?page=0`);

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.statusCode = 200;
    return res.end(JSON.stringify(data || { results: [] }));
  } catch (err) {
    console.error('[DubbedVariants Error]', err);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.statusCode = 500;
    return res.end(JSON.stringify({ error: err.message, results: [] }));
  }
}

