import React from 'react';
import type { Presentation } from '../types';

interface SidebarProps {
    presentation: Presentation;
    activeSlideId: string;
    onSelectSlide: (id: string) => void;
    onAddSlide: () => void;
    onDeleteSlide: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ presentation, activeSlideId, onSelectSlide, onAddSlide, onDeleteSlide }) => {
    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <button className="add-slide-btn" onClick={onAddSlide}>
                    + New Slide
                </button>
            </div>

            <div className="thumbnail-list">
                {presentation.slides.map((slide, index) => (
                    <div
                        key={slide.id}
                        className={`thumbnail-container ${activeSlideId === slide.id ? 'active' : ''}`}
                        onClick={() => onSelectSlide(slide.id)}
                        style={{ position: 'relative' }}
                    >
                        <div className="thumbnail-number">{index + 1}</div>
                        <div className="thumbnail-preview">
                            {/* Mini representation of the slide could go here */}
                            <div className="thumbnail-inner" style={{ background: slide.backgroundColor }} />
                        </div>
                        <button
                            className="delete-slide-btn"
                            title="Delete Slide"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDeleteSlide(slide.id);
                            }}
                            style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: 20, height: 20, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: presentation.slides.length > 1 ? 1 : 0, pointerEvents: presentation.slides.length > 1 ? 'auto' : 'none' }}
                        >
                            ✕
                        </button>
                    </div>
                ))}
            </div>
        </aside>
    );
}
