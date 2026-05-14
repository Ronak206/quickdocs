'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
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
import { toast } from 'sonner';

// Icons
import {
  Type, TextCursor, AlignLeft, Hash, DollarSign, Calendar,
  CheckSquare, ChevronDown, PenTool, Image as ImageIcon, Building2,
  QrCode, Barcode, Table, Minus, Square, Plus, MinusCircle,
  ZoomIn, ZoomOut, Grid3X3, Undo2, Redo2, Download, Save,
  Trash2, Copy, Move, RotateCcw, Lock, Unlock, Eye, Settings,
  Palette, FileText, X, ArrowLeft, Printer, FileDown
} from 'lucide-react';

// Icon mapping
const iconMap: Record<string, any> = {
  Type, TextCursor, AlignLeft, Hash, DollarSign, Calendar,
  CheckSquare, ChevronDown, PenTool, Image: ImageIcon, Building2,
  QrCode, Barcode, Table, Minus, Square,
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

export default function TemplateBuilder() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const previewCanvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [initialSize, setInitialSize] = useState<Size>({ width: 0, height: 0 });
  const [initialPos, setInitialPos] = useState<Position>({ x: 0, y: 0 });
  const [showPreview, setShowPreview] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'png' | 'json'>('pdf');

  const {
    template,
    selectedElementId,
    selectedElement,
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
    setZoom,
    toggleGrid,
    toggleSnapToGrid,
    undo,
    redo,
    saveToHistory,
    getTemplateJson,
    clearTemplate,
  } = useTemplateBuilderStore();

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
  }, [isDragging, isResizing, selectedElement, dragOffset, resizeHandle, initialSize, initialPos, zoom, snapPosition, updateElementPosition, updateElementSize, saveToHistory]);

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
          <span className="text-xs">{label}</span>
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

  // Render element
  const renderElement = (element: TemplateElement, forPreview = false) => {
    const isSelected = element.id === selectedElementId && !forPreview;
    const { type, position, size, properties, style } = element;

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
              }}
            >
              {properties.text || 'Label'}
            </div>
          );

        case 'textfield':
        case 'number':
        case 'currency':
        case 'date':
          return (
            <input
              type={type === 'number' ? 'number' : type === 'date' ? 'date' : 'text'}
              placeholder={properties.placeholder || 'Enter text...'}
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
              readOnly
            />
          );

        case 'textarea':
          return (
            <textarea
              placeholder={properties.placeholder || 'Enter description...'}
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
              readOnly
            />
          );

        case 'checkbox':
          return (
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: properties.color || '#000000' }}>
              <input type="checkbox" checked={properties.checked} readOnly />
              <span style={{ fontSize: 14 }}>{properties.label || 'Checkbox'}</span>
            </label>
          );

        case 'dropdown':
          return (
            <select
              style={{
                width: '100%',
                height: '100%',
                fontSize: 14,
                color: properties.color || '#000000',
                backgroundColor: properties.backgroundColor || '#ffffff',
                border: `${properties.borderWidth || 1}px solid ${properties.borderColor || '#d1d5db'}`,
                borderRadius: properties.borderRadius || 4,
                padding: '4px 8px',
                outline: 'none',
              }}
            >
              <option>{properties.placeholder || 'Select...'}</option>
              {properties.options?.map((opt: string, i: number) => (
                <option key={i}>{opt}</option>
              ))}
            </select>
          );

        case 'signature':
          return (
            <div
              style={{
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
              }}
            >
              Signature Area
            </div>
          );

        case 'image':
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
                color: '#9ca3af',
                fontSize: 12,
                backgroundColor: properties.backgroundColor || '#f9fafb',
                overflow: 'hidden',
              }}
            >
              {properties.src ? (
                <img src={properties.src} alt={properties.alt || ''} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: properties.fit || 'contain' }} />
              ) : (
                <ImageIcon className="w-8 h-8 text-gray-300" />
              )}
            </div>
          );

        case 'table':
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
                {Array.from({ length: Math.min(properties.rows || 4, 10) }).map((_, rowIndex) => (
                  <tr key={rowIndex}>
                    {Array.from({ length: Math.min(properties.columns || 3, 8) }).map((_, colIndex) => (
                      <td
                        key={colIndex}
                        style={{
                          border: `${properties.borderWidth || 1}px solid ${properties.borderColor || '#d1d5db'}`,
                          padding: properties.cellPadding || 8,
                          backgroundColor: properties.headerRow && rowIndex === 0 ? (properties.headerBackgroundColor || '#f3f4f6') : (properties.backgroundColor || 'white'),
                          color: properties.color || '#000000',
                          fontWeight: properties.headerRow && rowIndex === 0 ? 'bold' : 'normal',
                        }}
                      >
                        {properties.headerRow && rowIndex === 0 ? `Header ${colIndex + 1}` : ''}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          );

        case 'line':
          return (
            <div
              style={{
                width: '100%',
                height: properties.borderWidth || 2,
                backgroundColor: properties.borderColor || '#000000',
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
                backgroundColor: properties.backgroundColor || 'transparent',
                borderRadius: properties.borderRadius || 0,
              }}
            />
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
                backgroundColor: properties.backgroundColor || '#f9fafb',
              }}
            >
              <QrCode className="w-8 h-8 text-gray-400" style={{ color: properties.color || '#6B7280' }} />
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
                backgroundColor: properties.backgroundColor || '#f9fafb',
                fontSize: 10,
                fontFamily: 'monospace',
                color: properties.color || '#000000',
              }}
            >
              ||||||||||||||||
            </div>
          );

        default:
          return <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Element</div>;
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
      <ScrollArea className="h-full">
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold capitalize">{type.replace('-', ' ')}</h3>
            <div className="flex gap-1">
              <Button size="icon" variant="ghost" onClick={() => duplicateElement(selectedElement.id)}>
                <Copy className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="ghost" className="text-destructive" onClick={() => deleteElement(selectedElement.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <Separator />

          {/* Position & Size */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Position & Size</h4>
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
          </div>

          <Separator />

          {/* Text properties */}
          {['label', 'textfield', 'textarea', 'number', 'currency', 'date'].includes(type) && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">Text</h4>
              
              {type === 'label' && (
                <div>
                  <Label className="text-xs">Text</Label>
                  <Input
                    value={properties.text || ''}
                    onChange={(e) => updateElement(selectedElement.id, { properties: { ...properties, text: e.target.value } })}
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
            </div>
          )}

          {/* Background color for most elements */}
          {['label', 'textfield', 'textarea', 'number', 'currency', 'date', 'dropdown', 'rectangle', 'table', 'image', 'logo', 'signature', 'qr-code', 'barcode'].includes(type) && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">Background</h4>
              <ColorPicker
                value={properties.backgroundColor || 'transparent'}
                onChange={(color) => updateElement(selectedElement.id, { properties: { ...properties, backgroundColor: color } })}
                label="Background"
                presets={BACKGROUND_PRESETS}
              />
            </div>
          )}

          {/* Border properties */}
          {['textfield', 'textarea', 'number', 'currency', 'date', 'dropdown', 'rectangle', 'signature', 'image', 'logo', 'table'].includes(type) && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">Border</h4>
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
            </div>
          )}

          {/* Table specific */}
          {type === 'table' && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">Table Settings</h4>
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
            </div>
          )}

          {/* Style properties */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Style</h4>
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
          </div>

          {/* Placeholder */}
          {['textfield', 'textarea', 'number', 'currency', 'date', 'dropdown'].includes(type) && (
            <div>
              <Label className="text-xs">Placeholder</Label>
              <Input
                value={properties.placeholder || ''}
                onChange={(e) => updateElement(selectedElement.id, { properties: { ...properties, placeholder: e.target.value } })}
              />
            </div>
          )}

          {/* Checkbox specific */}
          {type === 'checkbox' && (
            <div className="space-y-3">
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
            </div>
          )}

          {/* Dynamic field mapping */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Dynamic Field</h4>
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
          </div>
        </div>
      </ScrollArea>
    );
  };

  // Export functions
  const exportAsPDF = async () => {
    try {
      // Create a simple HTML representation for printing
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error('Please allow popups to export PDF');
        return;
      }

      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${template.name}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              display: flex; 
              justify-content: center; 
              padding: 20px;
              background: #f0f0f0;
            }
            .page {
              width: ${template.pageSize.width}mm;
              height: ${template.pageSize.height}mm;
              background: white;
              position: relative;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            @media print {
              body { padding: 0; background: white; }
              .page { box-shadow: none; }
            }
          </style>
        </head>
        <body>
          <div class="page">
            ${template.elements.map(el => {
              const style = `
                position: absolute;
                left: ${pixelsToMm(el.position.x)}mm;
                top: ${pixelsToMm(el.position.y)}mm;
                width: ${pixelsToMm(el.size.width)}mm;
                height: ${pixelsToMm(el.size.height)}mm;
                opacity: ${(el.style.opacity ?? 100) / 100};
                transform: rotate(${el.style.rotation || 0}deg);
                z-index: ${el.style.zIndex || 0};
              `;
              
              let content = '';
              switch (el.type) {
                case 'label':
                  content = `<div style="font-size: ${el.properties.fontSize || 14}px; font-weight: ${el.properties.bold ? 'bold' : 'normal'}; color: ${el.properties.color || '#000'}; text-align: ${el.properties.textAlign || 'left'}; background: ${el.properties.backgroundColor || 'transparent'};">${el.properties.text || 'Label'}</div>`;
                  break;
                case 'textfield':
                case 'number':
                case 'currency':
                case 'date':
                  content = `<input type="text" placeholder="${el.properties.placeholder || ''}" style="width: 100%; height: 100%; border: ${el.properties.borderWidth || 1}px solid ${el.properties.borderColor || '#d1d5db'}; border-radius: ${el.properties.borderRadius || 4}px; padding: 4px 8px; font-size: ${el.properties.fontSize || 14}px; background: ${el.properties.backgroundColor || '#fff'};" />`;
                  break;
                case 'textarea':
                  content = `<textarea placeholder="${el.properties.placeholder || ''}" style="width: 100%; height: 100%; border: ${el.properties.borderWidth || 1}px solid ${el.properties.borderColor || '#d1d5db'}; border-radius: ${el.properties.borderRadius || 4}px; padding: 8px; font-size: ${el.properties.fontSize || 14}px; resize: none; background: ${el.properties.backgroundColor || '#fff'};"></textarea>`;
                  break;
                case 'line':
                  content = `<div style="width: 100%; height: ${el.properties.borderWidth || 2}px; background: ${el.properties.borderColor || '#000'};"></div>`;
                  break;
                case 'rectangle':
                  content = `<div style="width: 100%; height: 100%; border: ${el.properties.borderWidth || 1}px solid ${el.properties.borderColor || '#000'}; background: ${el.properties.backgroundColor || 'transparent'}; border-radius: ${el.properties.borderRadius || 0}px;"></div>`;
                  break;
                case 'table':
                  content = `<table style="width: 100%; height: 100%; border-collapse: collapse; font-size: 12px;">
                    ${Array.from({ length: el.properties.rows || 4 }).map((_, ri) => `
                      <tr>
                        ${Array.from({ length: el.properties.columns || 3 }).map((_, ci) => `
                          <td style="border: 1px solid ${el.properties.borderColor || '#d1d5db'}; padding: ${el.properties.cellPadding || 8}px; background: ${el.properties.headerRow && ri === 0 ? (el.properties.headerBackgroundColor || '#f3f4f6') : (el.properties.backgroundColor || 'white')}; font-weight: ${el.properties.headerRow && ri === 0 ? 'bold' : 'normal'};">
                            ${el.properties.headerRow && ri === 0 ? `Header ${ci + 1}` : ''}
                          </td>
                        `).join('')}
                      </tr>
                    `).join('')}
                  </table>`;
                  break;
                case 'signature':
                  content = `<div style="width: 100%; height: 100%; border: ${el.properties.borderWidth || 1}px dashed ${el.properties.borderColor || '#d1d5db'}; border-radius: ${el.properties.borderRadius || 4}px; display: flex; align-items: center; justify-content: center; color: #9ca3af; font-size: 12px; background: ${el.properties.backgroundColor || '#fafafa'};">Signature Area</div>`;
                  break;
                default:
                  content = `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">${el.type}</div>`;
              }
              
              return `<div style="${style}">${content}</div>`;
            }).join('')}
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.close();
              }, 250);
            };
          </script>
        </body>
        </html>
      `;

      printWindow.document.write(printContent);
      printWindow.document.close();
      toast.success('PDF export ready - use your browser\'s print dialog');
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error('Failed to export PDF');
    }
  };

  const exportAsJSON = () => {
    const json = getTemplateJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${template.name.replace(/\s+/g, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Template exported as JSON');
  };

  const handleExport = () => {
    if (exportFormat === 'json') {
      exportAsJSON();
    } else {
      exportAsPDF();
    }
    setShowExportDialog(false);
  };

  // Preview modal
  const renderPreviewModal = () => (
    <Dialog open={showPreview} onOpenChange={setShowPreview}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Template Preview: {template.name}
          </DialogTitle>
        </DialogHeader>
        <div className="flex justify-center p-4 bg-muted/50 rounded-lg">
          <div
            ref={previewCanvasRef}
            className="bg-white shadow-xl relative"
            style={{
              width: canvasWidth,
              height: canvasHeight,
              transform: 'scale(0.7)',
              transformOrigin: 'top center',
            }}
          >
            {template.elements.map((el) => renderElement(el, true))}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowPreview(false)}>
            Close
          </Button>
          <Button onClick={() => {
            setShowPreview(false);
            setShowExportDialog(true);
          }}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // Export dialog
  const renderExportDialog = () => (
    <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileDown className="w-5 h-5" />
            Export Template
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant={exportFormat === 'pdf' ? 'default' : 'outline'}
              className="flex flex-col gap-1 h-auto py-3"
              onClick={() => setExportFormat('pdf')}
            >
              <FileText className="w-6 h-6" />
              <span className="text-xs">PDF</span>
            </Button>
            <Button
              variant={exportFormat === 'png' ? 'default' : 'outline'}
              className="flex flex-col gap-1 h-auto py-3"
              onClick={() => setExportFormat('png')}
            >
              <ImageIcon className="w-6 h-6" />
              <span className="text-xs">PNG</span>
            </Button>
            <Button
              variant={exportFormat === 'json' ? 'default' : 'outline'}
              className="flex flex-col gap-1 h-auto py-3"
              onClick={() => setExportFormat('json')}
            >
              <Palette className="w-6 h-6" />
              <span className="text-xs">JSON</span>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            {exportFormat === 'pdf' && 'Export as PDF document for printing or sharing'}
            {exportFormat === 'png' && 'Export as PNG image (coming soon)'}
            {exportFormat === 'json' && 'Export as JSON template for import later'}
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowExportDialog(false)}>Cancel</Button>
          <Button onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="h-screen flex bg-background">
      {/* Left Sidebar - Toolbox */}
      <div className="w-64 border-r bg-muted/30 flex flex-col">
        <div className="p-4 border-b">
          <h2 className="font-semibold">Elements</h2>
          <p className="text-xs text-muted-foreground">Drag elements to canvas</p>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="p-3 space-y-4">
            {['Text', 'Input', 'Media', 'Layout'].map((category) => (
              <div key={category}>
                <h3 className="text-xs font-medium text-muted-foreground mb-2 px-1">{category}</h3>
                <div className="grid grid-cols-2 gap-1">
                  {ELEMENT_TOOLBOX.filter((el) => el.category === category).map((item) => {
                    const Icon = iconMap[item.icon] || Type;
                    return (
                      <div
                        key={item.type}
                        draggable
                        onDragStart={(e) => handleToolboxDragStart(e, item.type)}
                        className="flex flex-col items-center gap-1 p-2 rounded-md border border-transparent hover:border-border hover:bg-background cursor-grab active:cursor-grabbing transition-colors"
                      >
                        <Icon className="w-5 h-5 text-muted-foreground" />
                        <span className="text-xs">{item.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="border-b px-4 py-2 flex items-center justify-between bg-background">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={undo}>
              <Undo2 className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={redo}>
              <Redo2 className="w-4 h-4" />
            </Button>
            <Separator orientation="vertical" className="h-6 mx-2" />
            <Button variant="outline" size="sm" onClick={() => setZoom(zoom - 0.1)}>
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-sm w-16 text-center">{Math.round(zoom * 100)}%</span>
            <Button variant="outline" size="sm" onClick={() => setZoom(zoom + 0.1)}>
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Separator orientation="vertical" className="h-6 mx-2" />
            <Button
              variant={showGrid ? 'secondary' : 'outline'}
              size="sm"
              onClick={toggleGrid}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={snapToGrid ? 'secondary' : 'outline'}
              size="sm"
              onClick={toggleSnapToGrid}
            >
              {snapToGrid ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Input
              value={template.name}
              onChange={(e) => setTemplate({ name: e.target.value })}
              className="w-48 h-8"
              placeholder="Template name"
            />
            <Select
              value={template.pageSize.name}
              onValueChange={(val) => {
                const sizes: Record<string, any> = {
                  A4: { width: 210, height: 297, name: 'A4' },
                  A3: { width: 297, height: 420, name: 'A3' },
                  Letter: { width: 215.9, height: 279.4, name: 'Letter' },
                  Legal: { width: 215.9, height: 355.6, name: 'Legal' },
                };
                setTemplate({ pageSize: sizes[val] });
              }}
            >
              <SelectTrigger className="w-24 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A4">A4</SelectItem>
                <SelectItem value="A3">A3</SelectItem>
                <SelectItem value="Letter">Letter</SelectItem>
                <SelectItem value="Legal">Legal</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={clearTemplate}>
              Clear
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowPreview(true)}>
              <Eye className="w-4 h-4 mr-1" />
              Preview
            </Button>
            <Button size="sm" onClick={() => setShowExportDialog(true)}>
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
            <Button size="sm" onClick={() => {
              const json = getTemplateJson();
              console.log(json);
              localStorage.setItem('savedTemplate', json);
              toast.success('Template saved!');
            }}>
              <Save className="w-4 h-4 mr-1" />
              Save
            </Button>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 overflow-auto p-8 bg-muted/50 flex items-start justify-center">
          <div
            ref={canvasRef}
            className="bg-white shadow-xl relative"
            style={{
              width: canvasWidth * zoom,
              height: canvasHeight * zoom,
              transform: `scale(${zoom})`,
              transformOrigin: 'top center',
            }}
            onClick={handleCanvasClick}
            onDrop={handleCanvasDrop}
            onDragOver={handleCanvasDragOver}
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

            {/* Margins indicator */}
            <div
              className="absolute border-dashed border-2 border-blue-200 pointer-events-none"
              style={{
                top: template.margins.top * MM_TO_PX,
                left: template.margins.left * MM_TO_PX,
                right: template.margins.right * MM_TO_PX,
                bottom: template.margins.bottom * MM_TO_PX,
              }}
            />

            {/* Elements */}
            {template.elements.map((el) => renderElement(el))}
          </div>
        </div>

        {/* Status bar */}
        <div className="border-t px-4 py-1 text-xs text-muted-foreground flex items-center justify-between">
          <span>
            {template.elements.length} element{template.elements.length !== 1 ? 's' : ''} | 
            Page: {template.pageSize.name} ({template.pageSize.width}×{template.pageSize.height}mm)
          </span>
          <span>
            {selectedElement ? `Selected: ${selectedElement.type}` : 'No selection'}
          </span>
        </div>
      </div>

      {/* Right Sidebar - Properties */}
      <div className="w-72 border-l bg-muted/30 flex flex-col">
        <div className="p-4 border-b">
          <h2 className="font-semibold">Properties</h2>
        </div>
        <div className="flex-1 overflow-hidden">
          {renderPropertiesPanel()}
        </div>
      </div>

      {/* Modals */}
      {renderPreviewModal()}
      {renderExportDialog()}
    </div>
  );
}
