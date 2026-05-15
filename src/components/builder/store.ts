/**
 * Template Builder Store
 */

import { create } from 'zustand';
import type { 
  TemplateElement, 
  ElementType, 
  Template, 
  Position, 
  Size,
  PAGE_SIZES,
  DEFAULT_ELEMENT_SIZES
} from './types';

// Generate unique ID
const generateId = (): string => {
  return `el_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

interface TemplateBuilderState {
  // Template
  template: Template;
  
  // Selected element
  selectedElementId: string | null;
  selectedElement: TemplateElement | null;
  
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

export const useTemplateBuilderStore = create<TemplateBuilderState>((set, get) => ({
  // Initial state
  template: { ...defaultTemplate },
  selectedElementId: null,
  selectedElement: null,
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
    const defaultSize = {
      label: { width: 150, height: 30 },
      textfield: { width: 200, height: 36 },
      textarea: { width: 300, height: 100 },
      image: { width: 150, height: 150 },
      table: { width: 500, height: 150 },
      line: { width: 300, height: 2 },
      rectangle: { width: 200, height: 100 },
      checkbox: { width: 100, height: 24 },
      signature: { width: 200, height: 60 },
      date: { width: 150, height: 36 },
      number: { width: 120, height: 36 },
      currency: { width: 150, height: 36 },
      dropdown: { width: 150, height: 36 },
      logo: { width: 120, height: 60 },
      'qr-code': { width: 80, height: 80 },
      barcode: { width: 150, height: 50 },
    };

    const defaultProps: Record<ElementType, any> = {
      label: { text: 'Label Text', fontSize: 14, bold: false, color: '#000000' },
      textfield: { placeholder: 'Enter text...', fontSize: 14, borderColor: '#d1d5db', borderWidth: 1, borderRadius: 4 },
      textarea: { placeholder: 'Enter description...', fontSize: 14, borderColor: '#d1d5db', borderWidth: 1, borderRadius: 4 },
      image: { src: '', fit: 'cover', borderColor: '#e5e7eb', borderWidth: 1 },
      table: { columns: 3, rows: 4, headerRow: true, cellPadding: 8 },
      line: { borderColor: '#000000', borderWidth: 1, lineStyle: 'solid' },
      rectangle: { borderColor: '#000000', borderWidth: 1, backgroundColor: 'transparent' },
      checkbox: { label: 'Checkbox', checked: false },
      signature: { borderColor: '#d1d5db', borderWidth: 1 },
      date: { format: 'MM/DD/YYYY', placeholder: 'Select date' },
      number: { placeholder: '0', fontSize: 14 },
      currency: { currency: 'USD', placeholder: '0.00', fontSize: 14 },
      dropdown: { options: ['Option 1', 'Option 2', 'Option 3'], placeholder: 'Select...' },
      logo: { src: '', fit: 'contain' },
      'qr-code': { defaultValue: 'https://example.com' },
      barcode: { defaultValue: '1234567890' },
    };

    const newElement: TemplateElement = {
      id: generateId(),
      type,
      position: position || { x: 50, y: 50 },
      size: defaultSize[type] || { width: 100, height: 40 },
      properties: {
        name: `${type}_${Date.now()}`,
        ...defaultProps[type],
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
    history: [template.elements],
    historyIndex: 0,
  }),

  clearTemplate: () => set({
    template: { ...defaultTemplate, id: `tpl_${Date.now()}` },
    selectedElementId: null,
    selectedElement: null,
    history: [[]],
    historyIndex: 0,
  }),

  getTemplateJson: () => {
    const state = get();
    return JSON.stringify(state.template, null, 2);
  },
}));
