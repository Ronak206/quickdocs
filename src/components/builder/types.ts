/**
 * Template Builder Types - Complete Element Library (55+ Elements)
 */

export type ElementType = 
  // Text Elements (4)
  | 'label' 
  | 'heading'
  | 'paragraph'
  | 'rich-text'
  // Input Elements (22)
  | 'textfield' 
  | 'textarea' 
  | 'number'
  | 'currency'
  | 'email'
  | 'phone'
  | 'url'
  | 'password'
  | 'date'
  | 'time'
  | 'datetime'
  | 'checkbox'
  | 'toggle'
  | 'radio'
  | 'dropdown'
  | 'multiselect'
  | 'rating'
  | 'slider'
  | 'range'
  | 'file-upload'
  | 'color-picker'
  | 'signature'
  // Media Elements (7)
  | 'image' 
  | 'logo'
  | 'qr-code'
  | 'barcode'
  | 'watermark'
  | 'video'
  | 'audio'
  // Shape Elements (10)
  | 'line'
  | 'rectangle'
  | 'circle'
  | 'ellipse'
  | 'arrow'
  | 'star'
  | 'triangle'
  | 'polygon'
  | 'divider'
  | 'rounded-box'
  // Data Elements (4)
  | 'table'
  | 'list'
  | 'chart'
  | 'progress-bar'
  // Navigation Elements (2)
  | 'hyperlink'
  | 'button'
  // Decorative & Layout Elements (5)
  | 'icon'
  | 'page-number'
  | 'stamp'
  | 'badge'
  | 'tooltip'
  // Layout Elements (2)
  | 'container'
  | 'columns';

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
  value?: string;
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
  lineHeight?: number;
  
  // Heading specific
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  
  // Font styles
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  
  // Border
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  
  // Image/Media specific
  src?: string;
  alt?: string;
  fit?: 'cover' | 'contain' | 'fill';
  
  // Table specific
  columns?: number;
  rows?: number;
  headerRow?: boolean;
  cellPadding?: number;
  headerBackgroundColor?: string;
  tableData?: string[][];
  
  // List specific
  listItems?: string[];
  
  // Dropdown/Select specific
  options?: string[];
  selectedOption?: string;
  
  // Radio specific
  orientation?: 'vertical' | 'horizontal';
  
  // Toggle specific
  onLabel?: string;
  offLabel?: string;
  
  // Rating specific
  maxRating?: number;
  allowHalf?: boolean;
  
  // Slider/Range specific
  minValue?: number;
  maxValue?: number;
  step?: number;
  showLabels?: boolean;
  
  // Progress Bar specific
  progressValue?: number;
  progressColor?: string;
  showPercentage?: boolean;
  
  // Color Picker specific
  defaultColor?: string;
  
  // File Upload specific
  acceptedTypes?: string;
  allowMultiple?: boolean;
  
  // Button specific
  buttonStyle?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  buttonUrl?: string;
  
  // Hyperlink specific
  linkUrl?: string;
  target?: '_blank' | '_self';
  
  // Badge specific
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
  
  // Date specific
  format?: string;
  
  // Currency specific
  currency?: string;
  
  // Checkbox/Toggle specific
  checked?: boolean;
  label?: string;
  
  // Line specific
  lineStyle?: 'solid' | 'dashed' | 'dotted';
  
  // Dynamic field
  fieldName?: string;
  isDynamic?: boolean;
  
  // Chart specific
  chartType?: 'bar' | 'line' | 'pie' | 'donut';
  chartData?: { label: string; value: number }[];
  
  // Icon specific
  iconName?: string;
  
  // Shape specific
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  
  // Columns specific
  columnCount?: number;
  gap?: number;
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

