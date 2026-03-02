import React, { useState } from 'react';
import { Type, Square, Circle, Image as ImageIcon, Play, Bold, Italic, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import type { SlideElement, TextElement } from '../types';

interface TopRibbonProps {
    onInsertText: () => void;
    onInsertShape: (type: 'rectangle' | 'circle') => void;
    onInsertImage: () => void;
    onOpenImageSearch: () => void;
    onPlay: () => void;
    activeElement: SlideElement | null;
    onUpdateElement: (id: string, updates: Partial<SlideElement>) => void;
}

const TAB_NAMES = ['Home', 'Insert', 'Design', 'Transitions', 'Animations', 'Slide Show'];

export const TopRibbon: React.FC<TopRibbonProps> = ({
    onInsertText, onInsertShape, onInsertImage, onOpenImageSearch, onPlay,
    activeElement, onUpdateElement
}) => {
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

                        {activeElement?.type === 'text' && (
                            <>
                                <div className="toolbar-divider" />
                                <button
                                    className={`toolbar-btn ${(activeElement as TextElement).fontWeight === 'bold' ? 'active' : ''}`}
                                    onClick={() => onUpdateElement(activeElement.id, { fontWeight: (activeElement as TextElement).fontWeight === 'bold' ? 'normal' : 'bold' })}
                                    title="Bold"
                                >
                                    <Bold size={18} />
                                </button>
                                <button
                                    className={`toolbar-btn ${(activeElement as TextElement).fontStyle === 'italic' ? 'active' : ''}`}
                                    onClick={() => onUpdateElement(activeElement.id, { fontStyle: (activeElement as TextElement).fontStyle === 'italic' ? 'normal' : 'italic' })}
                                    title="Italic"
                                >
                                    <Italic size={18} />
                                </button>
                                <div className="toolbar-divider" />
                                <button
                                    className={`toolbar-btn ${(activeElement as TextElement).textAlign === 'left' ? 'active' : ''}`}
                                    onClick={() => onUpdateElement(activeElement.id, { textAlign: 'left' })}
                                    title="Align Left"
                                >
                                    <AlignLeft size={18} />
                                </button>
                                <button
                                    className={`toolbar-btn ${(activeElement as TextElement).textAlign === 'center' || !(activeElement as TextElement).textAlign ? 'active' : ''}`}
                                    onClick={() => onUpdateElement(activeElement.id, { textAlign: 'center' })}
                                    title="Align Center"
                                >
                                    <AlignCenter size={18} />
                                </button>
                                <button
                                    className={`toolbar-btn ${(activeElement as TextElement).textAlign === 'right' ? 'active' : ''}`}
                                    onClick={() => onUpdateElement(activeElement.id, { textAlign: 'right' })}
                                    title="Align Right"
                                >
                                    <AlignRight size={18} />
                                </button>
                            </>
                        )}
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
