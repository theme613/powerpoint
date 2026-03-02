import React, { useState, useEffect } from 'react';
import { Search, Loader2, X } from 'lucide-react';

interface PinterestImage {
    id: string;
    url: string;
    thumb: string;
    author: string;
    width: number;
    height: number;
}

interface ImageSearchPanelProps {
    onClose: () => void;
    onInsertImage: (url: string, width: number, height: number) => void;
}

export const ImageSearchPanel: React.FC<ImageSearchPanelProps> = ({ onClose, onInsertImage }) => {
    const [query, setQuery] = useState('');
    const [images, setImages] = useState<PinterestImage[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const searchImages = async (searchQuery: string) => {
        if (!searchQuery.trim()) return;
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/images?q=${encodeURIComponent(searchQuery)}`);
            const data = await res.json();
            if (data.images) {
                setImages(data.images);
            } else {
                setError(data.error || 'No results found');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to fetch images');
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            searchImages(query);
        }
    };

    // Pre-load some generic images on first open
    useEffect(() => {
        searchImages('aesthetic wallpaper');
    }, []);

    return (
        <aside className="image-search-panel">
            <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>Online Pictures</h3>
                <button onClick={onClose} style={{ padding: 4, cursor: 'pointer', background: 'transparent', color: 'var(--text-secondary)' }}>
                    <X size={16} />
                </button>
            </div>

            <div className="search-bar-container">
                <div className="search-input-wrapper">
                    <Search size={16} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search ideas, nature, cats..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                </div>
                <button className="search-btn" onClick={() => searchImages(query)} disabled={loading}>
                    Search
                </button>
            </div>

            <div className="image-results">
                {loading && (
                    <div className="loading-state">
                        <Loader2 className="spinner" size={24} />
                        <span>Searching...</span>
                    </div>
                )}

                {error && (
                    <div className="error-state">{error}</div>
                )}

                {!loading && !error && images.length === 0 && (
                    <div className="empty-state">No images found</div>
                )}

                <div className="masonry-grid">
                    {images.map(img => (
                        <div
                            key={img.id}
                            className="grid-item"
                            onClick={() => onInsertImage(img.url, img.width, img.height)}
                        >
                            <img src={img.thumb} alt={img.author} loading="lazy" />
                            <div className="img-overlay">
                                <span>By {img.author}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </aside>
    );
};
