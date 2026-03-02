import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import https from 'https'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'image-search-proxy',
      configureServer(server) {
        server.middlewares.use('/api/images', async (req, res) => {
          const url = new URL(req.url || '', `http://${req.headers.host}`);
          const query = url.searchParams.get('q') || 'nature';

          try {
            // Use Unsplash front-end API for public searches
            const apiUrl = `https://unsplash.com/napi/search/photos?query=${encodeURIComponent(query)}&per_page=30`;
            const response = await fetch(apiUrl, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
              }
            });
            const data = await response.json();

            if (data && data.results) {
              const images = data.results.map((r: any) => ({
                id: r.id,
                url: r.urls.regular,
                thumb: r.urls.small,
                author: r.user.name,
                width: r.width,
                height: r.height
              }));
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ images }));
            } else {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: 'No results', data }));
            }
          } catch (e: any) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: e.message || 'Error parsing api' }));
          }
        });
      }
    }
  ],
})
