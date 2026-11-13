// High-speed DNS-over-HTTPS (DoH) resolver and DNS cache using Cloudflare Anycast IPs
// Bypasses ISP DNS blocking, VPN limitations, and cloud datacenter DNS latency
import https from 'https';
import dns from 'dns';

export const STATIC_DNS = {
  'bet.watch22.shop': '104.21.13.86',
  'webvp.watch21.shop': '104.21.40.39',
  'dv.watch22.shop': '104.21.13.86',
  'limit.watch22.shop': '172.67.132.165',
  'netmirror.plus': '104.21.72.100',
  'api2.imdb3.shop': '104.21.40.15',
  'api2.imdb4.shop': '104.21.40.15'
};

const dynamicCache = new Map();

export function resolveDoh(hostname) {
  return new Promise((resolve) => {
    https.get(`https://1.1.1.1/dns-query?name=${encodeURIComponent(hostname)}&type=A`, {
      headers: { 'Accept': 'application/dns-json' },
      timeout: 2000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.Answer && json.Answer.length > 0) {
            const aRecord = json.Answer.find(r => r.type === 1);
            if (aRecord && aRecord.data) {
              dynamicCache.set(hostname, aRecord.data);
              return resolve(aRecord.data);
            }
          }
        } catch (e) {}
        resolve(null);
      });
    }).on('error', () => resolve(null));
  });
}

export function customLookup(hostname, options, cb) {
  if (typeof options === 'function') {
    cb = options;
    options = {};
  }
  const cachedIp = dynamicCache.get(hostname) || STATIC_DNS[hostname];
  if (cachedIp) {
    if (options && options.all) {
      return cb(null, [{ address: cachedIp, family: 4 }]);
    }
    return cb(null, cachedIp, 4);
  }
  dns.lookup(hostname, options, (err, address, family) => {
    if (err) {
      resolveDoh(hostname).then((ip) => {
        if (ip) {
          if (options && options.all) return cb(null, [{ address: ip, family: 4 }]);
          return cb(null, ip, 4);
        }
        cb(err);
      });
      return;
    }
    cb(null, address, family);
  });
}

export const httpsAgent = new https.Agent({
  keepAlive: true,
  maxSockets: 64,
  lookup: customLookup
});
