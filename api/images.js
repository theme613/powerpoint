export default async function handler(req, res) {
    const query = req.query.q || 'nature';
    const enableNsfw = req.query.nsfw === 'true';

    try {
        if (enableNsfw) {
            // Use Reddit API for NSFW image search
            const apiUrl = `https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&include_over_18=on&limit=50`;
            const response = await fetch(apiUrl, {
                headers: { 'User-Agent': 'PowerPointReplica/1.0.0' }
            });
            const data = await response.json();

            let images = [];
            if (data && data.data && data.data.children) {
                const posts = data.data.children.filter(p => !p.data.is_video && p.data.url && p.data.url.match(/\.(jpeg|jpg|png|gif)$/i));
                images = posts.map(p => {
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
            return res.status(200).json({ images });
        } else {
            // Use Unsplash front-end API for public/safe searches
            const apiUrl = `https://unsplash.com/napi/search/photos?query=${encodeURIComponent(query)}&per_page=30`;
            const response = await fetch(apiUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });
            const data = await response.json();

            if (data && data.results) {
                const images = data.results.map((r) => ({
                    id: r.id,
                    url: r.urls.regular,
                    thumb: r.urls.small,
                    author: r.user.name,
                    width: r.width,
                    height: r.height
                }));
                return res.status(200).json({ images });
            } else {
                return res.status(500).json({ error: 'No results', data });
            }
        }
    } catch (e) {
        return res.status(500).json({ error: e.message || 'Error parsing api' });
    }
}
