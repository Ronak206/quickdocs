/**
 * Template Builder Store with Form Data Management
 */

import { create } from 'zustand';
import type { 
  TemplateElement, 
  ElementType, 
  Template, 
  Position, 
  Size,
} from './types';

// Generate unique ID
const generateId = (): string => {
  return `el_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

// Form data type - stores values for dynamic fields
export type FormData = Record<string, any>;

interface TemplateBuilderState {
  // Template
  template: Template;
  
  // Selected element
  selectedElementId: string | null;
  selectedElement: TemplateElement | null;
  
  // Form Data for Data Form Panel
  formData: FormData;
  
  // UI State
  zoom: number;
  showGrid: boolean;
  gridSize: number;
  snapToGrid: boolean;
  
  // History for undo/redo
  history: TemplateElement[][];
  historyIndex: number;
  
  // Actions
  setTemplate: (template: Partial<Template>) => void;
  
  // Element actions
  addElement: (type: ElementType, position?: Position) => void;
  updateElement: (id: string, updates: Partial<TemplateElement>) => void;
  updateElementPosition: (id: string, position: Position) => void;
  updateElementSize: (id: string, size: Size) => void;
  deleteElement: (id: string) => void;
  duplicateElement: (id: string) => void;
  
  // Selection
  selectElement: (id: string | null) => void;
  clearSelection: () => void;
  
  // Form Data actions
  setFormData: (data: FormData) => void;
  updateFormData: (key: string, value: any) => void;
  clearFormData: () => void;
  
  // UI actions
  setZoom: (zoom: number) => void;
  toggleGrid: () => void;
  setGridSize: (size: number) => void;
  toggleSnapToGrid: () => void;
  
  // History
  undo: () => void;
  redo: () => void;
  saveToHistory: () => void;
  
  // Template actions
  loadTemplate: (template: Template) => void;
  clearTemplate: () => void;
  getTemplateJson: () => string;
}

const defaultTemplate: Template = {
  id: `tpl_${Date.now()}`,
  name: 'Untitled Template',
  description: '',
  category: 'CUSTOM',
  pageSize: { width: 210, height: 297, name: 'A4' },
  orientation: 'portrait',
  margins: { top: 20, right: 20, bottom: 20, left: 20 },
  elements: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Default properties for each element type
const getDefaultProperties = (type: ElementType): Record<string, any> => {
  const defaults: Record<ElementType, any> = {
    // Text Elements
    label: { text: 'Label Text', fontSize: 14, bold: false, color: '#000000' },
    heading: { text: 'Heading', fontSize: 24, bold: true, headingLevel: 2, color: '#000000' },
    paragraph: { text: 'Enter your paragraph text here...', fontSize: 14, lineHeight: 1.5, color: '#000000' },
    'rich-text': { text: 'Rich text content', fontSize: 14, color: '#000000' },
    
    // Input Elements
    textfield: { placeholder: 'Enter text...', fontSize: 14, borderColor: '#d1d5db', borderWidth: 1, borderRadius: 4 },
    textarea: { placeholder: 'Enter description...', fontSize: 14, borderColor: '#d1d5db', borderWidth: 1, borderRadius: 4 },
    number: { placeholder: '0', fontSize: 14, minValue: 0, maxValue: 100 },
    currency: { currency: 'USD', placeholder: '0.00', fontSize: 14 },
    email: { placeholder: 'email@example.com', fontSize: 14 },
    phone: { placeholder: '+1 (555) 000-0000', fontSize: 14 },
    url: { placeholder: 'https://example.com', fontSize: 14 },
    password: { placeholder: '••••••••', fontSize: 14 },
    date: { format: 'MM/DD/YYYY', placeholder: 'Select date' },
    time: { format: 'HH:MM', placeholder: 'Select time' },
    datetime: { format: 'MM/DD/YYYY HH:MM', placeholder: 'Select date & time' },
    checkbox: { label: 'Checkbox', checked: false },
    toggle: { label: 'Toggle', checked: false, onLabel: 'On', offLabel: 'Off' },
    radio: { options: ['Option 1', 'Option 2', 'Option 3'], selectedOption: '', orientation: 'vertical' },
    dropdown: { options: ['Option 1', 'Option 2', 'Option 3'], placeholder: 'Select...' },
    multiselect: { options: ['Item 1', 'Item 2', 'Item 3'], placeholder: 'Select multiple...' },
    rating: { maxRating: 5, value: 0, allowHalf: false },
    slider: { minValue: 0, maxValue: 100, value: 50, step: 1, showLabels: true },
    range: { minValue: 0, maxValue: 100, valueStart: 20, valueEnd: 80, step: 1 },
    'file-upload': { acceptedTypes: '.pdf,.doc,.docx', allowMultiple: false, placeholder: 'Upload file...' },
    'color-picker': { defaultColor: '#3B82F6' },
    signature: { borderColor: '#d1d5db', borderWidth: 1, placeholder: 'Sign here' },
    
    // Media Elements
    image: { src: '', fit: 'cover', borderColor: '#e5e7eb', borderWidth: 1, alt: 'Image' },
    logo: { src: '', fit: 'contain', alt: 'Logo' },
    'qr-code': { defaultValue: 'https://example.com', color: '#000000' },
    barcode: { defaultValue: '1234567890', color: '#000000' },
    watermark: { text: 'WATERMARK', opacity: 20, fontSize: 48, rotation: -45 },
    video: { src: '', placeholder: 'Video placeholder' },
    audio: { src: '', placeholder: 'Audio player' },
    
    // Shape Elements
    line: { borderColor: '#000000', borderWidth: 2, lineStyle: 'solid' },
    rectangle: { borderColor: '#000000', borderWidth: 1, fillColor: 'transparent', borderRadius: 0 },
    circle: { borderColor: '#000000', borderWidth: 1, fillColor: 'transparent' },
    ellipse: { borderColor: '#000000', borderWidth: 1, fillColor: 'transparent' },
    arrow: { color: '#000000', direction: 'right', strokeWidth: 2 },
    star: { fillColor: '#FFD700', strokeColor: '#000000', strokeWidth: 1, points: 5 },
    triangle: { fillColor: 'transparent', strokeColor: '#000000', strokeWidth: 1 },
    polygon: { fillColor: 'transparent', strokeColor: '#000000', strokeWidth: 1, sides: 6 },
    divider: { color: '#d1d5db', thickness: 1, style: 'solid' },
    'rounded-box': { borderColor: '#000000', borderWidth: 1, fillColor: 'transparent', borderRadius: 8 },
    
    // Data Elements
    table: { columns: 3, rows: 4, headerRow: true, cellPadding: 8, borderColor: '#d1d5db', borderWidth: 1 },
    list: { listItems: ['Item 1', 'Item 2', 'Item 3'], listStyle: 'bullet' },
    chart: { chartType: 'bar', chartData: [{ label: 'A', value: 10 }, { label: 'B', value: 20 }] },
    'progress-bar': { progressValue: 60, progressColor: '#3B82F6', showPercentage: true },
    
    // Navigation Elements
    hyperlink: { text: 'Click here', linkUrl: '#', target: '_self' },
    button: { text: 'Button', buttonStyle: 'primary', buttonUrl: '' },
    
    // Decorative Elements
    icon: { iconName: 'star', size: 24, color: '#000000' },
    'page-number': { format: 'Page {n}', startFrom: 1 },
    stamp: { text: 'APPROVED', color: '#22C55E', rotation: -15 },
    badge: { text: 'New', badgeVariant: 'default' },
    tooltip: { text: 'Tooltip text', trigger: 'Hover me' },
    
    // Layout Elements
    container: { borderColor: '#e5e7eb', borderWidth: 1, backgroundColor: '#ffffff', padding: 16 },
    columns: { columnCount: 2, gap: 16 },
  };
  
  return defaults[type] || {};
};

export const useTemplateBuilderStore = create<TemplateBuilderState>((set, get) => ({
  // Initial state
  template: { ...defaultTemplate },
  selectedElementId: null,
  selectedElement: null,
  formData: {},
  zoom: 1,
  showGrid: true,
  gridSize: 10,
  snapToGrid: true,
  history: [[]],
  historyIndex: 0,

  // Template actions
  setTemplate: (updates) => set((state) => ({
    template: { ...state.template, ...updates, updatedAt: new Date().toISOString() }
  })),

  // Element actions
  addElement: (type, position) => {
    const state = get();
    
    // Import default sizes from types
    const defaultSizes: Record<ElementType, Size> = {
      label: { width: 150, height: 30 },
      heading: { width: 300, height: 40 },
      paragraph: { width: 400, height: 80 },
      'rich-text': { width: 400, height: 150 },
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
      image: { width: 150, height: 150 },
      logo: { width: 120, height: 60 },
      'qr-code': { width: 80, height: 80 },
      barcode: { width: 150, height: 50 },
      watermark: { width: 200, height: 200 },
      video: { width: 320, height: 180 },
      audio: { width: 300, height: 60 },
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
      table: { width: 500, height: 200 },
      list: { width: 250, height: 150 },
      chart: { width: 400, height: 300 },
      'progress-bar': { width: 200, height: 24 },
      hyperlink: { width: 150, height: 24 },
      button: { width: 120, height: 40 },
      icon: { width: 40, height: 40 },
      'page-number': { width: 60, height: 24 },
      stamp: { width: 80, height: 80 },
      badge: { width: 80, height: 28 },
      tooltip: { width: 200, height: 60 },
      container: { width: 400, height: 300 },
      columns: { width: 500, height: 200 },
    };

    const newElement: TemplateElement = {
      id: generateId(),
      type,
      position: position || { x: 50, y: 50 },
      size: defaultSizes[type] || { width: 100, height: 40 },
      properties: {
        name: `${type}_${Date.now()}`,
        ...getDefaultProperties(type),
      },
      style: {
        opacity: 100,
        rotation: 0,
        zIndex: state.template.elements.length,
      },
    };

    set((state) => ({
      template: {
        ...state.template,
        elements: [...state.template.elements, newElement],
        updatedAt: new Date().toISOString(),
      },
      selectedElementId: newElement.id,
      selectedElement: newElement,
    }));

    get().saveToHistory();
  },

  updateElement: (id, updates) => {
    set((state) => {
      const elements = state.template.elements.map(el => 
        el.id === id ? { ...el, ...updates } : el
      );
      const selectedElement = elements.find(el => el.id === id) || null;
      
      return {
        template: { ...state.template, elements, updatedAt: new Date().toISOString() },
        selectedElement,
      };
    });
  },

  updateElementPosition: (id, position) => {
    set((state) => {
      const elements = state.template.elements.map(el => 
        el.id === id ? { ...el, position } : el
      );
      const selectedElement = elements.find(el => el.id === id) || null;
      
      return {
        template: { ...state.template, elements, updatedAt: new Date().toISOString() },
        selectedElement,
      };
    });
  },

  updateElementSize: (id, size) => {
    set((state) => {
      const elements = state.template.elements.map(el => 
        el.id === id ? { ...el, size } : el
      );
      const selectedElement = elements.find(el => el.id === id) || null;
      
      return {
        template: { ...state.template, elements, updatedAt: new Date().toISOString() },
        selectedElement,
      };
    });
  },

  deleteElement: (id) => {
    set((state) => ({
      template: {
        ...state.template,
        elements: state.template.elements.filter(el => el.id !== id),
        updatedAt: new Date().toISOString(),
      },
      selectedElementId: null,
      selectedElement: null,
    }));
    get().saveToHistory();
  },

  duplicateElement: (id) => {
    const state = get();
    const element = state.template.elements.find(el => el.id === id);
    if (!element) return;

    const newElement: TemplateElement = {
      ...element,
      id: generateId(),
      position: {
        x: element.position.x + 20,
        y: element.position.y + 20,
      },
    };

    set((state) => ({
      template: {
        ...state.template,
        elements: [...state.template.elements, newElement],
        updatedAt: new Date().toISOString(),
      },
      selectedElementId: newElement.id,
      selectedElement: newElement,
    }));

    get().saveToHistory();
  },

  // Selection
  selectElement: (id) => {
    set((state) => {
      const element = state.template.elements.find(el => el.id === id) || null;
      return {
        selectedElementId: id,
        selectedElement: element,
      };
    });
  },

  clearSelection: () => set({ selectedElementId: null, selectedElement: null }),

  // Form Data actions
  setFormData: (data) => set({ formData: data }),
  
  updateFormData: (key, value) => {
    set((state) => ({
      formData: { ...state.formData, [key]: value }
    }));
    
    // Also update the element if it's a dynamic field
    const state = get();
    const element = state.template.elements.find(el => 
      el.properties.fieldName === key || el.id === key
    );
    
    if (element) {
      if (element.type === 'label' || element.type === 'heading' || element.type === 'paragraph') {
        get().updateElement(element.id, { 
          properties: { ...element.properties, text: value } 
        });
      } else if (element.type === 'checkbox' || element.type === 'toggle') {
        get().updateElement(element.id, { 
          properties: { ...element.properties, checked: value } 
        });
      } else {
        get().updateElement(element.id, { 
          properties: { ...element.properties, value: value } 
        });
      }
    }
  },
  
  clearFormData: () => set({ formData: {} }),

  // UI actions
  setZoom: (zoom) => set({ zoom: Math.max(0.25, Math.min(2, zoom)) }),
  toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
  setGridSize: (size) => set({ gridSize: size }),
  toggleSnapToGrid: () => set((state) => ({ snapToGrid: !state.snapToGrid })),

  // History
  saveToHistory: () => {
    set((state) => {
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push([...state.template.elements]);
      return {
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
  },

  undo: () => {
    set((state) => {
      if (state.historyIndex <= 0) return state;
      const newIndex = state.historyIndex - 1;
      return {
        template: { ...state.template, elements: state.history[newIndex] },
        historyIndex: newIndex,
        selectedElementId: null,
        selectedElement: null,
      };
    });
  },

  redo: () => {
    set((state) => {
      if (state.historyIndex >= state.history.length - 1) return state;
      const newIndex = state.historyIndex + 1;
      return {
        template: { ...state.template, elements: state.history[newIndex] },
        historyIndex: newIndex,
        selectedElementId: null,
        selectedElement: null,
      };
    });
  },

  // Template actions
  loadTemplate: (template) => set({
    template,
    selectedElementId: null,
    selectedElement: null,
    formData: {},
    history: [template.elements],
    historyIndex: 0,
  }),

  clearTemplate: () => set({
    template: { ...defaultTemplate, id: `tpl_${Date.now()}` },
    selectedElementId: null,
    selectedElement: null,
    formData: {},
    history: [[]],
    historyIndex: 0,
  }),

  getTemplateJson: () => {
    const state = get();
    return JSON.stringify(state.template, null, 2);
  },
}));
