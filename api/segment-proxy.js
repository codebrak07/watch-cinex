// Segment proxy to add CORS headers and optionally rewrite URLs
// This handler expects a query parameter `url` containing the full upstream URL
// Example: /api/segment-proxy?url=https%3A%2F%2Fwebvp.watch21.shop%2Fplay%2Fsegment-1.m4s

import https from 'https';
import http from 'http';

export default async function handler(req, res) {
  try {
    const urlParam = new URL(req.url, `http://${req.headers.host || 'localhost'}`).searchParams.get('url');
    if (!urlParam) {
      res.statusCode = 400;
      res.end('Missing url parameter');
      return;
    }
    const targetUrl = decodeURIComponent(urlParam);
    const client = targetUrl.startsWith('https') ? https : http;
    client.get(targetUrl, { headers: { 'User-Agent': req.headers['user-agent'] || '' } }, (proxyRes) => {
      // Pass through status and essential headers, adding CORS
      res.statusCode = proxyRes.statusCode || 200;
      const contentType = proxyRes.headers['content-type'] || 'application/octet-stream';
      res.setHeader('Content-Type', contentType);
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', '*');
      // Pipe data directly
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

