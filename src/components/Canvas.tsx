import React, { useRef, useState } from 'react';
import type { Slide, SlideElement } from '../types';

interface CanvasProps {
    slide: Slide;
    activeElementId: string | null;
    onSelectElement: (id: string | null) => void;
    onUpdateElement: (id: string, updates: Partial<SlideElement>) => void;
    scale?: number;
}

export const Canvas: React.FC<CanvasProps> = ({ slide, activeElementId, onSelectElement, onUpdateElement, scale = 1 }) => {
    const [isDragging, setIsDragging] = useState(false);
    const dragStartPos = useRef({ x: 0, y: 0 });
    const elementStartPos = useRef({ x: 0, y: 0 });
    const draggingId = useRef<string | null>(null);

    const handleBackgroundClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onSelectElement(null);
        }
    };

    const handlePointerDown = (e: React.PointerEvent, el: SlideElement) => {
        e.stopPropagation();
        onSelectElement(el.id);

        // Start drag
        setIsDragging(true);
        draggingId.current = el.id;
        dragStartPos.current = { x: e.clientX, y: e.clientY };
        elementStartPos.current = { x: el.x, y: el.y };

        (e.target as HTMLElement).setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isDragging || !draggingId.current) return;

        const dx = (e.clientX - dragStartPos.current.x) / scale;
        const dy = (e.clientY - dragStartPos.current.y) / scale;

        onUpdateElement(draggingId.current, {
            x: Math.round(elementStartPos.current.x + dx),
            y: Math.round(elementStartPos.current.y + dy)
        });
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        if (isDragging) {
            setIsDragging(false);
            draggingId.current = null;
            try {
                (e.target as HTMLElement).releasePointerCapture(e.pointerId);
            } catch (err) { }
        }
    };

    return (
        <div
            className="canvas-container"
            onClick={handleBackgroundClick}
        >
            <div
                className="slide-canvas"
                style={{
                    backgroundColor: slide.backgroundColor,
                    transform: `scale(${scale})`,
                    width: 960,
                    height: 540,
                }}
                onClick={handleBackgroundClick}
            >
                {slide.elements.map(el => (
                    <div
                        key={el.id}
                        className={`slide-element ${activeElementId === el.id ? 'active' : ''}`}
                        style={{
                            left: el.x,
                            top: el.y,
                            width: el.width,
                            height: el.height,
                            transform: `rotate(${el.rotation || 0}deg)`,
                            position: 'absolute',
                            cursor: activeElementId === el.id ? 'move' : 'pointer',
                            touchAction: 'none' // Prevent scrolling on touch devices while dragging
                        }}
                        onPointerDown={(e) => handlePointerDown(e, el)}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        onPointerCancel={handlePointerUp}
                    >
                        {/* Render specific element type */}
                        {el.type === 'shape' && (
                            <div style={{
                                width: '100%', height: '100%',
                                backgroundColor: el.backgroundColor,
                                borderRadius: el.shapeType === 'circle' ? '50%' : 0,
                                border: el.borderWidth ? `${el.borderWidth}px solid ${el.borderColor}` : 'none'
                            }} />
                        )}

                        {el.type === 'text' && (
                            <div style={{
                                width: '100%', height: '100%',
                                color: el.color,
                                fontSize: el.fontSize,
                                fontFamily: el.fontFamily,
                                fontWeight: el.fontWeight,
                                fontStyle: el.fontStyle,
                                textAlign: el.textAlign,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: el.textAlign === 'center' ? 'center' : el.textAlign === 'right' ? 'flex-end' : 'flex-start',
                                wordBreak: 'break-word',
                                overflow: 'hidden'
                            }}>
                                {el.content}
                            </div>
                        )}

                        {el.type === 'image' && (
                            <img
                                src={el.src}
                                alt=""
                                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                draggable={false}
                            />
                        )}

                        {/* Selection indicators */}
                        {activeElementId === el.id && (
                            <div className="element-selection-border" />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
