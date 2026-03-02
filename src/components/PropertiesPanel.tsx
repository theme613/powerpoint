import React from 'react';
import type { SlideElement } from '../types';

interface PropertiesPanelProps {
    element: SlideElement | null;
    onUpdateElement: (id: string, updates: Partial<SlideElement>) => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ element, onUpdateElement }) => {
    if (!element) {
        return (
            <aside className="properties-panel empty">
                <div className="empty-state">
                    Select an element to edit its properties
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
