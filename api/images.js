export default async function handler(req, res) {
    const query = req.query.q || 'nature';

    try {
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
            res.status(200).json({ images });
        } else {
            res.status(500).json({ error: 'No results', data });
        }
    } catch (e) {
        res.status(500).json({ error: e.message || 'Error parsing api' });
    }
}
