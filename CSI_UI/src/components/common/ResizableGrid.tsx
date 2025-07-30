import React, { useState, useRef, useEffect, useCallback } from 'react';
import './ResizableGrid.css';

interface ResizableGridProps {
  children: React.ReactNode[];
  initialSizes?: {
    columnWidth: number; // percentage
    rowHeight: number; // percentage
  };
  minSizes?: {
    columnWidth: number; // pixels
    rowHeight: number; // pixels
  };
  onSizeChange?: (sizes: { columnWidth: number; rowHeight: number }) => void;
  allowRearrange?: boolean;
  onLayoutChange?: (layout: number[]) => void;
}

const ResizableGrid: React.FC<ResizableGridProps> = ({
  children,
  initialSizes = { columnWidth: 30, rowHeight: 50 },
  minSizes = { columnWidth: 200, rowHeight: 200 },
  onSizeChange,
  allowRearrange = true,
  onLayoutChange,
}) => {
  const [columnWidth, setColumnWidth] = useState(initialSizes.columnWidth);
  const [rowHeight, setRowHeight] = useState(initialSizes.rowHeight);
  const [layout, setLayout] = useState<number[]>([0, 1, 2, 3]);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [dragOverItem, setDragOverItem] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef<'column' | 'row' | null>(null);
  const dragStartPosition = useRef<{ x: number; y: number } | null>(null);

  // Load saved sizes and layout from localStorage
  useEffect(() => {
    const savedSizes = localStorage.getItem('resizable-grid-sizes');
    if (savedSizes) {
      try {
        const parsed = JSON.parse(savedSizes);
        setColumnWidth(parsed.columnWidth);
        setRowHeight(parsed.rowHeight);
      } catch (error) {
        console.error('Failed to parse saved grid sizes', error);
      }
    }
    
    const savedLayout = localStorage.getItem('resizable-grid-layout');
    if (savedLayout) {
      try {
        const parsed = JSON.parse(savedLayout);
        setLayout(parsed);
      } catch (error) {
        console.error('Failed to parse saved grid layout', error);
      }
    }
  }, []);

  // Save sizes to localStorage
  useEffect(() => {
    const sizes = { columnWidth, rowHeight };
    localStorage.setItem('resizable-grid-sizes', JSON.stringify(sizes));
    onSizeChange?.(sizes);
  }, [columnWidth, rowHeight, onSizeChange]);
  
  // Save layout to localStorage
  useEffect(() => {
    localStorage.setItem('resizable-grid-layout', JSON.stringify(layout));
    onLayoutChange?.(layout);
  }, [layout, onLayoutChange]);

  const handleMouseDown = useCallback((type: 'column' | 'row') => {
    isDraggingRef.current = type;
    document.body.style.cursor = type === 'column' ? 'col-resize' : 'row-resize';
    document.body.style.userSelect = 'none';
  }, []);
  
  const handleDragStart = useCallback((e: React.DragEvent<HTMLDivElement>, index: number) => {
    if (!allowRearrange) return;
    
    setDraggedItem(index);
    dragStartPosition.current = { x: e.clientX, y: e.clientY };
    e.dataTransfer.effectAllowed = 'move';
    
    // Add a custom drag image
    const dragImage = e.currentTarget.cloneNode(true) as HTMLElement;
    dragImage.style.opacity = '0.8';
    dragImage.style.position = 'absolute';
    dragImage.style.top = '-1000px';
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    setTimeout(() => document.body.removeChild(dragImage), 0);
  }, [allowRearrange]);
  
  const handleDragEnd = useCallback(() => {
    setDraggedItem(null);
    setDragOverItem(null);
    dragStartPosition.current = null;
  }, []);
  
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    if (!allowRearrange) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, [allowRearrange]);
  
  const handleDragEnter = useCallback((_e: React.DragEvent<HTMLDivElement>, index: number) => {
    if (!allowRearrange || draggedItem === null) return;
    setDragOverItem(index);
  }, [allowRearrange, draggedItem]);
  
  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    if (!allowRearrange) return;
    
    // Only clear dragOverItem if we're leaving the grid cell entirely
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (!e.currentTarget.contains(relatedTarget)) {
      setDragOverItem(null);
    }
  }, [allowRearrange]);
  
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
    if (!allowRearrange || draggedItem === null) return;
    e.preventDefault();
    
    if (draggedItem !== dropIndex) {
      const newLayout = [...layout];
      const draggedValue = newLayout[draggedItem];
      const dropValue = newLayout[dropIndex];
      
      // Swap positions
      newLayout[draggedItem] = dropValue;
      newLayout[dropIndex] = draggedValue;
      
      setLayout(newLayout);
    }
    
    setDraggedItem(null);
    setDragOverItem(null);
  }, [allowRearrange, draggedItem, layout]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDraggingRef.current || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    
    if (isDraggingRef.current === 'column') {
      const x = e.clientX - rect.left;
      const totalWidth = rect.width;
      const percentage = (x / totalWidth) * 100;
      const minPercentage = (minSizes.columnWidth / totalWidth) * 100;
      
      setColumnWidth(Math.max(minPercentage, Math.min(70, percentage)));
    } else if (isDraggingRef.current === 'row') {
      const y = e.clientY - rect.top;
      const totalHeight = rect.height;
      const percentage = (y / totalHeight) * 100;
      const minPercentage = (minSizes.rowHeight / totalHeight) * 100;
      
      setRowHeight(Math.max(minPercentage, Math.min(70, percentage)));
    }
  }, [minSizes]);

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = null;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  // Ensure we have exactly 4 children
  if (children.length !== 4) {
    console.error('ResizableGrid expects exactly 4 children');
    return null;
  }

  return (
    <div 
      ref={containerRef}
      className="resizable-grid-container"
      style={{
        gridTemplateColumns: `${columnWidth}% ${100 - columnWidth}%`,
        gridTemplateRows: `${rowHeight}% ${100 - rowHeight}%`,
      }}
    >
      {/* Top Left */}
      <div 
        className={`grid-cell top-left ${draggedItem === 0 ? 'dragging' : ''} ${dragOverItem === 0 ? 'drag-over' : ''}`}
        draggable={allowRearrange}
        onDragStart={(e) => handleDragStart(e, 0)}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragEnter={(e) => handleDragEnter(e, 0)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, 0)}
      >
        {children[layout[0]]}
      </div>
      
      {/* Top Right */}
      <div 
        className={`grid-cell top-right ${draggedItem === 1 ? 'dragging' : ''} ${dragOverItem === 1 ? 'drag-over' : ''}`}
        draggable={allowRearrange}
        onDragStart={(e) => handleDragStart(e, 1)}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragEnter={(e) => handleDragEnter(e, 1)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, 1)}
      >
        {children[layout[1]]}
      </div>
      
      {/* Bottom Left */}
      <div 
        className={`grid-cell bottom-left ${draggedItem === 2 ? 'dragging' : ''} ${dragOverItem === 2 ? 'drag-over' : ''}`}
        draggable={allowRearrange}
        onDragStart={(e) => handleDragStart(e, 2)}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragEnter={(e) => handleDragEnter(e, 2)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, 2)}
      >
        {children[layout[2]]}
      </div>
      
      {/* Bottom Right */}
      <div 
        className={`grid-cell bottom-right ${draggedItem === 3 ? 'dragging' : ''} ${dragOverItem === 3 ? 'drag-over' : ''}`}
        draggable={allowRearrange}
        onDragStart={(e) => handleDragStart(e, 3)}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragEnter={(e) => handleDragEnter(e, 3)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, 3)}
      >
        {children[layout[3]]}
      </div>
      
      {/* Column Resize Handle */}
      <div 
        className="resize-handle column-handle"
        style={{ left: `${columnWidth}%` }}
        onMouseDown={() => handleMouseDown('column')}
      >
        <div className="resize-handle-visual" />
      </div>
      
      {/* Row Resize Handle */}
      <div 
        className="resize-handle row-handle"
        style={{ top: `${rowHeight}%` }}
        onMouseDown={() => handleMouseDown('row')}
      >
        <div className="resize-handle-visual" />
      </div>
      
      {/* Center Resize Handle (intersection) */}
      <div 
        className="resize-handle center-handle"
        style={{ 
          left: `${columnWidth}%`,
          top: `${rowHeight}%`
        }}
      >
        <div className="resize-handle-center-visual" />
      </div>
    </div>
  );
};

export default ResizableGrid;