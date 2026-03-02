import React, { useState } from 'react';
import { Type, Square, Circle, Image as ImageIcon, Play } from 'lucide-react';

interface TopRibbonProps {
    onInsertText: () => void;
    onInsertShape: (type: 'rectangle' | 'circle') => void;
    onInsertImage: () => void;
    onOpenImageSearch: () => void;
    onPlay: () => void;
}

const TAB_NAMES = ['Home', 'Insert', 'Design', 'Transitions', 'Animations', 'Slide Show'];

export const TopRibbon: React.FC<TopRibbonProps> = ({ onInsertText, onInsertShape, onInsertImage, onOpenImageSearch, onPlay }) => {
    const [activeTab, setActiveTab] = useState('Home');

    return (
        <header className="top-ribbon">
            <div className="ribbon-header">
                <span className="app-title">PowerPoint Replica</span>
                {/* Search bar or other top right generic tools could go here */}
            </div>

            <div className="ribbon-tabs">
                <div className="tab-item file-tab">File</div>
                {TAB_NAMES.map(tab => (
                    <div
                        key={tab}
                        className={`tab-item ${activeTab === tab ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab}
                    </div>
                ))}
            </div>

            <div className="ribbon-toolbar">
                {activeTab === 'Home' && (
                    <div className="toolbar-group">
                        <button className="toolbar-btn" onClick={onInsertText} title="Text Box">
                            <Type size={20} />
                            <span>Text</span>
                        </button>
                        <button className="toolbar-btn" onClick={() => onInsertShape('rectangle')} title="Rectangle">
                            <Square size={20} />
                            <span>Shape</span>
                        </button>
                        <button className="toolbar-btn" onClick={() => onInsertShape('circle')} title="Circle">
                            <Circle size={20} />
                        </button>
                        <button className="toolbar-btn" onClick={onInsertImage} title="Local Image">
                            <ImageIcon size={20} />
                            <span>Picture</span>
                        </button>
                        <button className="toolbar-btn" onClick={onOpenImageSearch} title="Online Pictures">
                            <ImageIcon size={20} />
                            <span>Online</span>
                        </button>
                        <div className="toolbar-divider" />
                        <button className="toolbar-btn highlight" onClick={onPlay} title="Start Slide Show">
                            <Play size={20} fill="currentColor" />
                            <span>Play</span>
                        </button>
                    </div>
                )}
                {activeTab === 'Insert' && (
                    <div className="toolbar-group">
                        <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Insert options here</span>
                    </div>
                )}
            </div>
        </header>
    );
};
