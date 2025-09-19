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
  const [maximizedPanel, setMaximizedPanel] = useState<number | null>(null);
  const [previousSizes, setPreviousSizes] = useState<{ columnWidth: number; rowHeight: number } | null>(null);
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
    if (maximizedPanel !== null) return; // Don't allow resizing when maximized
    isDraggingRef.current = type;
    document.body.style.cursor = type === 'column' ? 'col-resize' : 'row-resize';
    document.body.style.userSelect = 'none';
  }, [maximizedPanel]);

  const handleMaximize = useCallback((panelIndex: number) => {
    if (maximizedPanel === panelIndex) {
      // Restore
      if (previousSizes) {
        setColumnWidth(previousSizes.columnWidth);
        setRowHeight(previousSizes.rowHeight);
        setPreviousSizes(null);
      }
      setMaximizedPanel(null);
    } else {
      // Maximize
      setPreviousSizes({ columnWidth, rowHeight });
      setMaximizedPanel(panelIndex);

      // Set appropriate sizes based on which panel is maximized
      if (panelIndex === 0) {
        setColumnWidth(100);
        setRowHeight(100);
      } else if (panelIndex === 1) {
        setColumnWidth(0);
        setRowHeight(100);
      } else if (panelIndex === 2) {
        setColumnWidth(100);
        setRowHeight(0);
      } else if (panelIndex === 3) {
        setColumnWidth(0);
        setRowHeight(0);
      }
    }
  }, [maximizedPanel, columnWidth, rowHeight, previousSizes]);

  const handleDragStart = useCallback((e: React.DragEvent<HTMLDivElement>, index: number) => {
    if (!allowRearrange || maximizedPanel !== null) return;

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
  }, [allowRearrange, maximizedPanel]);

  const handleDragEnd = useCallback(() => {
    setDraggedItem(null);
    setDragOverItem(null);
    dragStartPosition.current = null;
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    if (!allowRearrange || maximizedPanel !== null) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, [allowRearrange, maximizedPanel]);

  const handleDragEnter = useCallback((_e: React.DragEvent<HTMLDivElement>, index: number) => {
    if (!allowRearrange || draggedItem === null || maximizedPanel !== null) return;
    setDragOverItem(index);
  }, [allowRearrange, draggedItem, maximizedPanel]);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    if (!allowRearrange || maximizedPanel !== null) return;

    // Only clear dragOverItem if we're leaving the grid cell entirely
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (!e.currentTarget.contains(relatedTarget)) {
      setDragOverItem(null);
    }
  }, [allowRearrange, maximizedPanel]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
    if (!allowRearrange || draggedItem === null || maximizedPanel !== null) return;
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
  }, [allowRearrange, draggedItem, layout, maximizedPanel]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDraggingRef.current || !containerRef.current || maximizedPanel !== null) return;

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
  }, [minSizes, maximizedPanel]);

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

  const renderGridCell = (index: number, position: string) => {
    const isMaximized = maximizedPanel === index;
    const isHidden = maximizedPanel !== null && maximizedPanel !== index;

    return (
      <div
        className={`grid-cell ${position} ${draggedItem === index ? 'dragging' : ''} ${dragOverItem === index ? 'drag-over' : ''} ${isHidden ? 'hidden' : ''} ${isMaximized ? 'maximized' : ''}`}
        draggable={allowRearrange && !maximizedPanel}
        onDragStart={(e) => handleDragStart(e, index)}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragEnter={(e) => handleDragEnter(e, index)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, index)}
        style={isHidden ? { display: 'none' } : {}}
      >
        <button
          className="maximize-button"
          onClick={() => handleMaximize(index)}
          title={isMaximized ? "Restore" : "Maximize"}
          aria-label={isMaximized ? "Restore panel" : "Maximize panel"}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            {isMaximized ? (
              // Close fullscreen icon
              <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>
            ) : (
              // Open in full icon
              <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
            )}
          </svg>
        </button>
        <div className="grid-cell-content">
          {children[layout[index]]}
        </div>
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className={`resizable-grid-container ${maximizedPanel !== null ? 'has-maximized' : ''}`}
      style={{
        gridTemplateColumns: maximizedPanel !== null
          ? '100%'
          : `${columnWidth}% ${100 - columnWidth}%`,
        gridTemplateRows: maximizedPanel !== null
          ? '100%'
          : `${rowHeight}% ${100 - rowHeight}%`,
      }}
    >
      {/* Render cells based on maximized state */}
      {maximizedPanel === null ? (
        <>
          {renderGridCell(0, 'top-left')}
          {renderGridCell(1, 'top-right')}
          {renderGridCell(2, 'bottom-left')}
          {renderGridCell(3, 'bottom-right')}

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
        </>
      ) : (
        renderGridCell(maximizedPanel, 'maximized')
      )}
    </div>
  );
};

export default ResizableGrid;