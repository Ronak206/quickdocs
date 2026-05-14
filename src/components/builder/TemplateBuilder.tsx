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
import { toast } from 'sonner';

// Icons
import {
  Type, TextCursor, AlignLeft, Hash, DollarSign, Calendar,
  CheckSquare, ChevronDown, PenTool, Image as ImageIcon, Building2,
  QrCode, Barcode, Table, Minus, Square, Plus, MinusCircle,
  ZoomIn, ZoomOut, Grid3X3, Undo2, Redo2, Download, Save,
  Trash2, Copy, Move, RotateCcw, Lock, Unlock, Eye, Settings
} from 'lucide-react';

// Icon mapping
const iconMap: Record<string, any> = {
  Type, TextCursor, AlignLeft, Hash, DollarSign, Calendar,
  CheckSquare, ChevronDown, PenTool, Image: ImageIcon, Building2,
  QrCode, Barcode, Table, Minus, Square,
};

// Convert mm to pixels (96 DPI)
const MM_TO_PX = 3.7795275591;

export default function TemplateBuilder() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [initialSize, setInitialSize] = useState<Size>({ width: 0, height: 0 });
  const [initialPos, setInitialPos] = useState<Position>({ x: 0, y: 0 });

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
        if (e.key === 'c' && !e.shiftKey) {
          // Copy would go here
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
    if (e.button !== 0) return; // Only left click
    
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

        // Calculate new size based on handle
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

  // Render element
  const renderElement = (element: TemplateElement) => {
    const isSelected = element.id === selectedElementId;
    const { type, position, size, properties } = element;

    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      left: position.x,
      top: position.y,
      width: size.width,
      height: size.height,
      cursor: isDragging ? 'grabbing' : 'move',
      userSelect: 'none',
      boxSizing: 'border-box',
      zIndex: element.style.zIndex || 0,
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
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
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
                backgroundColor: '#fafafa',
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
                backgroundColor: '#f9fafb',
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
                          border: '1px solid #d1d5db',
                          padding: properties.cellPadding || 8,
                          backgroundColor: properties.headerRow && rowIndex === 0 ? '#f3f4f6' : 'white',
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
                backgroundColor: '#f9fafb',
              }}
            >
              <QrCode className="w-8 h-8 text-gray-400" />
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
                backgroundColor: '#f9fafb',
                fontSize: 10,
                fontFamily: 'monospace',
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
        onMouseDown={(e) => handleElementMouseDown(e, element)}
        className={`transition-shadow ${isSelected ? 'ring-2 ring-blue-500 ring-offset-1' : 'hover:ring-1 hover:ring-blue-300'}`}
      >
        {elementContent()}
        
        {/* Resize handles */}
        {isSelected && (
          <>
            {/* Corner handles */}
            <div onMouseDown={(e) => handleResizeStart(e, 'nw')} className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-blue-500 rounded-sm cursor-nw-resize" />
            <div onMouseDown={(e) => handleResizeStart(e, 'ne')} className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-blue-500 rounded-sm cursor-ne-resize" />
            <div onMouseDown={(e) => handleResizeStart(e, 'sw')} className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-blue-500 rounded-sm cursor-sw-resize" />
            <div onMouseDown={(e) => handleResizeStart(e, 'se')} className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-blue-500 rounded-sm cursor-se-resize" />
            
            {/* Side handles */}
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

    const { type, properties } = selectedElement;

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
                  <Label className="text-xs">Color</Label>
                  <Input
                    type="color"
                    value={properties.color || '#000000'}
                    onChange={(e) => updateElement(selectedElement.id, { properties: { ...properties, color: e.target.value } })}
                    className="h-9"
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

          {/* Border properties */}
          {['textfield', 'textarea', 'number', 'currency', 'date', 'dropdown', 'rectangle', 'signature'].includes(type) && (
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
                  <Label className="text-xs">Color</Label>
                  <Input
                    type="color"
                    value={properties.borderColor || '#d1d5db'}
                    onChange={(e) => updateElement(selectedElement.id, { properties: { ...properties, borderColor: e.target.value } })}
                    className="h-9"
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

          {/* Table specific */}
          {type === 'table' && (
            <div className="space-y-3">
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
            <Button size="sm" onClick={() => {
              const json = getTemplateJson();
              console.log(json);
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
            {template.elements.map(renderElement)}
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
    </div>
  );
}
