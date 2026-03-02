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
    const [actionType, setActionType] = useState<'move' | 'resize' | 'rotate' | null>(null);
    const [activeHandle, setActiveHandle] = useState<string | null>(null);

    const canvasRef = useRef<HTMLDivElement>(null);
    const dragStartPos = useRef({ x: 0, y: 0 });
    const elementStartPos = useRef({ x: 0, y: 0 });
    const elementStartSize = useRef({ w: 0, h: 0 });
    const elementStartRot = useRef(0);
    const elementCenter = useRef({ cx: 0, cy: 0 });
    const draggingId = useRef<string | null>(null);

    const handleBackgroundClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onSelectElement(null);
        }
    };

    const handlePointerDown = (e: React.PointerEvent, el: SlideElement, action: 'move' | 'resize' | 'rotate' = 'move', handle?: string) => {
        e.stopPropagation();
        onSelectElement(el.id);

        setIsDragging(true);
        setActionType(action);
        setActiveHandle(handle || null);
        draggingId.current = el.id;

        dragStartPos.current = { x: e.clientX, y: e.clientY };
        elementStartPos.current = { x: el.x, y: el.y };
        elementStartSize.current = { w: el.width, h: el.height };
        elementStartRot.current = el.rotation || 0;

        if (action === 'rotate' && canvasRef.current) {
            const rect = canvasRef.current.getBoundingClientRect();
            elementCenter.current = {
                cx: rect.left + (el.x + el.width / 2) * scale,
                cy: rect.top + (el.y + el.height / 2) * scale
            };
        }

        (e.target as HTMLElement).setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isDragging || !draggingId.current) return;

        if (actionType === 'move') {
            const dx = (e.clientX - dragStartPos.current.x) / scale;
            const dy = (e.clientY - dragStartPos.current.y) / scale;

            onUpdateElement(draggingId.current, {
                x: Math.round(elementStartPos.current.x + dx),
                y: Math.round(elementStartPos.current.y + dy)
            });
        } else if (actionType === 'resize' && activeHandle) {
            const dx = (e.clientX - dragStartPos.current.x) / scale;
            const dy = (e.clientY - dragStartPos.current.y) / scale;

            let newX = elementStartPos.current.x;
            let newY = elementStartPos.current.y;
            let newW = elementStartSize.current.w;
            let newH = elementStartSize.current.h;

            if (activeHandle.includes('e')) newW = Math.max(10, elementStartSize.current.w + dx);
            if (activeHandle.includes('s')) newH = Math.max(10, elementStartSize.current.h + dy);
            if (activeHandle.includes('w')) {
                newW = Math.max(10, elementStartSize.current.w - dx);
                if (newW > 10) newX = elementStartPos.current.x + dx;
            }
            if (activeHandle.includes('n')) {
                newH = Math.max(10, elementStartSize.current.h - dy);
                if (newH > 10) newY = elementStartPos.current.y + dy;
            }

            onUpdateElement(draggingId.current, {
                x: Math.round(newX),
                y: Math.round(newY),
                width: Math.round(newW),
                height: Math.round(newH)
            });
        } else if (actionType === 'rotate') {
            const cx = elementCenter.current.cx;
            const cy = elementCenter.current.cy;
            const currentAngle = Math.atan2(e.clientY - cy, e.clientX - cx) * 180 / Math.PI;
            const startAngle = Math.atan2(dragStartPos.current.y - cy, dragStartPos.current.x - cx) * 180 / Math.PI;

            const angleDiff = currentAngle - startAngle;
            let newRot = (elementStartRot.current + angleDiff) % 360;
            if (newRot < 0) newRot += 360;

            onUpdateElement(draggingId.current, {
                rotation: Math.round(newRot)
            });
        }
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
                ref={canvasRef}
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
                            zIndex: el.zIndex !== undefined ? el.zIndex : 'auto',
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
                            <>
                                <div className="element-selection-border" />
                                <div className="rotate-line" />
                                <div className="rotate-handle" onPointerDown={(e) => handlePointerDown(e, el, 'rotate')} />

                                <div className="resize-handle nw" onPointerDown={(e) => handlePointerDown(e, el, 'resize', 'nw')} />
                                <div className="resize-handle n" onPointerDown={(e) => handlePointerDown(e, el, 'resize', 'n')} />
                                <div className="resize-handle ne" onPointerDown={(e) => handlePointerDown(e, el, 'resize', 'ne')} />
                                <div className="resize-handle e" onPointerDown={(e) => handlePointerDown(e, el, 'resize', 'e')} />
                                <div className="resize-handle se" onPointerDown={(e) => handlePointerDown(e, el, 'resize', 'se')} />
                                <div className="resize-handle s" onPointerDown={(e) => handlePointerDown(e, el, 'resize', 's')} />
                                <div className="resize-handle sw" onPointerDown={(e) => handlePointerDown(e, el, 'resize', 'sw')} />
                                <div className="resize-handle w" onPointerDown={(e) => handlePointerDown(e, el, 'resize', 'w')} />
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
