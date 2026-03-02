import React from 'react';
import type { Slide, SlideElement } from '../types';
import { ArrowUp, ArrowDown, ArrowUpToLine, ArrowDownToLine } from 'lucide-react';

interface PropertiesPanelProps {
    slide: Slide;
    element: SlideElement | null;
    onUpdateElement: (id: string, updates: Partial<SlideElement>) => void;
    onUpdateSlide: (id: string, updates: Partial<Slide>) => void;
    onReorderElement: (direction: 'forward' | 'backward' | 'front' | 'back') => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ slide, element, onUpdateElement, onUpdateSlide, onReorderElement }) => {
    if (!element) {
        return (
            <aside className="properties-panel">
                <div className="panel-header">
                    <h3>Slide Properties</h3>
                </div>
                <div className="panel-section">
                    <h4>Background</h4>
                    <div className="prop-row">
                        <label>Color:</label>
                        <input
                            type="color"
                            value={slide.backgroundColor}
                            onChange={e => onUpdateSlide(slide.id, { backgroundColor: e.target.value })}
                        />
                    </div>
                </div>
            </aside>
        );
    }

    const handleUpdate = (updates: Partial<SlideElement>) => {
        onUpdateElement(element.id, updates);
    };

    return (
        <aside className="properties-panel">
            <div className="panel-header">
                <h3>Format {element.type === 'shape' ? 'Shape' : element.type === 'text' ? 'Text' : 'Image'}</h3>
            </div>

            <div className="panel-section">
                <h4>Size & Position</h4>
                <div className="prop-row">
                    <label>X:</label>
                    <input type="number" value={element.x} onChange={e => handleUpdate({ x: parseInt(e.target.value) || 0 })} />
                </div>
                <div className="prop-row">
                    <label>Y:</label>
                    <input type="number" value={element.y} onChange={e => handleUpdate({ y: parseInt(e.target.value) || 0 })} />
                </div>
                <div className="prop-row">
                    <label>W:</label>
                    <input type="number" value={element.width} onChange={e => handleUpdate({ width: parseInt(e.target.value) || 0 })} />
                </div>
                <div className="prop-row">
                    <label>H:</label>
                    <input type="number" value={element.height} onChange={e => handleUpdate({ height: parseInt(e.target.value) || 0 })} />
                </div>
            </div>

            <div className="panel-section">
                <h4>Layer Order</h4>
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <button className="toolbar-btn" style={{ height: 40, minWidth: 40 }} onClick={() => onReorderElement('front')} title="Bring to Front">
                        <ArrowUpToLine size={16} />
                    </button>
                    <button className="toolbar-btn" style={{ height: 40, minWidth: 40 }} onClick={() => onReorderElement('forward')} title="Bring Forward">
                        <ArrowUp size={16} />
                    </button>
                    <button className="toolbar-btn" style={{ height: 40, minWidth: 40 }} onClick={() => onReorderElement('backward')} title="Send Backward">
                        <ArrowDown size={16} />
                    </button>
                    <button className="toolbar-btn" style={{ height: 40, minWidth: 40 }} onClick={() => onReorderElement('back')} title="Send to Back">
                        <ArrowDownToLine size={16} />
                    </button>
                </div>
            </div>

            {element.type === 'shape' && (
                <div className="panel-section">
                    <h4>Appearance</h4>
                    <div className="prop-row">
                        <label>Fill:</label>
                        <input type="color" value={element.backgroundColor} onChange={e => handleUpdate({ backgroundColor: e.target.value })} />
                    </div>
                </div>
            )}

            {element.type === 'text' && (
                <div className="panel-section">
                    <h4>Text</h4>
                    <div className="prop-row">
                        <label>Content:</label>
                        <input type="text" value={element.content} onChange={e => handleUpdate({ content: e.target.value })} />
                    </div>
                    <div className="prop-row">
                        <label>Color:</label>
                        <input type="color" value={element.color} onChange={e => handleUpdate({ color: e.target.value })} />
                    </div>
                    <div className="prop-row">
                        <label>Size:</label>
                        <input type="number" value={element.fontSize} onChange={e => handleUpdate({ fontSize: parseInt(e.target.value) || 16 })} />
                    </div>
                </div>
            )}
        </aside>
    );
};
