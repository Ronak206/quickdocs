'use client';

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useTemplateBuilderStore } from './store';
import type { TemplateElement, ElementType, Position, Size } from './types';
import { mmToPixels, pixelsToMm, ELEMENT_TOOLBOX } from './types';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { toast } from 'sonner';

// Icons - All needed icons
import {
  Type, TextCursor, AlignLeft, Hash, DollarSign, Calendar, Clock, Mail, Phone, Link, Lock,
  CheckSquare, ToggleRight, Circle, ChevronDown, List, Star, Sliders, GitBranch, Upload, Palette, PenTool,
  Image as ImageIcon, Building2, QrCode, Barcode, Droplet, Video, Music,
  Minus, Square, ArrowRight, Triangle, Hexagon, Plus, MinusCircle,
  ZoomIn, ZoomOut, Grid3X3, Undo2, Redo2, Download, Save,
  Trash2, Copy, Move, RotateCcw, Lock as LockIcon, Unlock, Eye, Settings, EyeOff,
  FileText, X, ArrowLeft, Printer, FileDown, ChevronRight, ChevronUp, Table,
  Award, MessageSquare, Columns, Box, BarChart, Gauge, Layers, Sparkles,
  File, FileCheck, RefreshCw, Check, ExternalLink, Play, Pause
} from 'lucide-react';

// Icon mapping for dynamic icon rendering
const iconMap: Record<string, React.ComponentType<any>> = {
  Type, TextCursor, AlignLeft, Hash, DollarSign, Calendar, Clock, Mail, Phone, Link, Lock,
  CheckSquare, ToggleRight, Circle, ChevronDown, List, Star, Sliders, GitBranch, Upload, Palette, PenTool,
  Image: ImageIcon, Building2, QrCode, Barcode, Droplet, Video, Music,
  Minus, Square, ArrowRight, Triangle, Hexagon,
  Table, BarChart, Gauge, Award, MessageSquare, Columns, Box, Layers, Sparkles, File, FileCheck
};

// Convert mm to pixels (96 DPI)
const MM_TO_PX = 3.7795275591;

// Color presets
const COLOR_PRESETS = [
  '#000000', '#374151', '#6B7280', '#9CA3AF', '#D1D5DB', '#F3F4F6', '#FFFFFF',
  '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16', '#22C55E', '#10B981',
  '#14B8A6', '#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7',
  '#D946EF', '#EC4899', '#F43F5E',
];

const BACKGROUND_PRESETS = [
  'transparent', '#FFFFFF', '#F9FAFB', '#F3F4F6', '#E5E7EB', '#FEE2E2', '#FEF3C7',
  '#D1FAE5', '#DBEAFE', '#EDE9FE', '#FCE7F3', '#E0E7FF',
];

// Input element types for form data
const INPUT_ELEMENT_TYPES = [
  'textfield', 'textarea', 'number', 'currency', 'email', 'phone', 'url', 'password',
  'date', 'time', 'datetime', 'checkbox', 'toggle', 'radio', 'dropdown', 'multiselect',
  'rating', 'slider', 'range', 'file-upload', 'color-picker', 'signature'
];

// Element categories with icons
const ELEMENT_CATEGORIES = [
  { name: 'Text', icon: Type, count: 4 },
  { name: 'Input', icon: TextCursor, count: 22 },
  { name: 'Media', icon: ImageIcon, count: 7 },
  { name: 'Shapes', icon: Square, count: 10 },
  { name: 'Data', icon: Table, count: 4 },
  { name: 'Navigation', icon: Link, count: 2 },
  { name: 'Decorative', icon: Sparkles, count: 5 },
  { name: 'Layout', icon: Columns, count: 2 },
];

interface TemplateBuilderProps {
  onBack?: () => void;
  initialTemplate?: {
    id: string;
    name: string;
    description?: string;
    category: string;
    type: string;
  } | null;
}

