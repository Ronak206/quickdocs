/**
 * Template Builder Types
 */

export type ElementType = 
  | 'label' 
  | 'textfield' 
  | 'textarea' 
  | 'image' 
  | 'table'
  | 'line'
  | 'rectangle'
  | 'checkbox'
  | 'signature'
  | 'date'
  | 'number'
  | 'currency'
  | 'dropdown'
  | 'logo'
  | 'qr-code'
  | 'barcode';

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface FontStyle {
  bold: boolean;
  italic: boolean;
  underline: boolean;
}

export interface TemplateElement {
  id: string;
  type: ElementType;
  position: Position;
  size: Size;
  properties: ElementProperties;
  style: ElementStyle;
}

export interface ElementProperties {
  // Common
  name: string;
  placeholder?: string;
  defaultValue?: string;
  required?: boolean;
  readonly?: boolean;
  
  // Text specific
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  backgroundColor?: string;
  textAlign?: 'left' | 'center' | 'right';
  verticalAlign?: 'top' | 'middle' | 'bottom';
  
  // Font styles
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  
  // Border
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  
  // Image specific
  src?: string;
  alt?: string;
  fit?: 'cover' | 'contain' | 'fill';
  
  // Table specific
  columns?: number;
  rows?: number;
  headerRow?: boolean;
  cellPadding?: number;
  headerBackgroundColor?: string;
  
  // Dropdown specific
  options?: string[];
  
  // Date specific
  format?: string;
  
  // Currency specific
  currency?: string;
  
  // Checkbox specific
  checked?: boolean;
  label?: string;
  
  // Line specific
  lineStyle?: 'solid' | 'dashed' | 'dotted';
  
  // Dynamic field
  fieldName?: string;
  isDynamic?: boolean;
}

export interface ElementStyle {
  opacity?: number;
  rotation?: number;
  zIndex?: number;
  shadow?: boolean;
}

export interface Template {
  id: string;
  name: string;
  description?: string;
  category: string;
  pageSize: PageSize;
  orientation: 'portrait' | 'landscape';
  margins: Margins;
  elements: TemplateElement[];
  createdAt: string;
  updatedAt: string;
}

export interface PageSize {
  width: number;
  height: number;
  name: string;
}

export interface Margins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

// Predefined page sizes (in mm, converted to pixels at 96 DPI for display)
export const PAGE_SIZES: Record<string, PageSize> = {
  A4: { width: 210, height: 297, name: 'A4' },
  A3: { width: 297, height: 420, name: 'A3' },
  Letter: { width: 215.9, height: 279.4, name: 'Letter' },
  Legal: { width: 215.9, height: 355.6, name: 'Legal' },
};

// Convert mm to pixels (96 DPI)
export const mmToPixels = (mm: number): number => {
  return mm * 3.7795275591; // 96 DPI / 25.4 mm per inch
};

// Convert pixels to mm
export const pixelsToMm = (pixels: number): number => {
  return pixels / 3.7795275591;
};

// Default element sizes
export const DEFAULT_ELEMENT_SIZES: Record<ElementType, Size> = {
  label: { width: 120, height: 24 },
  textfield: { width: 200, height: 32 },
  textarea: { width: 300, height: 100 },
  image: { width: 150, height: 150 },
  table: { width: 500, height: 200 },
  line: { width: 200, height: 2 },
  rectangle: { width: 200, height: 100 },
  checkbox: { width: 20, height: 20 },
  signature: { width: 200, height: 60 },
  date: { width: 150, height: 32 },
  number: { width: 100, height: 32 },
  currency: { width: 120, height: 32 },
  dropdown: { width: 150, height: 32 },
  logo: { width: 100, height: 50 },
  'qr-code': { width: 80, height: 80 },
  barcode: { width: 150, height: 50 },
};

// Element toolbox items
export const ELEMENT_TOOLBOX: { type: ElementType; label: string; icon: string; category: string }[] = [
  // Text Elements
  { type: 'label', label: 'Label', icon: 'Type', category: 'Text' },
  { type: 'textfield', label: 'Text Field', icon: 'TextCursor', category: 'Text' },
  { type: 'textarea', label: 'Text Area', icon: 'AlignLeft', category: 'Text' },
  { type: 'number', label: 'Number', icon: 'Hash', category: 'Text' },
  { type: 'currency', label: 'Currency', icon: 'DollarSign', category: 'Text' },
  { type: 'date', label: 'Date', icon: 'Calendar', category: 'Text' },
  
  // Input Elements
  { type: 'checkbox', label: 'Checkbox', icon: 'CheckSquare', category: 'Input' },
  { type: 'dropdown', label: 'Dropdown', icon: 'ChevronDown', category: 'Input' },
  { type: 'signature', label: 'Signature', icon: 'PenTool', category: 'Input' },
  
  // Media Elements
  { type: 'image', label: 'Image', icon: 'Image', category: 'Media' },
  { type: 'logo', label: 'Logo', icon: 'Building2', category: 'Media' },
  { type: 'qr-code', label: 'QR Code', icon: 'QrCode', category: 'Media' },
  { type: 'barcode', label: 'Barcode', icon: 'Barcode', category: 'Media' },
  
  // Layout Elements
  { type: 'table', label: 'Table', icon: 'Table', category: 'Layout' },
  { type: 'line', label: 'Line', icon: 'Minus', category: 'Layout' },
  { type: 'rectangle', label: 'Rectangle', icon: 'Square', category: 'Layout' },
];
