"use client";

import React, { useState, useEffect } from "react";
import { GripVertical, RotateCcw, Sparkles, Check, Move } from "lucide-react";

export interface DashboardWidget {
  id: string;
  title: string;
  category?: string;
  colSpanClass?: string; // e.g., "col-12 col-xl-8", "col-12 col-xl-4"
  component: React.ReactNode;
}

interface DraggableDashboardGridProps {
  widgets: DashboardWidget[];
  storageKey: string;
  className?: string;
}

export default function DraggableDashboardGrid({
  widgets: initialWidgets,
  storageKey,
  className = "",
}: DraggableDashboardGridProps) {
  const [widgets, setWidgets] = useState<DashboardWidget[]>(initialWidgets);
  const [draggedWidgetId, setDraggedWidgetId] = useState<string | null>(null);
  const [dragOverWidgetId, setDragOverWidgetId] = useState<string | null>(null);
  const [isReorderMode, setIsReorderMode] = useState<boolean>(false);
  const [justSaved, setJustSaved] = useState<boolean>(false);

  // Load saved order from localStorage on mount
  useEffect(() => {
    try {
      const savedOrder = localStorage.getItem(storageKey);
      if (savedOrder) {
        const orderIds: string[] = JSON.parse(savedOrder);
        const ordered: DashboardWidget[] = [];
        // Map stored IDs
        orderIds.forEach((id) => {
          const found = initialWidgets.find((w) => w.id === id);
          if (found) ordered.push(found);
        });
        // Append any new widgets not present in saved order
        initialWidgets.forEach((w) => {
          if (!ordered.some((item) => item.id === w.id)) {
            ordered.push(w);
          }
        });
        if (ordered.length > 0) {
          setWidgets(ordered);
        }
      }
    } catch {
      // Ignore localStorage read errors
    }
  }, [initialWidgets, storageKey]);

  // Handle Drag Start
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedWidgetId(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
  };

  // Handle Drag Over
  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (draggedWidgetId && draggedWidgetId !== id) {
      setDragOverWidgetId(id);
    }
  };

  // Handle Drag Leave
  const handleDragLeave = () => {
    setDragOverWidgetId(null);
  };

  // Handle Drop and Reorder
  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    setDragOverWidgetId(null);
    if (!draggedWidgetId || draggedWidgetId === targetId) return;

    const currentList = [...widgets];
    const sourceIdx = currentList.findIndex((w) => w.id === draggedWidgetId);
    const targetIdx = currentList.findIndex((w) => w.id === targetId);

    if (sourceIdx !== -1 && targetIdx !== -1) {
      const [removed] = currentList.splice(sourceIdx, 1);
      currentList.splice(targetIdx, 0, removed);
      setWidgets(currentList);

      // Persist to localStorage
      try {
        const orderIds = currentList.map((w) => w.id);
        localStorage.setItem(storageKey, JSON.stringify(orderIds));
        setJustSaved(true);
        setTimeout(() => setJustSaved(false), 2000);
      } catch {
        // Ignore
      }
    }
    setDraggedWidgetId(null);
  };

  const handleDragEnd = () => {
    setDraggedWidgetId(null);
    setDragOverWidgetId(null);
  };

  // Reset to default ordering
  const handleResetLayout = () => {
    try {
      localStorage.removeItem(storageKey);
      setWidgets(initialWidgets);
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 1500);
    } catch {
      // Ignore
    }
  };

  return (
    <div className={`dashboard-draggable-container ${className}`}>
      {/* Top Reorder / Customization Action Bar */}
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3 px-1">
        <div className="d-flex align-items-center gap-2">
          <span className="badge bg-purple-50 text-purple-700 border border-purple-200/80 rounded-pill d-inline-flex align-items-center gap-1.5 px-3 py-1 font-bold text-xs shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>Customizable Workspace</span>
          </span>
          {isReorderMode && (
            <span className="text-muted text-xs d-none d-sm-inline">
              Drag items by the grip handle to reposition graphs &amp; metrics.
            </span>
          )}
        </div>

        <div className="d-flex align-items-center gap-2">
          {justSaved && (
            <span className="text-success font-bold text-xs d-flex align-items-center gap-1 animate-in fade-in">
              <Check className="w-3.5 h-3.5" />
              <span>Layout Saved</span>
            </span>
          )}

          <button
            type="button"
            onClick={() => setIsReorderMode(!isReorderMode)}
            className={`btn btn-sm ${
              isReorderMode ? "btn-primary shadow-sm" : "btn-white border shadow-2xs text-muted"
            } d-inline-flex align-items-center gap-1.5 rounded-pill px-3 py-1 text-xs font-semibold transfer-btn`}
          >
            <Move className="w-3 h-3" />
            <span>{isReorderMode ? "Finish Arranging" : "Rearrange Dashboard"}</span>
          </button>

          <button
            type="button"
            onClick={handleResetLayout}
            title="Reset to default layout"
            className="btn btn-sm btn-white border shadow-2xs text-muted d-inline-flex align-items-center gap-1 rounded-pill px-2.5 py-1 text-xs hover:text-dark"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="d-none d-md-inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Grid of Moveable Widgets */}
      <div className="row g-4">
        {widgets.map((widget) => {
          const isDraggingThis = draggedWidgetId === widget.id;
          const isOverThis = dragOverWidgetId === widget.id;

          return (
            <div
              key={widget.id}
              className={`${widget.colSpanClass || "col-12 col-lg-6"} position-relative`}
              onDragOver={(e) => handleDragOver(e, widget.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, widget.id)}
            >
              {/* Dropzone Highlight Indicator */}
              {isOverThis && (
                <div className="draggable-dropzone-indicator mb-3 p-4 text-center">
                  <span className="text-purple-700 font-bold text-xs d-flex align-items-center justify-content-center gap-1.5">
                    <Move className="w-4 h-4 text-purple-600 animate-bounce" />
                    <span>Drop to place "{widget.title}" here</span>
                  </span>
                </div>
              )}

              {/* Widget Card Container */}
              <div
                draggable={isReorderMode}
                onDragStart={(e) => handleDragStart(e, widget.id)}
                onDragEnd={handleDragEnd}
                className={`draggable-widget h-100 position-relative ${
                  isDraggingThis ? "is-dragging" : ""
                } ${isReorderMode ? "border border-2 border-purple-200 shadow-sm rounded-4" : ""}`}
              >
                {/* Visual Grip Handle when in Reorder Mode or on Hover */}
                {isReorderMode && (
                  <div className="position-absolute top-0 end-0 m-2 z-3 d-flex align-items-center gap-1.5 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-pill border border-purple-200 shadow-sm">
                    <GripVertical className="w-4 h-4 text-purple-600 draggable-widget-handle" />
                    <span className="text-[11px] font-bold text-purple-900 user-select-none">
                      Hold to Drag
                    </span>
                  </div>
                )}

                {/* Render the component */}
                {widget.component}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
