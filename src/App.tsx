import { useState, useEffect, useCallback } from 'react';
import './App.css';
import type { Presentation, Slide, SlideElement, TextElement, ShapeElement, ImageElement } from './types';
import { v4 as uuidv4 } from 'uuid';
import { TopRibbon } from './components/TopRibbon';
import { Sidebar } from './components/Sidebar';
import { Canvas } from './components/Canvas';
import { PropertiesPanel } from './components/PropertiesPanel';
import { ImageSearchPanel } from './components/ImageSearchPanel';

const createEmptySlide = (): Slide => ({
  id: uuidv4(),
  backgroundColor: '#ffffff',
  elements: [],
});

function App() {
  const [presentation, setPresentation] = useState<Presentation>(() => {
    const saved = localStorage.getItem('powerpoint-replica');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) { }
    }
    return {
      id: uuidv4(),
      title: 'Untitled Presentation',
      slides: [createEmptySlide()],
    };
  });

  useEffect(() => {
    localStorage.setItem('powerpoint-replica', JSON.stringify(presentation));
  }, [presentation]);

  const [activeSlideId, setActiveSlideId] = useState<string>(presentation.slides[0]?.id || '');
  const [activeElementId, setActiveElementId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isImageSearchOpen, setIsImageSearchOpen] = useState(false);

  const activeSlideIndex = presentation.slides.findIndex(s => s.id === activeSlideId);
  const activeSlide = presentation.slides[activeSlideIndex] || presentation.slides[0];
  const activeElement = activeSlide?.elements.find(e => e.id === activeElementId) || null;

  const updateSlide = useCallback((slideId: string, updates: Partial<Slide>) => {
    setPresentation(prev => ({
      ...prev,
      slides: prev.slides.map(s => s.id === slideId ? { ...s, ...updates } : s)
    }));
  }, []);

  const handleAddSlide = () => {
    const newSlide = createEmptySlide();
    setPresentation(prev => ({
      ...prev,
      slides: [...prev.slides, newSlide]
    }));
    setActiveSlideId(newSlide.id);
  };

  const handleDeleteSlide = (id: string) => {
    if (presentation.slides.length <= 1) return;
    setPresentation(prev => {
      const remaining = prev.slides.filter(s => s.id !== id);
      if (activeSlideId === id) {
        setActiveSlideId(remaining[0].id);
      }
      return { ...prev, slides: remaining };
    });
  };

  const addElement = (element: SlideElement) => {
    updateSlide(activeSlideId, {
      elements: [...activeSlide.elements, element]
    });
    setActiveElementId(element.id);
  };

  const handleInsertText = () => {
    const textEl: TextElement = {
      id: uuidv4(),
      type: 'text',
      x: 330, y: 220, width: 300, height: 50,
      content: 'Click to edit text',
      fontSize: 24,
      fontFamily: 'Inter',
      color: '#000000',
      textAlign: 'center'
    };
    addElement(textEl);
  };

  const handleInsertShape = (shapeType: 'rectangle' | 'circle') => {
    const shapeEl: ShapeElement = {
      id: uuidv4(),
      type: 'shape',
      shapeType,
      x: 430, y: 220, width: 100, height: 100,
      backgroundColor: 'var(--pp-red)',
    };
    addElement(shapeEl);
  };

  const handleInsertImage = () => {
    const imgEl: ImageElement = {
      id: uuidv4(),
      type: 'image',
      x: 330, y: 150, width: 300, height: 200,
      src: 'https://images.unsplash.com/photo-1542382257-80da9fb9f5c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    };
    addElement(imgEl);
  };

  const handleInsertOnlineImage = (url: string, width: number, height: number) => {
    // Keep reasonable dimensions
    const ratio = width / height;
    const insertWidth = Math.min(width, 400);
    const insertHeight = insertWidth / ratio;

    const imgEl: ImageElement = {
      id: uuidv4(),
      type: 'image',
      x: 280, y: 170, width: insertWidth, height: insertHeight,
      src: url,
    };
    addElement(imgEl);
    setIsImageSearchOpen(false); // Optionally close after inserting
  };

  const handleUpdateElement = useCallback((id: string, updates: Partial<SlideElement>) => {
    if (!activeSlideId) return;
    setPresentation(prev => ({
      ...prev,
      slides: prev.slides.map(s => {
        if (s.id !== activeSlideId) return s;
        return {
          ...s,
          elements: s.elements.map(el => el.id === id ? { ...el, ...updates } as SlideElement : el)
        };
      })
    }));
  }, [activeSlideId]);

  const handleDeleteElement = useCallback(() => {
    if (!activeElementId || !activeSlideId) return;
    setPresentation(prev => ({
      ...prev,
      slides: prev.slides.map(s => {
        if (s.id !== activeSlideId) return s;
        return {
          ...s,
          elements: s.elements.filter(el => el.id !== activeElementId)
        };
      })
    }));
    setActiveElementId(null);
  }, [activeElementId, activeSlideId]);

  const handleReorderElement = useCallback((direction: 'forward' | 'backward' | 'front' | 'back') => {
    if (!activeElementId || !activeSlideId) return;
    setPresentation(prev => ({
      ...prev,
      slides: prev.slides.map(s => {
        if (s.id !== activeSlideId) return s;
        const els = [...s.elements];
        const idx = els.findIndex(e => e.id === activeElementId);
        if (idx === -1) return s;

        const [el] = els.splice(idx, 1);
        if (direction === 'forward') {
          els.splice(Math.min(els.length, idx + 1), 0, el);
        } else if (direction === 'backward') {
          els.splice(Math.max(0, idx - 1), 0, el);
        } else if (direction === 'front') {
          els.push(el);
        } else if (direction === 'back') {
          els.unshift(el);
        }

        // Update zIndex explicit tags based on new array order to make it explicit
        const updatedEls = els.map((e, i) => ({ ...e, zIndex: i }));

        return {
          ...s,
          elements: updatedEls
        };
      })
    }));
  }, [activeElementId, activeSlideId]);

  // Keybindings
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (!isPlaying) {
          handleDeleteElement();
        }
      }

      if (isPlaying) {
        if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') {
          if (activeSlideIndex < presentation.slides.length - 1) {
            setActiveSlideId(presentation.slides[activeSlideIndex + 1].id);
          } else {
            setIsPlaying(false); // End presentation
          }
        }
        if (e.key === 'ArrowLeft' || e.key === 'Backspace') {
          if (activeSlideIndex > 0) {
            setActiveSlideId(presentation.slides[activeSlideIndex - 1].id);
          }
        }
        if (e.key === 'Escape') {
          setIsPlaying(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeElementId, activeSlideId, activeSlideIndex, isPlaying, presentation.slides, handleDeleteElement]);

  const [presenterScale, setPresenterScale] = useState(1);

  // Calculate full screen scale
  useEffect(() => {
    if (isPlaying) {
      const calculateScale = () => {
        const scaleX = window.innerWidth / 960;
        const scaleY = window.innerHeight / 540;
        setPresenterScale(Math.min(scaleX, scaleY));
      };
      calculateScale();
      window.addEventListener('resize', calculateScale);
      return () => window.removeEventListener('resize', calculateScale);
    }
  }, [isPlaying]);

  if (isPlaying) {
    return (
      <div
        style={{
          width: '100vw', height: '100vh',
          background: 'black', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden'
        }}
        onClick={() => {
          if (activeSlideIndex < presentation.slides.length - 1) {
            setActiveSlideId(presentation.slides[activeSlideIndex + 1].id);
          } else {
            setIsPlaying(false);
          }
        }}
      >
        <div style={{ position: 'absolute', top: 20, right: 20, color: 'white', zIndex: 10, cursor: 'pointer', background: 'rgba(0,0,0,0.5)', padding: '4px 12px', borderRadius: 4 }}>
          Esc to exit
        </div>
        <div style={{ transform: `scale(${presenterScale})`, transition: 'transform 0.2s', transformOrigin: 'center center' }}>
          <Canvas
            slide={activeSlide}
            activeElementId={null}
            onSelectElement={() => { }}
            onUpdateElement={() => { }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <TopRibbon
        onInsertText={handleInsertText}
        onInsertShape={handleInsertShape}
        onInsertImage={handleInsertImage}
        onOpenImageSearch={() => setIsImageSearchOpen(true)}
        onPlay={() => setIsPlaying(true)}
        activeElement={activeElement}
        onUpdateElement={handleUpdateElement}
      />

      <main className="main-content">
        <Sidebar
          presentation={presentation}
          activeSlideId={activeSlideId}
          onSelectSlide={setActiveSlideId}
          onAddSlide={handleAddSlide}
          onDeleteSlide={handleDeleteSlide}
        />

        <section className="canvas-area">
          <Canvas
            slide={activeSlide}
            activeElementId={activeElementId}
            onSelectElement={setActiveElementId}
            onUpdateElement={handleUpdateElement}
          />
        </section>

        {isImageSearchOpen ? (
          <ImageSearchPanel
            onClose={() => setIsImageSearchOpen(false)}
            onInsertImage={handleInsertOnlineImage}
          />
        ) : (
          <PropertiesPanel
            slide={activeSlide}
            element={activeElement}
            onUpdateElement={handleUpdateElement}
            onUpdateSlide={updateSlide}
            onReorderElement={handleReorderElement}
          />
        )}
      </main>
    </div>
  );
}

export default App;
