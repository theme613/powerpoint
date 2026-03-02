import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


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
          const enableNsfw = url.searchParams.get('nsfw') === 'true';

          try {
            if (enableNsfw) {
              const apiUrl = `https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&include_over_18=on&limit=50`;
              const response = await fetch(apiUrl, {
                headers: { 'User-Agent': 'PowerPointReplica/1.0.0' }
              });
              const data = await response.json();

              let images: any[] = [];
              if (data && (data as any).data && (data as any).data.children) {
                const posts = (data as any).data.children.filter((p: any) => !p.data.is_video && p.data.url && p.data.url.match(/\.(jpeg|jpg|png|gif)$/i));
                images = posts.map((p: any) => {
                  let thumb = p.data.url;
                  if (p.data.thumbnail && p.data.thumbnail.startsWith('http')) {
                    thumb = p.data.thumbnail;
                  } else if (p.data.preview && p.data.preview.images && p.data.preview.images[0].resolutions.length > 0) {
                    thumb = p.data.preview.images[0].resolutions[0].url.replace(/&amp;/g, '&');
                  }

                  return {
                    id: p.data.id,
                    url: p.data.url,
                    thumb: thumb,
                    author: p.data.author,
                    width: 800,
                    height: 800
                  };
                });
              }
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ images }));
            } else {
              // Use Unsplash front-end API for public/safe searches
              const apiUrl = `https://unsplash.com/napi/search/photos?query=${encodeURIComponent(query)}&per_page=30`;
              const response = await fetch(apiUrl, {
                headers: {
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
              });
              const data = await response.json();

              if (data && (data as any).results) {
                const images = (data as any).results.map((r: any) => ({
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
