// Segment Proxy for MPEG-DASH and HLS video chunks (.m4s, .ts, etc.) with CloudFront authorization and CORS
import https from 'https';
import http from 'http';
import { httpsAgent } from './dns-resolver.js';

function extractCookie(scParam) {
  if (!scParam || scParam === 'none') return '';
  if (scParam.includes('CloudFront-')) return scParam;
  try {
    const decoded = Buffer.from(scParam, 'base64').toString('utf8');
    if (decoded.includes('CloudFront-') || decoded.includes('=')) return decoded;
  } catch (e) {}
  return scParam;
}

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
    const pathname = urlObj.pathname;

    let targetUrl = '';
    let cookieHeader = '';

    // 1. Path-based resolution: /api/segment-proxy/:hostToken/:scToken/*
    const prefix = '/api/segment-proxy/';
    if (pathname.startsWith(prefix)) {
      const after = pathname.slice(prefix.length);
      const slash1 = after.indexOf('/');
      if (slash1 !== -1) {
        const hostToken = after.slice(0, slash1);
        const restAfterHost = after.slice(slash1 + 1);
        const slash2 = restAfterHost.indexOf('/');
        if (slash2 !== -1) {
          const scToken = restAfterHost.slice(0, slash2);
          const chunkPath = restAfterHost.slice(slash2 + 1);
          try {
            const decodedHost = Buffer.from(hostToken, 'base64url').toString('utf8');
            let decodedSc = '';
            try {
              decodedSc = Buffer.from(scToken, 'base64url').toString('utf8');
            } catch (e) {
              decodedSc = scToken;
            }
            cookieHeader = extractCookie(decodedSc);
            targetUrl = decodedHost.replace(/\/$/, '') + '/' + chunkPath.replace(/^\//, '');
          } catch (e) {}
        }
      }
    }

    // 2. Query parameter fallback: /api/segment-proxy?url=...&sc=...
    if (!targetUrl) {
      const urlParam = urlObj.searchParams.get('url');
      const scParam = urlObj.searchParams.get('sc');
      const relParam = urlObj.searchParams.get('rel');

      if (urlParam) {
        targetUrl = decodeURIComponent(urlParam);
        if (relParam) {
          targetUrl = targetUrl.endsWith('/') ? targetUrl + relParam : targetUrl + '/' + relParam;
        }
        if (scParam) {
          cookieHeader = extractCookie(scParam);
        }
      }
    }

    if (!targetUrl) {
      res.statusCode = 400;
      return res.end('Missing segment target URL');
    }

    const client = targetUrl.startsWith('https') ? https : http;

    const requestHeaders = {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Referer': 'https://netmirror.plus/',
      'Accept': '*/*'
    };

    if (cookieHeader) {
      requestHeaders['Cookie'] = cookieHeader;
    }

    if (req.headers.range) {
      requestHeaders['Range'] = req.headers.range;
    }

    const proxyReq = client.get(targetUrl, { headers: requestHeaders, agent: client === https ? httpsAgent : undefined }, (proxyRes) => {
      res.statusCode = proxyRes.statusCode || 200;

      const forwardHeaders = ['content-type', 'content-length', 'content-range', 'accept-ranges'];
      for (const h of forwardHeaders) {
        if (proxyRes.headers[h]) {
          res.setHeader(h, proxyRes.headers[h]);
        }
      }

      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', '*');
      res.setHeader('Access-Control-Expose-Headers', '*');

      proxyRes.pipe(res);
    });

    proxyReq.on('error', (err) => {
      console.error('[Segment Proxy Error]', err.message);
      res.statusCode = 502;
      res.end('');
    });
  } catch (err) {
    console.error('[Segment Proxy Exception]', err.message);
    res.statusCode = 500;
    res.end('');
  }
}