// Element toolbox items - Complete list
export const ELEMENT_TOOLBOX: { type: ElementType; label: string; icon: string; category: string }[] = [
  // Text Elements
  { type: 'label', label: 'Label', icon: 'Type', category: 'Text' },
  { type: 'heading', label: 'Heading', icon: 'Type', category: 'Text' },
  { type: 'paragraph', label: 'Paragraph', icon: 'AlignLeft', category: 'Text' },
  { type: 'rich-text', label: 'Rich Text', icon: 'PenTool', category: 'Text' },
  
  // Input Elements
  { type: 'textfield', label: 'Text Field', icon: 'TextCursor', category: 'Input' },
  { type: 'textarea', label: 'Text Area', icon: 'AlignLeft', category: 'Input' },
  { type: 'number', label: 'Number', icon: 'Hash', category: 'Input' },
  { type: 'currency', label: 'Currency', icon: 'DollarSign', category: 'Input' },
  { type: 'email', label: 'Email', icon: 'Mail', category: 'Input' },
  { type: 'phone', label: 'Phone', icon: 'Phone', category: 'Input' },
  { type: 'url', label: 'URL', icon: 'Link', category: 'Input' },
  { type: 'password', label: 'Password', icon: 'Lock', category: 'Input' },
  { type: 'date', label: 'Date', icon: 'Calendar', category: 'Input' },
  { type: 'time', label: 'Time', icon: 'Clock', category: 'Input' },
  { type: 'datetime', label: 'Date Time', icon: 'Calendar', category: 'Input' },
  { type: 'checkbox', label: 'Checkbox', icon: 'CheckSquare', category: 'Input' },
  { type: 'toggle', label: 'Toggle', icon: 'ToggleRight', category: 'Input' },
  { type: 'radio', label: 'Radio Group', icon: 'Circle', category: 'Input' },
  { type: 'dropdown', label: 'Dropdown', icon: 'ChevronDown', category: 'Input' },
  { type: 'multiselect', label: 'Multi-Select', icon: 'List', category: 'Input' },
  { type: 'rating', label: 'Rating', icon: 'Star', category: 'Input' },
  { type: 'slider', label: 'Slider', icon: 'Sliders', category: 'Input' },
  { type: 'range', label: 'Range', icon: 'GitBranch', category: 'Input' },
  { type: 'file-upload', label: 'File Upload', icon: 'Upload', category: 'Input' },
  { type: 'color-picker', label: 'Color Picker', icon: 'Palette', category: 'Input' },
  { type: 'signature', label: 'Signature', icon: 'PenTool', category: 'Input' },
  
  // Media Elements
  { type: 'image', label: 'Image', icon: 'Image', category: 'Media' },
  { type: 'logo', label: 'Logo', icon: 'Building2', category: 'Media' },
  { type: 'qr-code', label: 'QR Code', icon: 'QrCode', category: 'Media' },
  { type: 'barcode', label: 'Barcode', icon: 'Barcode', category: 'Media' },
  { type: 'watermark', label: 'Watermark', icon: 'Droplet', category: 'Media' },
  { type: 'video', label: 'Video', icon: 'Video', category: 'Media' },
  { type: 'audio', label: 'Audio', icon: 'Music', category: 'Media' },
  
  // Shape Elements
  { type: 'line', label: 'Line', icon: 'Minus', category: 'Shapes' },
  { type: 'rectangle', label: 'Rectangle', icon: 'Square', category: 'Shapes' },
  { type: 'circle', label: 'Circle', icon: 'Circle', category: 'Shapes' },
  { type: 'ellipse', label: 'Ellipse', icon: 'Circle', category: 'Shapes' },
  { type: 'arrow', label: 'Arrow', icon: 'ArrowRight', category: 'Shapes' },
  { type: 'star', label: 'Star', icon: 'Star', category: 'Shapes' },
  { type: 'triangle', label: 'Triangle', icon: 'Triangle', category: 'Shapes' },
  { type: 'polygon', label: 'Polygon', icon: 'Hexagon', category: 'Shapes' },
  { type: 'divider', label: 'Divider', icon: 'Minus', category: 'Shapes' },
  { type: 'rounded-box', label: 'Rounded Box', icon: 'Square', category: 'Shapes' },
  
  // Data Elements
  { type: 'table', label: 'Table', icon: 'Table', category: 'Data' },
  { type: 'list', label: 'List', icon: 'List', category: 'Data' },
  { type: 'chart', label: 'Chart', icon: 'BarChart', category: 'Data' },
  { type: 'progress-bar', label: 'Progress Bar', icon: 'GitBranch', category: 'Data' },
  
  // Navigation Elements
  { type: 'hyperlink', label: 'Hyperlink', icon: 'Link', category: 'Navigation' },
  { type: 'button', label: 'Button', icon: 'RectangleHorizontal', category: 'Navigation' },
  
  // Decorative Elements
  { type: 'icon', label: 'Icon', icon: 'Smile', category: 'Decorative' },
  { type: 'page-number', label: 'Page Number', icon: 'Hash', category: 'Decorative' },
  { type: 'stamp', label: 'Stamp', icon: 'Award', category: 'Decorative' },
  { type: 'badge', label: 'Badge', icon: 'Badge', category: 'Decorative' },
  { type: 'tooltip', label: 'Tooltip', icon: 'MessageSquare', category: 'Decorative' },
  
  // Layout Elements
  { type: 'container', label: 'Container', icon: 'Square', category: 'Layout' },
  { type: 'columns', label: 'Columns', icon: 'Columns', category: 'Layout' },
];

