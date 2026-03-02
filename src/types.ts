export type ElementType = 'text' | 'shape' | 'image';

export interface BaseElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  zIndex?: number;
}

export interface TextElement extends BaseElement {
  type: 'text';
  content: string;
  fontSize: number;
  fontFamily: string;
  color: string;
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
  textAlign?: 'left' | 'center' | 'right' | 'justify';
}

export interface ShapeElement extends BaseElement {
  type: 'shape';
  shapeType: 'rectangle' | 'circle' | 'triangle';
  backgroundColor: string;
  borderColor?: string;
  borderWidth?: number;
}

export interface ImageElement extends BaseElement {
  type: 'image';
  src: string;
}

export type SlideElement = TextElement | ShapeElement | ImageElement;

export interface Slide {
  id: string;
  backgroundColor: string;
  elements: SlideElement[];
}

export interface Presentation {
  id: string;
  title: string;
  slides: Slide[];
}