export default function TemplateBuilder({ onBack, initialTemplate }: TemplateBuilderProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const previewCanvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [initialSize, setInitialSize] = useState<Size>({ width: 0, height: 0 });
  const [initialPos, setInitialPos] = useState<Position>({ x: 0, y: 0 });
  const [showPreview, setShowPreview] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['Text', 'Input']);
  const [activeRightTab, setActiveRightTab] = useState<string>('properties');
  const [jsonInput, setJsonInput] = useState<string>('');
  
  // Collapsible sections state for properties panel
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    position: true,
    text: true,
    background: true,
    border: true,
    table: true,
    style: true,
    dynamic: true,
    placeholder: true,
    checkbox: true,
    element: true,
    options: true,
    media: true,
    progress: true,
    button: true,
    hyperlink: true,
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const {
    template,
    selectedElementId,
    selectedElement,
    formData,
    zoom,
    showGrid,
    gridSize,
    snapToGrid,
    setTemplate,
    addElement,
    updateElement,
    updateElementPosition,
    updateElementSize,
    deleteElement,
    duplicateElement,
    selectElement,
    clearSelection,
    setFormData,
    updateFormData,
    clearFormData,
    setZoom,
    toggleGrid,
    toggleSnapToGrid,
    undo,
    redo,
    saveToHistory,
    getTemplateJson,
    clearTemplate,
    loadTemplate,
  } = useTemplateBuilderStore();

  // Get dynamic fields and input elements for Data Form
  const formFields = useMemo(() => {
    const fields: { id: string; name: string; type: ElementType; element: TemplateElement; fieldName: string }[] = [];
    
    template.elements.forEach(element => {
      // Dynamic fields (text elements with isDynamic)
      if (element.properties.isDynamic && element.properties.fieldName) {
        fields.push({
          id: element.id,
          name: element.properties.name || element.type,
          type: element.type,
          element,
          fieldName: element.properties.fieldName
        });
      }
      // Input elements
      else if (INPUT_ELEMENT_TYPES.includes(element.type)) {
        fields.push({
          id: element.id,
          name: element.properties.name || element.properties.label || element.type,
          type: element.type,
          element,
          fieldName: element.properties.fieldName || element.id
        });
      }
    });
    
    return fields;
  }, [template.elements]);

  // Get table elements for Data Form
  const tableElements = useMemo(() => {
    return template.elements.filter(el => el.type === 'table');
  }, [template.elements]);

  // Load initial template if provided
  useEffect(() => {
    if (initialTemplate) {
      const newTemplate = {
        id: `tpl_${Date.now()}`,
        name: initialTemplate.name,
        description: initialTemplate.description || '',
        category: initialTemplate.category,
        pageSize: { width: 210, height: 297, name: 'A4' },
        orientation: 'portrait' as const,
        margins: { top: 20, right: 20, bottom: 20, left: 20 },
        elements: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      loadTemplate(newTemplate);
      toast.success(`Editing: ${initialTemplate.name}`);
    }
  }, [initialTemplate, loadTemplate]);

  // Canvas dimensions (A4 at 96 DPI)
  const canvasWidth = template.pageSize.width * MM_TO_PX;
  const canvasHeight = template.pageSize.height * MM_TO_PX;

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedElementId) {
          deleteElement(selectedElementId);
          toast.success('Element deleted');
        }
      }
      
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') {
          e.preventDefault();
          if (e.shiftKey) redo();
          else undo();
        }
        if (e.key === 'd') {
          e.preventDefault();
          if (selectedElementId) {
            duplicateElement(selectedElementId);
            toast.success('Element duplicated');
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElementId, deleteElement, duplicateElement, undo, redo]);

  // Snap position to grid
  const snapPosition = useCallback((pos: Position): Position => {
    if (!snapToGrid) return pos;
    return {
      x: Math.round(pos.x / gridSize) * gridSize,
      y: Math.round(pos.y / gridSize) * gridSize,
    };
  }, [snapToGrid, gridSize]);

  // Handle element drag start
  const handleElementMouseDown = (e: React.MouseEvent, element: TemplateElement) => {
    e.stopPropagation();
    if (e.button !== 0) return;
    
    selectElement(element.id);
    setIsDragging(true);
    
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  // Handle resize start
  const handleResizeStart = (e: React.MouseEvent, handle: string) => {
    e.stopPropagation();
    if (!selectedElement) return;
    
    setIsResizing(true);
    setResizeHandle(handle);
    setInitialSize({ ...selectedElement.size });
    setInitialPos({ ...selectedElement.position });
  };

  // Handle mouse move
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!canvasRef.current) return;
      
      const canvasRect = canvasRef.current.getBoundingClientRect();
      const x = (e.clientX - canvasRect.left) / zoom;
      const y = (e.clientY - canvasRect.top) / zoom;

      if (isDragging && selectedElement) {
        const newPos = snapPosition({
          x: Math.max(0, Math.min(canvasWidth - selectedElement.size.width, x - dragOffset.x)),
          y: Math.max(0, Math.min(canvasHeight - selectedElement.size.height, y - dragOffset.y)),
        });
        updateElementPosition(selectedElement.id, newPos);
      }

      if (isResizing && selectedElement && resizeHandle) {
        let newWidth = initialSize.width;
        let newHeight = initialSize.height;
        let newX = initialPos.x;
        let newY = initialPos.y;

        const dx = x - (initialPos.x + initialSize.width);
        const dy = y - (initialPos.y + initialSize.height);

        if (resizeHandle.includes('e')) {
          newWidth = Math.max(40, initialSize.width + dx);
        }
        if (resizeHandle.includes('w')) {
          newWidth = Math.max(40, initialSize.width - dx);
          newX = initialPos.x + (initialSize.width - newWidth);
        }
        if (resizeHandle.includes('s')) {
          newHeight = Math.max(20, initialSize.height + dy);
        }
        if (resizeHandle.includes('n')) {
          newHeight = Math.max(20, initialSize.height - dy);
          newY = initialPos.y + (initialSize.height - newHeight);
        }

        const snappedPos = snapPosition({ x: newX, y: newY });
        updateElementSize(selectedElement.id, { width: newWidth, height: newHeight });
        updateElementPosition(selectedElement.id, snappedPos);
      }
    };

    const handleMouseUp = () => {
      if (isDragging || isResizing) {
        saveToHistory();
      }
      setIsDragging(false);
      setIsResizing(false);
      setResizeHandle(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, selectedElement, dragOffset, resizeHandle, initialSize, initialPos, zoom, snapPosition, updateElementPosition, updateElementSize, saveToHistory, canvasWidth, canvasHeight]);

  // Handle canvas click
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      clearSelection();
    }
  };

  // Handle drop from toolbox
  const handleToolboxDragStart = (e: React.DragEvent, type: ElementType) => {
    e.dataTransfer.setData('elementType', type);
  };

  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('elementType') as ElementType;
    if (!type || !canvasRef.current) return;

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - canvasRect.left) / zoom;
    const y = (e.clientY - canvasRect.top) / zoom;

    addElement(type, snapPosition({ x, y }));
    toast.success(`${type} added to template`);
  };

  const handleCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Handle JSON quick fill
  const handleJsonFill = () => {
    try {
      const data = JSON.parse(jsonInput);
      setFormData(data);
      toast.success('Form data updated from JSON');
    } catch (error) {
      toast.error('Invalid JSON format');
    }
  };

  // Color picker component
  const ColorPicker = ({ value, onChange, label, presets = COLOR_PRESETS }: { 
    value: string; 
    onChange: (color: string) => void;
    label: string;
    presets?: string[];
  }) => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start gap-2 h-9">
          <div 
            className="w-5 h-5 rounded border" 
            style={{ backgroundColor: value === 'transparent' ? 'white' : value, 
              backgroundImage: value === 'transparent' ? 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)' : 'none',
              backgroundSize: '8px 8px',
              backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px'
            }} 
          />
          <span className="text-xs truncate">{label}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="space-y-3">
          <div className="grid grid-cols-7 gap-1">
            {presets.map((color) => (
              <button
                key={color}
                className="w-7 h-7 rounded border-2 hover:scale-110 transition-transform"
                style={{ 
                  backgroundColor: color === 'transparent' ? 'white' : color,
                  backgroundImage: color === 'transparent' ? 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)' : 'none',
                  backgroundSize: '6px 6px',
                  backgroundPosition: '0 0, 0 3px, 3px -3px, -3px 0px',
                  borderColor: value === color ? '#3B82F6' : '#E5E7EB'
                }}
                onClick={() => onChange(color)}
              />
            ))}
          </div>
          <Separator />
          <div className="flex gap-2">
            <Input
              type="color"
              value={value === 'transparent' ? '#ffffff' : value}
              onChange={(e) => onChange(e.target.value)}
              className="w-10 h-9 p-1"
            />
            <Input
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="#000000"
              className="flex-1 h-9"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );

  // Get form field value
  const getFieldValue = (fieldName: string, element: TemplateElement) => {
    if (formData[fieldName] !== undefined) {
      return formData[fieldName];
    }
    // Return default value from element
    if (element.type === 'checkbox' || element.type === 'toggle') {
      return element.properties.checked;
    }
    return element.properties.value || element.properties.text || '';
  };

  // Render element on canvas
  const renderElement = (element: TemplateElement, forPreview = false) => {
    const isSelected = element.id === selectedElementId && !forPreview;
    const { type, position, size, properties, style } = element;
    
    // Get value from form data if available
    const fieldValue = properties.isDynamic || INPUT_ELEMENT_TYPES.includes(type) 
      ? getFieldValue(properties.fieldName || element.id, element)
      : null;

    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      left: position.x,
      top: position.y,
      width: size.width,
      height: size.height,
      cursor: forPreview ? 'default' : isDragging ? 'grabbing' : 'move',
      userSelect: 'none',
      boxSizing: 'border-box',
      zIndex: style.zIndex || 0,
      opacity: (style.opacity ?? 100) / 100,
      transform: style.rotation ? `rotate(${style.rotation}deg)` : undefined,
      boxShadow: style.shadow ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' : undefined,
    };

    const elementContent = () => {
      switch (type) {
        // Text Elements (4)
        case 'label':
          return (
            <div
              style={{
                width: '100%',
                height: '100%',
                fontSize: properties.fontSize || 14,
                fontWeight: properties.bold ? 'bold' : 'normal',
                fontStyle: properties.italic ? 'italic' : 'normal',
                textDecoration: properties.underline ? 'underline' : 'none',
                color: properties.color || '#000000',
                textAlign: properties.textAlign || 'left',
                display: 'flex',
                alignItems: 'center',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                backgroundColor: properties.backgroundColor || 'transparent',
                padding: '4px',
              }}
            >
              {fieldValue !== null ? String(fieldValue) : (properties.text || 'Label')}
            </div>
          );

        case 'heading':
          const HeadingTag = `h${properties.headingLevel || 2}` as keyof JSX.IntrinsicElements;
          return (
            <HeadingTag
              style={{
                width: '100%',
                height: '100%',
                fontSize: properties.fontSize || 24,
                fontWeight: properties.bold ? 'bold' : 'bold',
                fontStyle: properties.italic ? 'italic' : 'normal',
                textDecoration: properties.underline ? 'underline' : 'none',
                color: properties.color || '#000000',
                textAlign: properties.textAlign || 'left',
                display: 'flex',
                alignItems: 'center',
                overflow: 'hidden',
                margin: 0,
                backgroundColor: properties.backgroundColor || 'transparent',
                padding: '4px',
              }}
            >
              {fieldValue !== null ? String(fieldValue) : (properties.text || 'Heading')}
            </HeadingTag>
          );

        case 'paragraph':
          return (
            <p
              style={{
                width: '100%',
                height: '100%',
                fontSize: properties.fontSize || 14,
                fontWeight: properties.bold ? 'bold' : 'normal',
                fontStyle: properties.italic ? 'italic' : 'normal',
                textDecoration: properties.underline ? 'underline' : 'none',
                color: properties.color || '#000000',
                textAlign: properties.textAlign || 'left',
                lineHeight: properties.lineHeight || 1.5,
                overflow: 'auto',
                margin: 0,
                backgroundColor: properties.backgroundColor || 'transparent',
                padding: '8px',
              }}
            >
              {fieldValue !== null ? String(fieldValue) : (properties.text || 'Paragraph text goes here...')}
            </p>
          );

        case 'rich-text':
          return (
            <div
              style={{
                width: '100%',
                height: '100%',
                fontSize: properties.fontSize || 14,
                color: properties.color || '#000000',
                overflow: 'auto',
                backgroundColor: properties.backgroundColor || 'transparent',
                padding: '8px',
                border: '1px dashed #d1d5db',
                borderRadius: 4,
              }}
              dangerouslySetInnerHTML={{ __html: fieldValue !== null ? String(fieldValue) : (properties.text || '<p>Rich text content</p>') }}
            />
          );

        // Input Elements (22)
        case 'textfield':
        case 'email':
        case 'phone':
        case 'url':
        case 'password':
          return (
            <input
              type={type === 'password' ? 'password' : 'text'}
              value={fieldValue !== null ? String(fieldValue) : ''}
              placeholder={properties.placeholder || 'Enter text...'}
              readOnly
              style={{
                width: '100%',
                height: '100%',
                fontSize: properties.fontSize || 14,
                color: properties.color || '#000000',
                backgroundColor: properties.backgroundColor || '#ffffff',
                border: `${properties.borderWidth || 1}px solid ${properties.borderColor || '#d1d5db'}`,
                borderRadius: properties.borderRadius || 4,
                padding: '4px 8px',
                outline: 'none',
              }}
            />
          );

        case 'textarea':
          return (
            <textarea
              value={fieldValue !== null ? String(fieldValue) : ''}
              placeholder={properties.placeholder || 'Enter description...'}
              readOnly
              style={{
                width: '100%',
                height: '100%',
                fontSize: properties.fontSize || 14,
                color: properties.color || '#000000',
                backgroundColor: properties.backgroundColor || '#ffffff',
                border: `${properties.borderWidth || 1}px solid ${properties.borderColor || '#d1d5db'}`,
                borderRadius: properties.borderRadius || 4,
                padding: '8px',
                outline: 'none',
                resize: 'none',
              }}
            />
          );

        case 'number':
          return (
            <input
              type="number"
              value={fieldValue !== null ? fieldValue : ''}
              placeholder={properties.placeholder || '0'}
              readOnly
              style={{
                width: '100%',
                height: '100%',
                fontSize: properties.fontSize || 14,
                color: properties.color || '#000000',
                backgroundColor: properties.backgroundColor || '#ffffff',
                border: `${properties.borderWidth || 1}px solid ${properties.borderColor || '#d1d5db'}`,
                borderRadius: properties.borderRadius || 4,
                padding: '4px 8px',
                outline: 'none',
              }}
            />
          );

        case 'currency':
          const currencyValue = fieldValue !== null ? fieldValue : '';
          const currencySymbol = properties.currency === 'EUR' ? '€' : properties.currency === 'GBP' ? '£' : '$';
          return (
            <div style={{ display: 'flex', alignItems: 'center', width: '100%', height: '100%' }}>
              <span style={{ padding: '4px 8px', backgroundColor: '#f3f4f6', border: `1px solid ${properties.borderColor || '#d1d5db'}`, borderRadius: `${properties.borderRadius || 4}px 0 0 ${properties.borderRadius || 4}px` }}>{currencySymbol}</span>
              <input
                type="number"
                value={currencyValue}
                placeholder={properties.placeholder || '0.00'}
                readOnly
                style={{
                  flex: 1,
                  height: '100%',
                  fontSize: properties.fontSize || 14,
                  color: properties.color || '#000000',
                  backgroundColor: properties.backgroundColor || '#ffffff',
                  border: `${properties.borderWidth || 1}px solid ${properties.borderColor || '#d1d5db'}`,
                  borderLeft: 'none',
                  borderRadius: `0 ${properties.borderRadius || 4}px ${properties.borderRadius || 4}px 0`,
                  padding: '4px 8px',
                  outline: 'none',
                }}
              />
            </div>
          );

        case 'date':
          return (
            <input
              type="date"
              value={fieldValue !== null ? String(fieldValue) : ''}
              readOnly
              style={{
                width: '100%',
                height: '100%',
                fontSize: properties.fontSize || 14,
                color: properties.color || '#000000',
                backgroundColor: properties.backgroundColor || '#ffffff',
                border: `${properties.borderWidth || 1}px solid ${properties.borderColor || '#d1d5db'}`,
                borderRadius: properties.borderRadius || 4,
                padding: '4px 8px',
                outline: 'none',
              }}
            />
          );

        case 'time':
          return (
            <input
              type="time"
              value={fieldValue !== null ? String(fieldValue) : ''}
              readOnly
              style={{
                width: '100%',
                height: '100%',
                fontSize: properties.fontSize || 14,
                color: properties.color || '#000000',
                backgroundColor: properties.backgroundColor || '#ffffff',
                border: `${properties.borderWidth || 1}px solid ${properties.borderColor || '#d1d5db'}`,
                borderRadius: properties.borderRadius || 4,
                padding: '4px 8px',
                outline: 'none',
              }}
            />
          );

        case 'datetime':
          return (
            <input
              type="datetime-local"
              value={fieldValue !== null ? String(fieldValue) : ''}
              readOnly
              style={{
                width: '100%',
                height: '100%',
                fontSize: properties.fontSize || 14,
                color: properties.color || '#000000',
                backgroundColor: properties.backgroundColor || '#ffffff',
                border: `${properties.borderWidth || 1}px solid ${properties.borderColor || '#d1d5db'}`,
                borderRadius: properties.borderRadius || 4,
                padding: '4px 8px',
                outline: 'none',
              }}
            />
          );

        case 'checkbox':
          return (
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: properties.color || '#000000', width: '100%', height: '100%' }}>
              <input type="checkbox" checked={fieldValue !== null ? Boolean(fieldValue) : properties.checked || false} readOnly style={{ width: 18, height: 18 }} />
              <span style={{ fontSize: properties.fontSize || 14 }}>{properties.label || 'Checkbox'}</span>
            </label>
          );

        case 'toggle':
          const toggleChecked = fieldValue !== null ? Boolean(fieldValue) : properties.checked || false;
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', height: '100%' }}>
              <div style={{ 
                width: 44, 
                height: 24, 
                borderRadius: 12, 
                backgroundColor: toggleChecked ? '#22C55E' : '#d1d5db',
                position: 'relative',
                transition: 'background-color 0.2s'
              }}>
                <div style={{ 
                  width: 20, 
                  height: 20, 
                  borderRadius: '50%', 
                  backgroundColor: 'white',
                  position: 'absolute',
                  top: 2,
                  left: toggleChecked ? 22 : 2,
                  transition: 'left 0.2s',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                }} />
              </div>
              <span style={{ fontSize: properties.fontSize || 14, color: properties.color || '#000000' }}>
                {toggleChecked ? (properties.onLabel || 'On') : (properties.offLabel || 'Off')}
              </span>
            </div>
          );

        case 'radio':
          const radioOptions = properties.options || ['Option 1', 'Option 2', 'Option 3'];
          const radioValue = fieldValue !== null ? String(fieldValue) : properties.selectedOption;
          return (
            <div style={{ 
              display: 'flex', 
              flexDirection: properties.orientation === 'horizontal' ? 'row' : 'column', 
              gap: 8,
              width: '100%',
              height: '100%',
              overflow: 'auto',
              padding: '4px'
            }}>
              {radioOptions.map((opt: string, i: number) => (
                <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: properties.fontSize || 14, color: properties.color || '#000000' }}>
                  <input type="radio" name={element.id} checked={radioValue === opt} readOnly style={{ width: 16, height: 16 }} />
                  {opt}
                </label>
              ))}
            </div>
          );

        case 'dropdown':
          const dropdownOptions = properties.options || ['Option 1', 'Option 2', 'Option 3'];
          const dropdownValue = fieldValue !== null ? String(fieldValue) : '';
          return (
            <select
              value={dropdownValue}
              style={{
                width: '100%',
                height: '100%',
                fontSize: properties.fontSize || 14,
                color: properties.color || '#000000',
                backgroundColor: properties.backgroundColor || '#ffffff',
                border: `${properties.borderWidth || 1}px solid ${properties.borderColor || '#d1d5db'}`,
                borderRadius: properties.borderRadius || 4,
                padding: '4px 8px',
                outline: 'none',
              }}
            >
              <option value="">{properties.placeholder || 'Select...'}</option>
              {dropdownOptions.map((opt: string, i: number) => (
                <option key={i} value={opt}>{opt}</option>
              ))}
            </select>
          );

        case 'multiselect':
          const multiOptions = properties.options || ['Item 1', 'Item 2', 'Item 3'];
          const multiValues = fieldValue !== null ? (Array.isArray(fieldValue) ? fieldValue : []) : [];
          return (
            <div style={{ 
              width: '100%', 
              height: '100%', 
              border: `${properties.borderWidth || 1}px solid ${properties.borderColor || '#d1d5db'}`,
              borderRadius: properties.borderRadius || 4,
              backgroundColor: properties.backgroundColor || '#ffffff',
              padding: '4px',
              overflow: 'auto'
            }}>
              {multiOptions.map((opt: string, i: number) => (
                <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 12, padding: '2px 0' }}>
                  <input type="checkbox" checked={multiValues.includes(opt)} readOnly style={{ width: 14, height: 14 }} />
                  {opt}
                </label>
              ))}
            </div>
          );

        case 'rating':
          const ratingValue = fieldValue !== null ? Number(fieldValue) : properties.value || 0;
          const maxRating = properties.maxRating || 5;
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%', height: '100%' }}>
              {Array.from({ length: maxRating }).map((_, i) => (
                <Star 
                  key={i} 
                  style={{ 
                    width: 20, 
                    height: 20, 
                    fill: i < ratingValue ? '#FFD700' : 'transparent',
                    color: i < ratingValue ? '#FFD700' : '#d1d5db'
                  }} 
                />
              ))}
            </div>
          );

        case 'slider':
          const sliderValue = fieldValue !== null ? Number(fieldValue) : properties.value || 50;
          return (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '100%', height: '100%', gap: 4 }}>
              <input 
                type="range" 
                min={properties.minValue || 0} 
                max={properties.maxValue || 100} 
                value={sliderValue}
                readOnly
                style={{ width: '100%' }}
              />
              {properties.showLabels && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: properties.color || '#6B7280' }}>
                  <span>{properties.minValue || 0}</span>
                  <span>{sliderValue}</span>
                  <span>{properties.maxValue || 100}</span>
                </div>
              )}
            </div>
          );

        case 'range':
          return (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '100%', height: '100%', gap: 4 }}>
              <div style={{ position: 'relative', height: 6, backgroundColor: '#e5e7eb', borderRadius: 3 }}>
                <div style={{ 
                  position: 'absolute', 
                  left: `${((properties.valueStart || 20) / (properties.maxValue || 100)) * 100}%`,
                  right: `${100 - ((properties.valueEnd || 80) / (properties.maxValue || 100)) * 100}%`,
                  height: '100%',
                  backgroundColor: '#3B82F6',
                  borderRadius: 3
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: properties.color || '#6B7280' }}>
                <span>{properties.valueStart || 20}</span>
                <span>{properties.valueEnd || 80}</span>
              </div>
            </div>
          );

        case 'file-upload':
          return (
            <div style={{
              width: '100%',
              height: '100%',
              border: `2px dashed ${properties.borderColor || '#d1d5db'}`,
              borderRadius: properties.borderRadius || 8,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              backgroundColor: properties.backgroundColor || '#fafafa',
              padding: '8px'
            }}>
              <Upload style={{ width: 24, height: 24, color: '#9ca3af' }} />
              <span style={{ fontSize: 12, color: '#6B7280' }}>{properties.placeholder || 'Upload file...'}</span>
            </div>
          );

        case 'color-picker':
          const colorValue = fieldValue !== null ? String(fieldValue) : properties.defaultColor || '#3B82F6';
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', height: '100%', padding: '4px' }}>
              <div style={{ 
                width: 32, 
                height: 32, 
                backgroundColor: colorValue, 
                borderRadius: 4,
                border: '2px solid #e5e7eb'
              }} />
              <span style={{ fontSize: 12, color: properties.color || '#000000' }}>{colorValue}</span>
            </div>
          );

        case 'signature':
          return (
            <div style={{
              width: '100%',
              height: '100%',
              border: `${properties.borderWidth || 1}px dashed ${properties.borderColor || '#d1d5db'}`,
              borderRadius: properties.borderRadius || 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#9ca3af',
              fontSize: 12,
              backgroundColor: properties.backgroundColor || '#fafafa',
            }}>
              <PenTool style={{ width: 20, height: 20, marginRight: 8 }} />
              {fieldValue !== null ? String(fieldValue) : (properties.placeholder || 'Sign here')}
            </div>
          );

        // Media Elements (7)
        case 'image':
          return (
            <div
              style={{
                width: '100%',
                height: '100%',
                border: `${properties.borderWidth || 1}px solid ${properties.borderColor || '#e5e7eb'}`,
                borderRadius: properties.borderRadius || 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#9ca3af',
                fontSize: 12,
                backgroundColor: properties.backgroundColor || '#f9fafb',
                overflow: 'hidden',
              }}
            >
              {properties.src ? (
                <img src={properties.src} alt={properties.alt || ''} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: properties.fit || 'contain' }} />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <ImageIcon className="w-8 h-8 text-gray-300" />
                  <span>Image</span>
                </div>
              )}
            </div>
          );

        case 'logo':
          return (
            <div
              style={{
                width: '100%',
                height: '100%',
                border: `${properties.borderWidth || 1}px solid ${properties.borderColor || '#e5e7eb'}`,
                borderRadius: properties.borderRadius || 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: properties.backgroundColor || '#ffffff',
                overflow: 'hidden',
              }}
            >
              {properties.src ? (
                <img src={properties.src} alt={properties.alt || 'Logo'} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <Building2 style={{ width: 24, height: 24, color: '#9ca3af' }} />
                  <span style={{ fontSize: 10, color: '#9ca3af' }}>Logo</span>
                </div>
              )}
            </div>
          );

        case 'qr-code':
          return (
            <div
              style={{
                width: '100%',
                height: '100%',
                border: '1px solid #e5e7eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: properties.backgroundColor || '#ffffff',
                borderRadius: properties.borderRadius || 4,
              }}
            >
              <div style={{ 
                width: '80%', 
                height: '80%', 
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gridTemplateRows: 'repeat(5, 1fr)',
                gap: 2
              }}>
                {Array.from({ length: 25 }).map((_, i) => (
                  <div key={i} style={{ 
                    backgroundColor: Math.random() > 0.4 ? (properties.color || '#000000') : 'transparent',
                    borderRadius: 1
                  }} />
                ))}
              </div>
            </div>
          );

        case 'barcode':
          return (
            <div
              style={{
                width: '100%',
                height: '100%',
                border: '1px solid #e5e7eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: properties.backgroundColor || '#ffffff',
                fontSize: 10,
                fontFamily: 'monospace',
                color: properties.color || '#000000',
                borderRadius: properties.borderRadius || 4,
              }}
            >
              <div style={{ display: 'flex', gap: 1, alignItems: 'end', height: '60%' }}>
                {Array.from({ length: 30 }).map((_, i) => (
                  <div key={i} style={{ 
                    width: Math.random() > 0.5 ? 2 : 1, 
                    height: `${50 + Math.random() * 50}%`,
                    backgroundColor: properties.color || '#000000'
                  }} />
                ))}
              </div>
            </div>
          );

        case 'watermark':
          return (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: properties.fontSize || 48,
                color: properties.color || '#e5e7eb',
                transform: `rotate(${properties.rotation || -45}deg)`,
                opacity: (properties.opacity || 20) / 100,
                fontWeight: 'bold',
                whiteSpace: 'nowrap',
              }}
            >
              {properties.text || 'WATERMARK'}
            </div>
          );

        case 'video':
          return (
            <div
              style={{
                width: '100%',
                height: '100%',
                border: '1px solid #e5e7eb',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#000',
                borderRadius: properties.borderRadius || 4,
                gap: 8,
              }}
            >
              <Play style={{ width: 32, height: 32, color: '#fff' }} />
              <span style={{ fontSize: 10, color: '#9ca3af' }}>{properties.placeholder || 'Video'}</span>
            </div>
          );

        case 'audio':
          return (
            <div
              style={{
                width: '100%',
                height: '100%',
                border: '1px solid #e5e7eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: properties.backgroundColor || '#f9fafb',
                gap: 8,
                borderRadius: properties.borderRadius || 4,
                padding: '8px'
              }}
            >
              <Music style={{ width: 20, height: 20, color: '#6B7280' }} />
              <div style={{ flex: 1, height: 4, backgroundColor: '#e5e7eb', borderRadius: 2 }}>
                <div style={{ width: '30%', height: '100%', backgroundColor: '#3B82F6', borderRadius: 2 }} />
              </div>
            </div>
          );

        // Shape Elements (10)
        case 'line':
          return (
            <div
              style={{
                width: '100%',
                height: properties.borderWidth || 2,
                backgroundColor: properties.borderColor || '#000000',
                borderTopStyle: properties.lineStyle === 'dashed' ? 'dashed' : properties.lineStyle === 'dotted' ? 'dotted' : 'solid',
              }}
            />
          );

        case 'rectangle':
          return (
            <div
              style={{
                width: '100%',
                height: '100%',
                border: `${properties.borderWidth || 1}px solid ${properties.borderColor || '#000000'}`,
                backgroundColor: properties.backgroundColor || properties.fillColor || 'transparent',
                borderRadius: properties.borderRadius || 0,
              }}
            />
          );

        case 'circle':
          return (
            <div
              style={{
                width: '100%',
                height: '100%',
                border: `${properties.borderWidth || 1}px solid ${properties.borderColor || '#000000'}`,
                backgroundColor: properties.backgroundColor || properties.fillColor || 'transparent',
                borderRadius: '50%',
              }}
            />
          );

        case 'ellipse':
          return (
            <div
              style={{
                width: '100%',
                height: '100%',
                border: `${properties.borderWidth || 1}px solid ${properties.borderColor || '#000000'}`,
                backgroundColor: properties.backgroundColor || properties.fillColor || 'transparent',
                borderRadius: '50%',
              }}
            />
          );

        case 'arrow':
          return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
              <ArrowRight style={{ width: '80%', height: '80%', color: properties.color || '#000000' }} />
            </div>
          );

        case 'star':
          return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
              <Star style={{ 
                width: '100%', 
                height: '100%', 
                fill: properties.fillColor || '#FFD700', 
                color: properties.strokeColor || '#000000',
                strokeWidth: properties.strokeWidth || 1
              }} />
            </div>
          );

        case 'triangle':
          return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
              <Triangle style={{ 
                width: '80%', 
                height: '80%', 
                fill: properties.fillColor || 'transparent', 
                color: properties.strokeColor || '#000000'
              }} />
            </div>
          );

        case 'polygon':
          return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
              <Hexagon style={{ 
                width: '80%', 
                height: '80%', 
                fill: properties.fillColor || 'transparent', 
                color: properties.strokeColor || '#000000'
              }} />
            </div>
          );

        case 'divider':
          return (
            <div style={{ display: 'flex', alignItems: 'center', width: '100%', height: '100%' }}>
              <div style={{ 
                width: '100%', 
                height: properties.thickness || 1, 
                backgroundColor: properties.color || '#d1d5db',
                borderTopStyle: properties.style === 'dashed' ? 'dashed' : properties.style === 'dotted' ? 'dotted' : 'solid'
              }} />
            </div>
          );

        case 'rounded-box':
          return (
            <div
              style={{
                width: '100%',
                height: '100%',
                border: `${properties.borderWidth || 1}px solid ${properties.borderColor || '#000000'}`,
                backgroundColor: properties.backgroundColor || properties.fillColor || 'transparent',
                borderRadius: properties.borderRadius || 8,
              }}
            />
          );

        // Data Elements (4)
        case 'table':
          const tableData = fieldValue !== null && Array.isArray(fieldValue) ? fieldValue : properties.tableData;
          const columns = properties.columns || 3;
          const rows = properties.rows || 4;
          return (
            <table
              style={{
                width: '100%',
                height: '100%',
                borderCollapse: 'collapse',
                fontSize: 12,
              }}
            >
              <tbody>
                {Array.from({ length: Math.min(rows, 10) }).map((_, rowIndex) => (
                  <tr key={rowIndex}>
                    {Array.from({ length: Math.min(columns, 8) }).map((_, colIndex) => {
                      const cellValue = tableData?.[rowIndex]?.[colIndex] || '';
                      return (
                        <td
                          key={colIndex}
                          style={{
                            border: `${properties.borderWidth || 1}px solid ${properties.borderColor || '#d1d5db'}`,
                            padding: properties.cellPadding || 8,
                            backgroundColor: properties.headerRow && rowIndex === 0 ? (properties.headerBackgroundColor || '#f3f4f6') : (properties.backgroundColor || 'white'),
                            color: properties.color || '#000000',
                            fontWeight: properties.headerRow && rowIndex === 0 ? 'bold' : 'normal',
                            textAlign: properties.textAlign || 'left',
                          }}
                        >
                          {cellValue || (properties.headerRow && rowIndex === 0 ? `Header ${colIndex + 1}` : '')}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          );

        case 'list':
          const listItems = fieldValue !== null && Array.isArray(fieldValue) ? fieldValue : properties.listItems || ['Item 1', 'Item 2', 'Item 3'];
          return (
            <ul style={{ 
              width: '100%', 
              height: '100%', 
              overflow: 'auto', 
              padding: '8px 16px', 
              margin: 0,
              listStyleType: properties.listStyle === 'numbered' ? 'decimal' : 'disc'
            }}>
              {listItems.map((item: string, i: number) => (
                <li key={i} style={{ fontSize: properties.fontSize || 14, color: properties.color || '#000000', marginBottom: 4 }}>
                  {item}
                </li>
              ))}
            </ul>
          );

        case 'chart':
          const chartData = properties.chartData || [{ label: 'A', value: 10 }, { label: 'B', value: 20 }];
          const maxValue = Math.max(...chartData.map((d: any) => d.value));
          return (
            <div style={{ width: '100%', height: '100%', padding: 8 }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', height: '80%', gap: 8 }}>
                {chartData.map((item: any, i: number) => (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ 
                      width: '100%', 
                      height: `${(item.value / maxValue) * 100}%`,
                      backgroundColor: properties.color || '#3B82F6',
                      borderRadius: '4px 4px 0 0'
                    }} />
                    <span style={{ fontSize: 10, color: properties.color || '#000000', marginTop: 4 }}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          );

        case 'progress-bar':
          const progress = fieldValue !== null ? Number(fieldValue) : properties.progressValue || 60;
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', height: '100%', padding: '0 4px' }}>
              <div style={{ 
                flex: 1, 
                height: '60%', 
                backgroundColor: '#e5e7eb', 
                borderRadius: 4,
                overflow: 'hidden'
              }}>
                <div style={{ 
                  width: `${progress}%`, 
                  height: '100%', 
                  backgroundColor: properties.progressColor || '#3B82F6',
                  transition: 'width 0.3s'
                }} />
              </div>
              {properties.showPercentage && (
                <span style={{ fontSize: 12, color: properties.color || '#000000', minWidth: 36 }}>{progress}%</span>
              )}
            </div>
          );

        // Navigation Elements (2)
        case 'hyperlink':
          return (
            <a 
              href={properties.linkUrl || '#'}
              target={properties.target || '_self'}
              style={{
                color: '#3B82F6',
                textDecoration: 'underline',
                fontSize: properties.fontSize || 14,
                fontWeight: properties.bold ? 'bold' : 'normal',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                width: '100%',
                height: '100%',
              }}
              onClick={(e) => e.preventDefault()}
            >
              {fieldValue !== null ? String(fieldValue) : (properties.text || 'Click here')}
              <ExternalLink style={{ width: 12, height: 12 }} />
            </a>
          );

        case 'button':
          const buttonStyles: Record<string, React.CSSProperties> = {
            primary: { backgroundColor: '#3B82F6', color: '#fff', border: 'none' },
            secondary: { backgroundColor: '#6B7280', color: '#fff', border: 'none' },
            outline: { backgroundColor: 'transparent', color: '#000', border: '1px solid #d1d5db' },
            ghost: { backgroundColor: 'transparent', color: '#000', border: 'none' },
            destructive: { backgroundColor: '#EF4444', color: '#fff', border: 'none' },
          };
          return (
            <button
              style={{
                width: '100%',
                height: '100%',
                padding: '8px 16px',
                borderRadius: properties.borderRadius || 6,
                fontSize: properties.fontSize || 14,
                fontWeight: properties.bold ? 'bold' : 'normal',
                cursor: 'pointer',
                ...buttonStyles[properties.buttonStyle || 'primary'],
              }}
            >
              {fieldValue !== null ? String(fieldValue) : (properties.text || 'Button')}
            </button>
          );

        // Decorative Elements (5)
        case 'icon':
          const IconComponent = iconMap[properties.iconName || 'Star'] || Star;
          return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
              <IconComponent style={{ 
                width: properties.size || 24, 
                height: properties.size || 24, 
                color: properties.color || '#000000' 
              }} />
            </div>
          );

        case 'page-number':
          return (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
              fontSize: properties.fontSize || 12,
              color: properties.color || '#000000',
            }}>
              {properties.format?.replace('{n}', '1') || 'Page 1'}
            </div>
          );

        case 'stamp':
          return (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
              border: `3px solid ${properties.color || '#22C55E'}`,
              borderRadius: '50%',
              color: properties.color || '#22C55E',
              fontSize: properties.fontSize || 12,
              fontWeight: 'bold',
              transform: `rotate(${properties.rotation || -15}deg)`,
              textTransform: 'uppercase',
            }}>
              {properties.text || 'APPROVED'}
            </div>
          );

        case 'badge':
          const badgeVariants: Record<string, React.CSSProperties> = {
            default: { backgroundColor: '#3B82F6', color: '#fff' },
            secondary: { backgroundColor: '#6B7280', color: '#fff' },
            destructive: { backgroundColor: '#EF4444', color: '#fff' },
            outline: { backgroundColor: 'transparent', color: '#000', border: '1px solid #d1d5db' },
          };
          return (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
              padding: '2px 8px',
              borderRadius: 9999,
              fontSize: properties.fontSize || 12,
              fontWeight: 'bold',
              ...badgeVariants[properties.badgeVariant || 'default'],
            }}>
              {properties.text || 'New'}
            </span>
          );

        case 'tooltip':
          return (
            <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center' }}>
              <span style={{ 
                borderBottom: '1px dashed #9ca3af', 
                cursor: 'help',
                fontSize: properties.fontSize || 14,
                color: properties.color || '#000000'
              }}>
                {properties.trigger || 'Hover me'}
              </span>
              <div style={{
                position: 'absolute',
                bottom: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: '#1f2937',
                color: '#fff',
                padding: '4px 8px',
                borderRadius: 4,
                fontSize: 12,
                whiteSpace: 'nowrap',
                marginBottom: 4,
              }}>
                {properties.text || 'Tooltip text'}
              </div>
            </div>
          );

        // Layout Elements (2)
        case 'container':
          return (
            <div style={{
              width: '100%',
              height: '100%',
              border: `${properties.borderWidth || 1}px solid ${properties.borderColor || '#e5e7eb'}`,
              backgroundColor: properties.backgroundColor || '#ffffff',
              borderRadius: properties.borderRadius || 4,
              padding: properties.padding || 16,
            }}>
              <span style={{ color: '#9ca3af', fontSize: 12 }}>Container</span>
            </div>
          );

        case 'columns':
          return (
            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${properties.columnCount || 2}, 1fr)`,
              gap: properties.gap || 16,
              width: '100%',
              height: '100%',
              padding: 8,
            }}>
              {Array.from({ length: properties.columnCount || 2 }).map((_, i) => (
                <div key={i} style={{
                  border: '1px dashed #d1d5db',
                  borderRadius: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#9ca3af',
                  fontSize: 12,
                }}>
                  Column {i + 1}
                </div>
              ))}
            </div>
          );

        default:
          return (
            <div style={{ 
              width: '100%', 
              height: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              backgroundColor: '#f3f4f6',
              borderRadius: 4,
              color: '#6B7280',
              fontSize: 12,
            }}>
              {type}
            </div>
          );
      }
    };

    return (
      <div
        key={element.id}
        style={baseStyle}
        onMouseDown={forPreview ? undefined : (e) => handleElementMouseDown(e, element)}
        className={`transition-shadow ${isSelected ? 'ring-2 ring-blue-500 ring-offset-1' : forPreview ? '' : 'hover:ring-1 hover:ring-blue-300'}`}
      >
        {elementContent()}
        
        {/* Resize handles */}
        {isSelected && !forPreview && (
          <>
            <div onMouseDown={(e) => handleResizeStart(e, 'nw')} className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-blue-500 rounded-sm cursor-nw-resize" />
            <div onMouseDown={(e) => handleResizeStart(e, 'ne')} className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-blue-500 rounded-sm cursor-ne-resize" />
            <div onMouseDown={(e) => handleResizeStart(e, 'sw')} className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-blue-500 rounded-sm cursor-sw-resize" />
            <div onMouseDown={(e) => handleResizeStart(e, 'se')} className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-blue-500 rounded-sm cursor-se-resize" />
            <div onMouseDown={(e) => handleResizeStart(e, 'n')} className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-2 border-blue-500 rounded-sm cursor-n-resize" />
            <div onMouseDown={(e) => handleResizeStart(e, 's')} className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-2 border-blue-500 rounded-sm cursor-s-resize" />
            <div onMouseDown={(e) => handleResizeStart(e, 'w')} className="absolute top-1/2 -translate-y-1/2 -left-1.5 w-3 h-3 bg-white border-2 border-blue-500 rounded-sm cursor-w-resize" />
            <div onMouseDown={(e) => handleResizeStart(e, 'e')} className="absolute top-1/2 -translate-y-1/2 -right-1.5 w-3 h-3 bg-white border-2 border-blue-500 rounded-sm cursor-e-resize" />
          </>
        )}
      </div>
    );
  };

  // Collapsible Section Component for Properties
  const CollapsibleSection = ({ 
    id, 
    title, 
    children, 
    defaultOpen = true 
  }: { 
    id: string; 
    title: string; 
    children: React.ReactNode; 
    defaultOpen?: boolean;
  }) => (
    <Collapsible
      open={openSections[id] ?? defaultOpen}
      onOpenChange={() => toggleSection(id)}
      className="border rounded-lg"
    >
      <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted/50 transition-colors">
        <h4 className="text-sm font-medium">{title}</h4>
        <ChevronRight className={`h-4 w-4 transition-transform duration-200 ${openSections[id] ?? defaultOpen ? 'rotate-90' : ''}`} />
      </CollapsibleTrigger>
      <CollapsibleContent className="p-3 pt-0 space-y-3">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );

  // Render properties panel
  const renderPropertiesPanel = () => {
    if (!selectedElement) {
      return (
        <div className="p-4 text-center text-muted-foreground">
          <Settings className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>Select an element to edit its properties</p>
        </div>
      );
    }

    const { type, properties, style } = selectedElement;

    return (
      <ScrollArea className="h-full w-full">
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold capitalize">{type.replace('-', ' ')}</h3>
            <div className="flex gap-1">
              <Button size="icon" variant="ghost" onClick={() => { duplicateElement(selectedElement.id); toast.success('Element duplicated'); }}>
                <Copy className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="ghost" className="text-destructive" onClick={() => { deleteElement(selectedElement.id); toast.success('Element deleted'); }}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Position & Size */}
          <CollapsibleSection id="position" title="Position & Size">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">X (mm)</Label>
                <Input
                  type="number"
                  value={Math.round(pixelsToMm(selectedElement.position.x))}
                  onChange={(e) => updateElementPosition(selectedElement.id, { ...selectedElement.position, x: mmToPixels(parseFloat(e.target.value) || 0) })}
                />
              </div>
              <div>
                <Label className="text-xs">Y (mm)</Label>
                <Input
                  type="number"
                  value={Math.round(pixelsToMm(selectedElement.position.y))}
                  onChange={(e) => updateElementPosition(selectedElement.id, { ...selectedElement.position, y: mmToPixels(parseFloat(e.target.value) || 0) })}
                />
              </div>
              <div>
                <Label className="text-xs">Width (mm)</Label>
                <Input
                  type="number"
                  value={Math.round(pixelsToMm(selectedElement.size.width))}
                  onChange={(e) => updateElementSize(selectedElement.id, { ...selectedElement.size, width: mmToPixels(parseFloat(e.target.value) || 40) })}
                />
              </div>
              <div>
                <Label className="text-xs">Height (mm)</Label>
                <Input
                  type="number"
                  value={Math.round(pixelsToMm(selectedElement.size.height))}
                  onChange={(e) => updateElementSize(selectedElement.id, { ...selectedElement.size, height: mmToPixels(parseFloat(e.target.value) || 20) })}
                />
              </div>
            </div>
          </CollapsibleSection>

          {/* Text properties for text elements */}
          {['label', 'heading', 'paragraph', 'rich-text', 'textfield', 'textarea', 'number', 'currency', 'email', 'phone', 'url', 'password', 'date', 'time', 'datetime'].includes(type) && (
            <CollapsibleSection id="text" title="Text">
              {['label', 'heading', 'paragraph', 'rich-text'].includes(type) && (
                <div>
                  <Label className="text-xs">Content</Label>
                  <Textarea
                    value={properties.text || ''}
                    onChange={(e) => updateElement(selectedElement.id, { properties: { ...properties, text: e.target.value } })}
                    rows={3}
                  />
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Font Size</Label>
                  <Input
                    type="number"
                    value={properties.fontSize || 14}
                    onChange={(e) => updateElement(selectedElement.id, { properties: { ...properties, fontSize: parseInt(e.target.value) || 14 } })}
                  />
                </div>
                <div>
                  <Label className="text-xs">Text Color</Label>
                  <ColorPicker
                    value={properties.color || '#000000'}
                    onChange={(color) => updateElement(selectedElement.id, { properties: { ...properties, color } })}
                    label="Text"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={properties.bold ? 'default' : 'outline'}
                  onClick={() => updateElement(selectedElement.id, { properties: { ...properties, bold: !properties.bold } })}
                >
                  <b>B</b>
                </Button>
                <Button
                  size="sm"
                  variant={properties.italic ? 'default' : 'outline'}
                  onClick={() => updateElement(selectedElement.id, { properties: { ...properties, italic: !properties.italic } })}
                >
                  <i>I</i>
                </Button>
                <Button
                  size="sm"
                  variant={properties.underline ? 'default' : 'outline'}
                  onClick={() => updateElement(selectedElement.id, { properties: { ...properties, underline: !properties.underline } })}
                >
                  <u>U</u>
                </Button>
              </div>

              <div>
                <Label className="text-xs">Text Align</Label>
                <Select
                  value={properties.textAlign || 'left'}
                  onValueChange={(val) => updateElement(selectedElement.id, { properties: { ...properties, textAlign: val as any } })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="center">Center</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {type === 'heading' && (
                <div>
                  <Label className="text-xs">Heading Level</Label>
                  <Select
                    value={String(properties.headingLevel || 2)}
                    onValueChange={(val) => updateElement(selectedElement.id, { properties: { ...properties, headingLevel: parseInt(val) as any } })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6].map(level => (
                        <SelectItem key={level} value={String(level)}>H{level}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CollapsibleSection>
          )}

          {/* Background color */}
          {['label', 'heading', 'paragraph', 'rich-text', 'textfield', 'textarea', 'number', 'currency', 'email', 'phone', 'url', 'password', 'date', 'time', 'datetime', 'dropdown', 'rectangle', 'table', 'image', 'logo', 'signature', 'qr-code', 'barcode', 'container', 'rounded-box', 'circle', 'ellipse', 'file-upload', 'multiselect'].includes(type) && (
            <CollapsibleSection id="background" title="Background">
              <ColorPicker
                value={properties.backgroundColor || 'transparent'}
                onChange={(color) => updateElement(selectedElement.id, { properties: { ...properties, backgroundColor: color } })}
                label="Background"
                presets={BACKGROUND_PRESETS}
              />
            </CollapsibleSection>
          )}

          {/* Border properties */}
          {['textfield', 'textarea', 'number', 'currency', 'email', 'phone', 'url', 'password', 'date', 'time', 'datetime', 'dropdown', 'rectangle', 'signature', 'image', 'logo', 'table', 'rounded-box', 'circle', 'ellipse', 'container', 'file-upload', 'multiselect'].includes(type) && (
            <CollapsibleSection id="border" title="Border">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Width</Label>
                  <Input
                    type="number"
                    value={properties.borderWidth || 1}
                    onChange={(e) => updateElement(selectedElement.id, { properties: { ...properties, borderWidth: parseInt(e.target.value) || 1 } })}
                  />
                </div>
                <div>
                  <Label className="text-xs">Border Color</Label>
                  <ColorPicker
                    value={properties.borderColor || '#d1d5db'}
                    onChange={(color) => updateElement(selectedElement.id, { properties: { ...properties, borderColor: color } })}
                    label="Border"
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs">Border Radius</Label>
                <Input
                  type="number"
                  value={properties.borderRadius || 0}
                  onChange={(e) => updateElement(selectedElement.id, { properties: { ...properties, borderRadius: parseInt(e.target.value) || 0 } })}
                />
              </div>
            </CollapsibleSection>
          )}

          {/* Placeholder for inputs */}
          {['textfield', 'textarea', 'number', 'currency', 'email', 'phone', 'url', 'password', 'date', 'time', 'datetime', 'dropdown', 'multiselect', 'file-upload', 'signature'].includes(type) && (
            <CollapsibleSection id="placeholder" title="Placeholder">
              <Input
                value={properties.placeholder || ''}
                onChange={(e) => updateElement(selectedElement.id, { properties: { ...properties, placeholder: e.target.value } })}
              />
            </CollapsibleSection>
          )}

          {/* Element-specific settings */}
          <CollapsibleSection id="element" title="Element Settings">
            {/* Checkbox/Toggle */}
            {type === 'checkbox' && (
              <>
                <div>
                  <Label className="text-xs">Label</Label>
                  <Input
                    value={properties.label || ''}
                    onChange={(e) => updateElement(selectedElement.id, { properties: { ...properties, label: e.target.value } })}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={properties.checked || false}
                    onCheckedChange={(checked) => updateElement(selectedElement.id, { properties: { ...properties, checked } })}
                  />
                  <Label className="text-xs">Checked by default</Label>
                </div>
              </>
            )}

            {type === 'toggle' && (
              <>
                <div>
                  <Label className="text-xs">Label</Label>
                  <Input
                    value={properties.label || ''}
                    onChange={(e) => updateElement(selectedElement.id, { properties: { ...properties, label: e.target.value } })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">On Label</Label>
                    <Input
                      value={properties.onLabel || 'On'}
                      onChange={(e) => updateElement(selectedElement.id, { properties: { ...properties, onLabel: e.target.value } })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Off Label</Label>
                    <Input
                      value={properties.offLabel || 'Off'}
                      onChange={(e) => updateElement(selectedElement.id, { properties: { ...properties, offLabel: e.target.value } })}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={properties.checked || false}
                    onCheckedChange={(checked) => updateElement(selectedElement.id, { properties: { ...properties, checked } })}
                  />
                  <Label className="text-xs">On by default</Label>
                </div>
              </>
            )}

            {/* Radio/Dropdown options */}
            {['radio', 'dropdown', 'multiselect'].includes(type) && (
              <div>
                <Label className="text-xs">Options (one per line)</Label>
                <Textarea
                  value={properties.options?.join('\n') || ''}
                  onChange={(e) => updateElement(selectedElement.id, { properties: { ...properties, options: e.target.value.split('\n').filter(Boolean) } })}
                  rows={4}
                />
              </div>
            )}

            {type === 'radio' && (
              <div>
                <Label className="text-xs">Orientation</Label>
                <Select
                  value={properties.orientation || 'vertical'}
                  onValueChange={(val) => updateElement(selectedElement.id, { properties: { ...properties, orientation: val as any } })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vertical">Vertical</SelectItem>
                    <SelectItem value="horizontal">Horizontal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Rating */}
            {type === 'rating' && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Max Rating</Label>
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      value={properties.maxRating || 5}
                      onChange={(e) => updateElement(selectedElement.id, { properties: { ...properties, maxRating: parseInt(e.target.value) || 5 } })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Default Value</Label>
                    <Input
                      type="number"
                      min={0}
                      value={properties.value || 0}
                      onChange={(e) => updateElement(selectedElement.id, { properties: { ...properties, value: parseInt(e.target.value) || 0 } })}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={properties.allowHalf || false}
                    onCheckedChange={(checked) => updateElement(selectedElement.id, { properties: { ...properties, allowHalf: checked } })}
                  />
                  <Label className="text-xs">Allow Half Stars</Label>
                </div>
              </>
            )}

            {/* Slider/Range */}
            {['slider', 'range'].includes(type) && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Min Value</Label>
                    <Input
                      type="number"
                      value={properties.minValue || 0}
                      onChange={(e) => updateElement(selectedElement.id, { properties: { ...properties, minValue: parseInt(e.target.value) || 0 } })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Max Value</Label>
                    <Input
                      type="number"
                      value={properties.maxValue || 100}
                      onChange={(e) => updateElement(selectedElement.id, { properties: { ...properties, maxValue: parseInt(e.target.value) || 100 } })}
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Step</Label>
                  <Input
                    type="number"
                    value={properties.step || 1}
                    onChange={(e) => updateElement(selectedElement.id, { properties: { ...properties, step: parseInt(e.target.value) || 1 } })}
                  />
                </div>
                {type === 'slider' && (
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={properties.showLabels || false}
                      onCheckedChange={(checked) => updateElement(selectedElement.id, { properties: { ...properties, showLabels: checked } })}
                    />
                    <Label className="text-xs">Show Labels</Label>
                  </div>
                )}
              </>
            )}

            {/* Currency */}
            {type === 'currency' && (
              <div>
                <Label className="text-xs">Currency</Label>
                <Select
                  value={properties.currency || 'USD'}
                  onValueChange={(val) => updateElement(selectedElement.id, { properties: { ...properties, currency: val } })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                    <SelectItem value="JPY">JPY (¥)</SelectItem>
                    <SelectItem value="CNY">CNY (¥)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Progress Bar */}
            {type === 'progress-bar' && (
              <>
                <div>
                  <Label className="text-xs">Progress Value (%)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={properties.progressValue || 0}
                    onChange={(e) => updateElement(selectedElement.id, { properties: { ...properties, progressValue: parseInt(e.target.value) || 0 } })}
                  />
                </div>
                <div>
                  <Label className="text-xs">Progress Color</Label>
                  <ColorPicker
                    value={properties.progressColor || '#3B82F6'}
                    onChange={(color) => updateElement(selectedElement.id, { properties: { ...properties, progressColor: color } })}
                    label="Progress"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={properties.showPercentage || false}
                    onCheckedChange={(checked) => updateElement(selectedElement.id, { properties: { ...properties, showPercentage: checked } })}
                  />
                  <Label className="text-xs">Show Percentage</Label>
                </div>
              </>
            )}

            {/* Button */}
            {type === 'button' && (
              <>
                <div>
                  <Label className="text-xs">Button Text</Label>
                  <Input
                    value={properties.text || 'Button'}
                    onChange={(e) => updateElement(selectedElement.id, { properties: { ...properties, text: e.target.value } })}
                  />
                </div>
                <div>
                  <Label className="text-xs">Button Style</Label>
                  <Select
                    value={properties.buttonStyle || 'primary'}
                    onValueChange={(val) => updateElement(selectedElement.id, { properties: { ...properties, buttonStyle: val as any } })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="primary">Primary</SelectItem>
                      <SelectItem value="secondary">Secondary</SelectItem>
                      <SelectItem value="outline">Outline</SelectItem>
                      <SelectItem value="ghost">Ghost</SelectItem>
                      <SelectItem value="destructive">Destructive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {/* Hyperlink */}
            {type === 'hyperlink' && (
              <>
                <div>
                  <Label className="text-xs">Link Text</Label>
                  <Input
                    value={properties.text || 'Click here'}
                    onChange={(e) => updateElement(selectedElement.id, { properties: { ...properties, text: e.target.value } })}
                  />
                </div>
                <div>
                  <Label className="text-xs">URL</Label>
                  <Input
                    value={properties.linkUrl || ''}
                    onChange={(e) => updateElement(selectedElement.id, { properties: { ...properties, linkUrl: e.target.value } })}
                  />
                </div>
                <div>
                  <Label className="text-xs">Target</Label>
                  <Select
                    value={properties.target || '_self'}
                    onValueChange={(val) => updateElement(selectedElement.id, { properties: { ...properties, target: val as any } })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_self">Same Window</SelectItem>
                      <SelectItem value="_blank">New Window</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {/* Image/Logo */}
            {['image', 'logo'].includes(type) && (
              <>
                <div>
                  <Label className="text-xs">Image URL</Label>
                  <Input
                    value={properties.src || ''}
                    onChange={(e) => updateElement(selectedElement.id, { properties: { ...properties, src: e.target.value } })}
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <Label className="text-xs">Alt Text</Label>
                  <Input
                    value={properties.alt || ''}
                    onChange={(e) => updateElement(selectedElement.id, { properties: { ...properties, alt: e.target.value } })}
                  />
                </div>
                <div>
                  <Label className="text-xs">Fit</Label>
                  <Select
                    value={properties.fit || 'contain'}
                    onValueChange={(val) => updateElement(selectedElement.id, { properties: { ...properties, fit: val as any } })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="contain">Contain</SelectItem>
                      <SelectItem value="cover">Cover</SelectItem>
                      <SelectItem value="fill">Fill</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {/* Shape properties */}
            {['rectangle', 'circle', 'ellipse', 'rounded-box', 'star', 'triangle', 'polygon'].includes(type) && (
              <>
                <div>
                  <Label className="text-xs">Fill Color</Label>
                  <ColorPicker
                    value={properties.fillColor || 'transparent'}
                    onChange={(color) => updateElement(selectedElement.id, { properties: { ...properties, fillColor: color } })}
                    label="Fill"
                    presets={BACKGROUND_PRESETS}
                  />
                </div>
                <div>
                  <Label className="text-xs">Stroke Color</Label>
                  <ColorPicker
                    value={properties.strokeColor || '#000000'}
                    onChange={(color) => updateElement(selectedElement.id, { properties: { ...properties, strokeColor: color } })}
                    label="Stroke"
                  />
                </div>
                <div>
                  <Label className="text-xs">Stroke Width</Label>
                  <Input
                    type="number"
                    value={properties.strokeWidth || 1}
                    onChange={(e) => updateElement(selectedElement.id, { properties: { ...properties, strokeWidth: parseInt(e.target.value) || 1 } })}
                  />
                </div>
              </>
            )}

            {/* Line/Divider */}
            {['line', 'divider'].includes(type) && (
              <>
                <div>
                  <Label className="text-xs">Color</Label>
                  <ColorPicker
                    value={properties.color || properties.borderColor || '#000000'}
                    onChange={(color) => updateElement(selectedElement.id, { properties: { ...properties, color, borderColor: color } })}
                    label="Line"
                  />
                </div>
                <div>
                  <Label className="text-xs">Thickness</Label>
                  <Input
                    type="number"
                    value={properties.borderWidth || properties.thickness || 1}
                    onChange={(e) => updateElement(selectedElement.id, { properties: { ...properties, borderWidth: parseInt(e.target.value) || 1, thickness: parseInt(e.target.value) || 1 } })}
                  />
                </div>
                <div>
                  <Label className="text-xs">Style</Label>
                  <Select
                    value={properties.lineStyle || properties.style || 'solid'}
                    onValueChange={(val) => updateElement(selectedElement.id, { properties: { ...properties, lineStyle: val, style: val } })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="solid">Solid</SelectItem>
                      <SelectItem value="dashed">Dashed</SelectItem>
                      <SelectItem value="dotted">Dotted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {/* Stamp */}
            {type === 'stamp' && (
              <>
                <div>
                  <Label className="text-xs">Stamp Text</Label>
                  <Input
                    value={properties.text || 'APPROVED'}
                    onChange={(e) => updateElement(selectedElement.id, { properties: { ...properties, text: e.target.value } })}
                  />
                </div>
                <div>
                  <Label className="text-xs">Color</Label>
                  <ColorPicker
                    value={properties.color || '#22C55E'}
                    onChange={(color) => updateElement(selectedElement.id, { properties: { ...properties, color } })}
                    label="Stamp"
                  />
                </div>
                <div>
                  <Label className="text-xs">Rotation</Label>
                  <Input
                    type="number"
                    value={properties.rotation || -15}
                    onChange={(e) => updateElement(selectedElement.id, { properties: { ...properties, rotation: parseInt(e.target.value) || 0 } })}
                  />
                </div>
              </>
            )}

            {/* Badge */}
            {type === 'badge' && (
              <>
                <div>
                  <Label className="text-xs">Badge Text</Label>
                  <Input
                    value={properties.text || 'New'}
                    onChange={(e) => updateElement(selectedElement.id, { properties: { ...properties, text: e.target.value } })}
                  />
                </div>
                <div>
                  <Label className="text-xs">Variant</Label>
                  <Select
                    value={properties.badgeVariant || 'default'}
                    onValueChange={(val) => updateElement(selectedElement.id, { properties: { ...properties, badgeVariant: val as any } })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="secondary">Secondary</SelectItem>
                      <SelectItem value="destructive">Destructive</SelectItem>
                      <SelectItem value="outline">Outline</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {/* Watermark */}
            {type === 'watermark' && (
              <>
                <div>
                  <Label className="text-xs">Watermark Text</Label>
                  <Input
                    value={properties.text || 'WATERMARK'}
                    onChange={(e) => updateElement(selectedElement.id, { properties: { ...properties, text: e.target.value } })}
                  />
                </div>
                <div>
                  <Label className="text-xs">Opacity</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={properties.opacity || 20}
                    onChange={(e) => updateElement(selectedElement.id, { properties: { ...properties, opacity: parseInt(e.target.value) || 20 } })}
                  />
                </div>
                <div>
                  <Label className="text-xs">Rotation</Label>
                  <Input
                    type="number"
                    value={properties.rotation || -45}
                    onChange={(e) => updateElement(selectedElement.id, { properties: { ...properties, rotation: parseInt(e.target.value) || -45 } })}
                  />
                </div>
              </>
            )}

            {/* Columns */}
            {type === 'columns' && (
              <>
                <div>
                  <Label className="text-xs">Column Count</Label>
                  <Input
                    type="number"
                    min={1}
                    max={6}
                    value={properties.columnCount || 2}
                    onChange={(e) => updateElement(selectedElement.id, { properties: { ...properties, columnCount: parseInt(e.target.value) || 2 } })}
                  />
                </div>
                <div>
                  <Label className="text-xs">Gap</Label>
                  <Input
                    type="number"
                    value={properties.gap || 16}
                    onChange={(e) => updateElement(selectedElement.id, { properties: { ...properties, gap: parseInt(e.target.value) || 16 } })}
                  />
                </div>
              </>
            )}

            {/* Container */}
            {type === 'container' && (
              <div>
                <Label className="text-xs">Padding</Label>
                <Input
                  type="number"
                  value={properties.padding || 16}
                  onChange={(e) => updateElement(selectedElement.id, { properties: { ...properties, padding: parseInt(e.target.value) || 16 } })}
                />
              </div>
            )}
          </CollapsibleSection>

          {/* Table specific */}
          {type === 'table' && (
            <CollapsibleSection id="table" title="Table Settings">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Columns</Label>
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    value={properties.columns || 3}
                    onChange={(e) => updateElement(selectedElement.id, { properties: { ...properties, columns: parseInt(e.target.value) || 3 } })}
                  />
                </div>
                <div>
                  <Label className="text-xs">Rows</Label>
                  <Input
                    type="number"
                    min={1}
                    max={20}
                    value={properties.rows || 4}
                    onChange={(e) => updateElement(selectedElement.id, { properties: { ...properties, rows: parseInt(e.target.value) || 4 } })}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={properties.headerRow || false}
                  onCheckedChange={(checked) => updateElement(selectedElement.id, { properties: { ...properties, headerRow: checked } })}
                />
                <Label className="text-xs">Header Row</Label>
              </div>
              {properties.headerRow && (
                <div>
                  <Label className="text-xs">Header Background</Label>
                  <ColorPicker
                    value={properties.headerBackgroundColor || '#f3f4f6'}
                    onChange={(color) => updateElement(selectedElement.id, { properties: { ...properties, headerBackgroundColor: color } })}
                    label="Header BG"
                    presets={BACKGROUND_PRESETS}
                  />
                </div>
              )}
              <div>
                <Label className="text-xs">Cell Padding</Label>
                <Input
                  type="number"
                  value={properties.cellPadding || 8}
                  onChange={(e) => updateElement(selectedElement.id, { properties: { ...properties, cellPadding: parseInt(e.target.value) || 8 } })}
                />
              </div>
            </CollapsibleSection>
          )}

          {/* List specific */}
          {type === 'list' && (
            <CollapsibleSection id="list" title="List Settings">
              <div>
                <Label className="text-xs">List Items (one per line)</Label>
                <Textarea
                  value={properties.listItems?.join('\n') || ''}
                  onChange={(e) => updateElement(selectedElement.id, { properties: { ...properties, listItems: e.target.value.split('\n').filter(Boolean) } })}
                  rows={5}
                />
              </div>
              <div>
                <Label className="text-xs">List Style</Label>
                <Select
                  value={properties.listStyle || 'bullet'}
                  onValueChange={(val) => updateElement(selectedElement.id, { properties: { ...properties, listStyle: val } })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bullet">Bullet</SelectItem>
                    <SelectItem value="numbered">Numbered</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CollapsibleSection>
          )}

          {/* Chart specific */}
          {type === 'chart' && (
            <CollapsibleSection id="chart" title="Chart Settings">
              <div>
                <Label className="text-xs">Chart Type</Label>
                <Select
                  value={properties.chartType || 'bar'}
                  onValueChange={(val) => updateElement(selectedElement.id, { properties: { ...properties, chartType: val as any } })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bar">Bar</SelectItem>
                    <SelectItem value="line">Line</SelectItem>
                    <SelectItem value="pie">Pie</SelectItem>
                    <SelectItem value="donut">Donut</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CollapsibleSection>
          )}

          {/* Style properties */}
          <CollapsibleSection id="style" title="Style">
            <div>
              <Label className="text-xs">Opacity: {style.opacity ?? 100}%</Label>
              <Slider
                value={[style.opacity ?? 100]}
                onValueChange={([val]) => updateElement(selectedElement.id, { style: { ...style, opacity: val } })}
                min={0}
                max={100}
                step={5}
              />
            </div>
            <div>
              <Label className="text-xs">Rotation: {style.rotation ?? 0}°</Label>
              <Slider
                value={[style.rotation ?? 0]}
                onValueChange={([val]) => updateElement(selectedElement.id, { style: { ...style, rotation: val } })}
                min={0}
                max={360}
                step={15}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={style.shadow || false}
                onCheckedChange={(checked) => updateElement(selectedElement.id, { style: { ...style, shadow: checked } })}
              />
              <Label className="text-xs">Drop Shadow</Label>
            </div>
          </CollapsibleSection>

          {/* Dynamic field mapping */}
          <CollapsibleSection id="dynamic" title="Dynamic Field">
            <div className="flex items-center gap-2">
              <Switch
                checked={properties.isDynamic || false}
                onCheckedChange={(checked) => updateElement(selectedElement.id, { properties: { ...properties, isDynamic: checked } })}
              />
              <Label className="text-xs">Map to data field</Label>
            </div>
            {properties.isDynamic && (
              <div>
                <Label className="text-xs">Field Name</Label>
                <Input
                  value={properties.fieldName || ''}
                  placeholder="e.g., client_name"
                  onChange={(e) => updateElement(selectedElement.id, { properties: { ...properties, fieldName: e.target.value } })}
                />
              </div>
            )}
          </CollapsibleSection>
        </div>
      </ScrollArea>
    );
  };

  // Render Data Form panel
  const renderDataFormPanel = () => {
    return (
      <ScrollArea className="h-full w-full">
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Form Data</h3>
            <Button size="sm" variant="outline" onClick={() => { clearFormData(); toast.success('Form data cleared'); }}>
              <Trash2 className="w-4 h-4 mr-1" />
              Clear All
            </Button>
          </div>

          {/* Quick Fill JSON */}
          <Card>
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm">Quick Fill (JSON)</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-0 space-y-2">
              <Textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder='{"field_name": "value", ...}'
                rows={3}
                className="font-mono text-xs"
              />
              <Button size="sm" onClick={handleJsonFill} className="w-full">
                Apply JSON
              </Button>
            </CardContent>
          </Card>

          {/* Dynamic Fields & Input Elements */}
          {formFields.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">Fields</h4>
              {formFields.map(field => (
                <div key={field.id} className="space-y-1">
                  <Label className="text-xs">{field.fieldName} ({field.type})</Label>
                  {['textfield', 'email', 'phone', 'url', 'password', 'number'].includes(field.type) && (
                    <Input
                      value={formData[field.fieldName] || ''}
                      onChange={(e) => updateFormData(field.fieldName, e.target.value)}
                      placeholder={`Enter ${field.fieldName}...`}
                    />
                  )}
                  {field.type === 'textarea' && (
                    <Textarea
                      value={formData[field.fieldName] || ''}
                      onChange={(e) => updateFormData(field.fieldName, e.target.value)}
                      placeholder={`Enter ${field.fieldName}...`}
                      rows={3}
                    />
                  )}
                  {field.type === 'currency' && (
                    <Input
                      type="number"
                      step="0.01"
                      value={formData[field.fieldName] || ''}
                      onChange={(e) => updateFormData(field.fieldName, parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                    />
                  )}
                  {['date', 'time', 'datetime'].includes(field.type) && (
                    <Input
                      type={field.type === 'datetime' ? 'datetime-local' : field.type}
                      value={formData[field.fieldName] || ''}
                      onChange={(e) => updateFormData(field.fieldName, e.target.value)}
                    />
                  )}
                  {field.type === 'checkbox' && (
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={formData[field.fieldName] || false}
                        onCheckedChange={(checked) => updateFormData(field.fieldName, checked)}
                      />
                      <span className="text-sm">{formData[field.fieldName] ? 'Checked' : 'Unchecked'}</span>
                    </div>
                  )}
                  {field.type === 'toggle' && (
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={formData[field.fieldName] || false}
                        onCheckedChange={(checked) => updateFormData(field.fieldName, checked)}
                      />
                      <span className="text-sm">{formData[field.fieldName] ? 'On' : 'Off'}</span>
                    </div>
                  )}
                  {field.type === 'dropdown' && (
                    <Select
                      value={formData[field.fieldName] || ''}
                      onValueChange={(val) => updateFormData(field.fieldName, val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        {(field.element.properties.options || []).map((opt: string, i: number) => (
                          <SelectItem key={i} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {field.type === 'rating' && (
                    <div className="flex items-center gap-1">
                      {Array.from({ length: field.element.properties.maxRating || 5 }).map((_, i) => (
                        <button
                          key={i}
                          onClick={() => updateFormData(field.fieldName, i + 1)}
                          className="p-1"
                        >
                          <Star
                            style={{
                              width: 20,
                              height: 20,
                              fill: (formData[field.fieldName] || 0) > i ? '#FFD700' : 'transparent',
                              color: (formData[field.fieldName] || 0) > i ? '#FFD700' : '#d1d5db'
                            }}
                          />
                        </button>
                      ))}
                    </div>
                  )}
                  {field.type === 'slider' && (
                    <div className="space-y-1">
                      <Slider
                        value={[formData[field.fieldName] || field.element.properties.value || 50]}
                        onValueChange={([val]) => updateFormData(field.fieldName, val)}
                        min={field.element.properties.minValue || 0}
                        max={field.element.properties.maxValue || 100}
                      />
                      <div className="text-xs text-muted-foreground text-center">{formData[field.fieldName] || field.element.properties.value || 50}</div>
                    </div>
                  )}
                  {['label', 'heading', 'paragraph', 'rich-text'].includes(field.type) && (
                    <Input
                      value={formData[field.fieldName] || ''}
                      onChange={(e) => updateFormData(field.fieldName, e.target.value)}
                      placeholder={`Enter ${field.fieldName}...`}
                    />
                  )}
                  {field.type === 'signature' && (
                    <Input
                      value={formData[field.fieldName] || ''}
                      onChange={(e) => updateFormData(field.fieldName, e.target.value)}
                      placeholder="Enter signature text..."
                    />
                  )}
                  {field.type === 'color-picker' && (
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={formData[field.fieldName] || field.element.properties.defaultColor || '#3B82F6'}
                        onChange={(e) => updateFormData(field.fieldName, e.target.value)}
                        className="w-10 h-9 p-1"
                      />
                      <Input
                        value={formData[field.fieldName] || ''}
                        onChange={(e) => updateFormData(field.fieldName, e.target.value)}
                        placeholder="#000000"
                        className="flex-1"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Table Data */}
          {tableElements.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">Table Data</h4>
              {tableElements.map(table => {
                const tableData = formData[table.properties.fieldName || table.id] || table.properties.tableData || [];
                const columns = table.properties.columns || 3;
                const rows = table.properties.rows || 4;
                
                return (
                  <Card key={table.id}>
                    <CardHeader className="py-3 px-4">
                      <CardTitle className="text-sm">{table.properties.name || table.properties.fieldName || 'Table'}</CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4 pt-0">
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <tbody>
                            {Array.from({ length: rows }).map((_, rowIndex) => (
                              <tr key={rowIndex}>
                                {Array.from({ length: columns }).map((_, colIndex) => (
                                  <td key={colIndex} className="border p-1">
                                    <input
                                      type="text"
                                      value={tableData[rowIndex]?.[colIndex] || ''}
                                      onChange={(e) => {
                                        const newData = [...tableData];
                                        if (!newData[rowIndex]) newData[rowIndex] = [];
                                        newData[rowIndex][colIndex] = e.target.value;
                                        updateFormData(table.properties.fieldName || table.id, newData);
                                      }}
                                      className="w-full px-2 py-1 text-sm border-0 focus:ring-1 focus:ring-blue-500 rounded"
                                      placeholder={table.properties.headerRow && rowIndex === 0 ? `Header ${colIndex + 1}` : ''}
                                    />
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {formFields.length === 0 && tableElements.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No dynamic fields or input elements</p>
              <p className="text-xs mt-1">Add elements and mark them as dynamic or add input elements</p>
            </div>
          )}
        </div>
      </ScrollArea>
    );
  };

  // Helper function to convert blob to base64
  const blobToBase64 = (blob: Blob): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

  // Export functions
  const exportAsPDF = async () => {
    try {
      // Dynamic import of html2pdf.js to avoid SSR issues
      const html2pdf = (await import('html2pdf.js')).default;

      const element = document.getElementById('pdf-preview');
      if (!element) {
        toast.error('Preview element not found');
        return;
      }

      const documentTitle = template.name || 'document';

      const options = {
        margin: [10, 10, 10, 10] as number[],
        filename: `${documentTitle}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true, 
          logging: false,
          onclone: (clonedDoc: Document, clonedElement: HTMLElement) => {
            // Fix lab()/oklab()/oklch() colors that aren't supported by html2canvas
            const allElements = clonedDoc.querySelectorAll('*');
            allElements.forEach((el) => {
              const htmlEl = el as HTMLElement;
              try {
                const computedStyle = clonedDoc.defaultView?.getComputedStyle(htmlEl);
                if (computedStyle) {
                  // List of color-related CSS properties to fix
                  const colorProps = [
                    'color', 'background-color', 'border-color', 
                    'border-top-color', 'border-bottom-color', 
                    'border-left-color', 'border-right-color',
                    'outline-color', 'text-decoration-color',
                    'column-rule-color', 'accent-color', 'caret-color'
                  ];
                  
                  colorProps.forEach((prop) => {
                    const value = computedStyle.getPropertyValue(prop);
                    if (value && (value.includes('lab(') || value.includes('oklab(') || value.includes('oklch('))) {
                      // Convert to a safe fallback by setting inline style
                      // For background, use white; for text, use black or dark gray
                      if (prop === 'background-color') {
                        htmlEl.style.setProperty(prop, '#ffffff', 'important');
                      } else if (prop === 'color') {
                        htmlEl.style.setProperty(prop, '#000000', 'important');
                      } else {
                        htmlEl.style.setProperty(prop, '#6b7280', 'important');
                      }
                    }
                  });
                }
              } catch {
                // Skip elements that can't be processed
              }
            });
          }
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
      };

      toast.info('Generating PDF...');

      // Generate PDF as blob
      const pdfBlob = await html2pdf()
        .set(options)
        .from(element)
        .outputPdf('blob');

      // Convert to base64
      const base64 = await blobToBase64(pdfBlob);

      // Save to downloads table
      try {
        const response = await fetch('/api/downloads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: documentTitle,
            fileSize: pdfBlob.size,
            pdfData: base64,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          if (response.status === 403) {
            toast.error(error.error || 'PDF limit reached for this month');
            return;
          }
          console.error('Failed to save download:', error);
        } else {
          toast.success('PDF saved to download history');
        }
      } catch (saveError) {
        console.error('Save error:', saveError);
        // Continue with download even if save fails
      }

      // Trigger the actual download
      html2pdf().set(options).from(element).save();
      toast.success('PDF exported successfully');
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error('Failed to export PDF');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const exportAsJSON = () => {
    const json = getTemplateJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${template.name.toLowerCase().replace(/\s+/g, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Template exported as JSON');
  };

  // Render left sidebar toolbox
  const renderToolbox = () => (
    <ScrollArea className="h-full">
      <div className="p-3 space-y-2">
        <h3 className="font-semibold text-sm px-1">Elements</h3>
        
        {ELEMENT_CATEGORIES.map(category => {
          const categoryElements = ELEMENT_TOOLBOX.filter(el => el.category === category.name);
          const isExpanded = expandedCategories.includes(category.name);
          const CategoryIcon = category.icon;
          
          return (
            <Collapsible
              key={category.name}
              open={isExpanded}
              onOpenChange={() => toggleCategory(category.name)}
            >
              <CollapsibleTrigger className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-2">
                  <CategoryIcon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{category.name}</span>
                  <Badge variant="secondary" className="text-xs">{categoryElements.length}</Badge>
                </div>
                <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="grid grid-cols-2 gap-1 p-1 pt-2">
                  {categoryElements.map(item => {
                    const ItemIcon = iconMap[item.icon] || Type;
                    return (
                      <div
                        key={item.type}
                        draggable
                        onDragStart={(e) => handleToolboxDragStart(e, item.type)}
                        className="flex flex-col items-center gap-1 p-2 rounded-lg border bg-card hover:bg-muted/50 hover:border-primary/50 cursor-grab active:cursor-grabbing transition-all"
                      >
                        <ItemIcon className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs text-center leading-tight">{item.label}</span>
                      </div>
                    );
                  })}
                </div>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </div>
    </ScrollArea>
  );

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top Toolbar */}
      <div className="border-b bg-card px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
          )}
          <Separator orientation="vertical" className="h-6" />
          <h2 className="font-semibold">{template.name}</h2>
          <Badge variant="outline">{template.category}</Badge>
        </div>
        
        <div className="flex items-center gap-1">
          {/* Zoom controls */}
          <div className="flex items-center gap-1 mr-2">
            <Button variant="ghost" size="icon" onClick={() => setZoom(zoom - 0.1)}>
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-sm w-12 text-center">{Math.round(zoom * 100)}%</span>
            <Button variant="ghost" size="icon" onClick={() => setZoom(zoom + 0.1)}>
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>
          
          <Separator orientation="vertical" className="h-6 mx-2" />
          
          {/* Grid controls */}
          <Button variant={showGrid ? 'default' : 'ghost'} size="icon" onClick={toggleGrid}>
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button variant={snapToGrid ? 'default' : 'ghost'} size="icon" onClick={toggleSnapToGrid}>
            {snapToGrid ? <LockIcon className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
          </Button>
          
          <Separator orientation="vertical" className="h-6 mx-2" />
          
          {/* History */}
          <Button variant="ghost" size="icon" onClick={undo}>
            <Undo2 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={redo}>
            <Redo2 className="w-4 h-4" />
          </Button>
          
          <Separator orientation="vertical" className="h-6 mx-2" />
          
          {/* Export */}
          <Button variant="outline" size="sm" onClick={exportAsJSON}>
            <Download className="w-4 h-4 mr-1" />
            JSON
          </Button>
          <Button size="sm" onClick={exportAsPDF}>
            <FileDown className="w-4 h-4 mr-1" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Element Toolbox */}
        <div className="w-56 border-r bg-card overflow-hidden">
          {renderToolbox()}
        </div>

        {/* Canvas Area */}
        <div className="flex-1 overflow-auto bg-muted/30 p-4">
          <div className="flex justify-center">
            <div
              ref={canvasRef}
              id="pdf-preview"
              onClick={handleCanvasClick}
              onDrop={handleCanvasDrop}
              onDragOver={handleCanvasDragOver}
              className="relative bg-white shadow-lg"
              style={{
                width: canvasWidth * zoom,
                height: canvasHeight * zoom,
                transform: `scale(${zoom})`,
                transformOrigin: 'top center',
              }}
            >
              {/* Grid */}
              {showGrid && (
                <div 
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundImage: `
                      linear-gradient(to right, #e5e7eb 1px, transparent 1px),
                      linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
                    `,
                    backgroundSize: `${gridSize}px ${gridSize}px`,
                  }}
                />
              )}
              
              {/* Elements */}
              {template.elements.map(element => renderElement(element))}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Properties & Data Form */}
        <div className="w-80 border-l bg-card overflow-hidden flex flex-col">
          <Tabs value={activeRightTab} onValueChange={setActiveRightTab} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-2 mx-4 mt-2">
              <TabsTrigger value="properties" className="text-xs">Properties</TabsTrigger>
              <TabsTrigger value="data" className="text-xs">Data Form</TabsTrigger>
            </TabsList>
            
            <TabsContent value="properties" className="flex-1 overflow-hidden m-0">
              {renderPropertiesPanel()}
            </TabsContent>
            
            <TabsContent value="data" className="flex-1 overflow-hidden m-0">
              {renderDataFormPanel()}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Preview - {template.name}</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center p-4 bg-muted/30 rounded-lg">
            <div
              ref={previewCanvasRef}
              className="relative bg-white shadow-lg"
              style={{
                width: canvasWidth,
                height: canvasHeight,
              }}
            >
              {template.elements.map(element => renderElement(element, true))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