// Default element sizes
export const DEFAULT_ELEMENT_SIZES: Record<ElementType, Size> = {
  // Text
  label: { width: 150, height: 30 },
  heading: { width: 300, height: 40 },
  paragraph: { width: 400, height: 80 },
  'rich-text': { width: 400, height: 150 },
  
  // Input
  textfield: { width: 200, height: 36 },
  textarea: { width: 300, height: 100 },
  number: { width: 120, height: 36 },
  currency: { width: 150, height: 36 },
  email: { width: 200, height: 36 },
  phone: { width: 180, height: 36 },
  url: { width: 250, height: 36 },
  password: { width: 200, height: 36 },
  date: { width: 150, height: 36 },
  time: { width: 120, height: 36 },
  datetime: { width: 200, height: 36 },
  checkbox: { width: 150, height: 24 },
  toggle: { width: 120, height: 40 },
  radio: { width: 200, height: 100 },
  dropdown: { width: 180, height: 36 },
  multiselect: { width: 200, height: 100 },
  rating: { width: 150, height: 30 },
  slider: { width: 200, height: 40 },
  range: { width: 250, height: 50 },
  'file-upload': { width: 250, height: 100 },
  'color-picker': { width: 150, height: 40 },
  signature: { width: 200, height: 60 },
  
  // Media
  image: { width: 150, height: 150 },
  logo: { width: 120, height: 60 },
  'qr-code': { width: 80, height: 80 },
  barcode: { width: 150, height: 50 },
  watermark: { width: 200, height: 200 },
  video: { width: 320, height: 180 },
  audio: { width: 300, height: 60 },
  
  // Shapes
  line: { width: 300, height: 2 },
  rectangle: { width: 200, height: 100 },
  circle: { width: 100, height: 100 },
  ellipse: { width: 150, height: 100 },
  arrow: { width: 100, height: 50 },
  star: { width: 50, height: 50 },
  triangle: { width: 100, height: 86 },
  polygon: { width: 100, height: 100 },
  divider: { width: 400, height: 20 },
  'rounded-box': { width: 200, height: 100 },
  
  // Data
  table: { width: 500, height: 200 },
  list: { width: 250, height: 150 },
  chart: { width: 400, height: 300 },
  'progress-bar': { width: 200, height: 24 },
  
  // Navigation
  hyperlink: { width: 150, height: 24 },
  button: { width: 120, height: 40 },
  
  // Decorative
  icon: { width: 40, height: 40 },
  'page-number': { width: 60, height: 24 },
  stamp: { width: 80, height: 80 },
  badge: { width: 80, height: 28 },
  tooltip: { width: 200, height: 60 },
  
  // Layout
  container: { width: 400, height: 300 },
  columns: { width: 500, height: 200 },
};
