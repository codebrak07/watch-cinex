import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import dubbedPlayerHandler from './api/dubbed-player.js'

function dubbedPlayerPlugin() {
  return {
    name: 'dubbed-player-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && req.url.startsWith('/api/dubbed-player')) {
          try {
            await dubbedPlayerHandler(req, res);
          } catch (err) {
            console.error('[Vite DubbedPlayer Error]:', err);
            res.statusCode = 500;
            res.end('Internal server error');
          }
          return;
        }
        next();
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), dubbedPlayerPlugin()],
  server: {
    proxy: {
      '/api/tmdb': {
        target: 'https://api.themoviedb.org/3',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/tmdb/, '')
      },
      '/api/netmirror': {
        target: 'https://netmirror.plus',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/netmirror/, ''),
        headers: {
          referer: 'https://netmirror.plus/',
          origin: 'https://netmirror.plus'
        },
        configure: (proxy) => {
          proxy.on('proxyRes', (proxyRes) => {
            delete proxyRes.headers['x-frame-options'];
            delete proxyRes.headers['content-security-policy'];
          });
        }
      }
    }
  }
})
