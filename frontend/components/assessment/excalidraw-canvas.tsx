"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { drawingApi } from "@/lib/drawing-api";
import { cn } from "@/lib/utils";

// Import CSS
import "@excalidraw/excalidraw/index.css";

// Dynamically import Excalidraw (client-side only)
const Excalidraw = dynamic(
  async () => (await import("@excalidraw/excalidraw")).Excalidraw,
  { ssr: false }
);

// Type definitions for Excalidraw (using any to avoid strict type issues)
type ExcalidrawImperativeAPI = any;
type ExcalidrawElements = readonly any[];
type AppState = any;
type BinaryFiles = any;

interface ExcalidrawCanvasProps {
  sessionId: number;
  className?: string;
}

export function ExcalidrawCanvas({
  sessionId,
  className,
}: ExcalidrawCanvasProps) {
  const [excalidrawAPI, setExcalidrawAPI] =
    useState<ExcalidrawImperativeAPI | null>(null);
  const [excalidrawData, setExcalidrawData] = useState<{
    elements: ExcalidrawElements;
    appState: AppState;
    files: BinaryFiles;
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const hasLoadedRef = useRef(false);
  const isLoadingRef = useRef(false);
  const excalidrawAPIRef = useRef<ExcalidrawImperativeAPI | null>(null);

  // Reset load flag when session changes
  useEffect(() => {
    hasLoadedRef.current = false;
    isLoadingRef.current = false;
  }, [sessionId]);

  // Load existing drawing on mount (only once)
  useEffect(() => {
    const loadDrawing = async () => {
      if (hasLoadedRef.current || isLoadingRef.current || !excalidrawAPI) {
        return;
      }

      isLoadingRef.current = true;
      try {
        const drawing = await drawingApi.getDrawing(sessionId);
        if (drawing && excalidrawAPI && !hasLoadedRef.current) {
          const drawingData = {
            elements: drawing.drawing_json.elements || [],
            appState: drawing.drawing_json.appState || {},
            files: drawing.drawing_json.files || {},
          };

          // Update scene without triggering onChange
          excalidrawAPI.updateScene(drawingData);
          setExcalidrawData(drawingData);
          hasLoadedRef.current = true;
        }
      } catch (error) {
        console.error("Failed to load drawing:", error);
        hasLoadedRef.current = true; // Mark as loaded even on error to prevent retries
      } finally {
        isLoadingRef.current = false;
      }
    };

    loadDrawing();
  }, [sessionId, excalidrawAPI]);

  const handleSave = async () => {
    if (!excalidrawData) return;

    setIsSaving(true);
    try {
      await drawingApi.saveDrawing(sessionId, {
        drawing_json: excalidrawData,
        title: "System Design Diagram",
        version: "1.0.0",
      });
      setHasChanges(false);
    } catch (error) {
      console.error("Failed to save drawing:", error);
      alert("Failed to save drawing. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = useCallback(
    (elements: ExcalidrawElements, appState: AppState, files: BinaryFiles) => {
      // Only update if we've finished loading to prevent loops
      if (hasLoadedRef.current) {
        setExcalidrawData({ elements, appState, files });
        setHasChanges(true);
      }
    },
    []
  );

  const handleExcalidrawAPI = useCallback((api: ExcalidrawImperativeAPI) => {
    // Only set API if it's different to prevent unnecessary re-renders
    if (api && api !== excalidrawAPIRef.current) {
      excalidrawAPIRef.current = api;
      setExcalidrawAPI(api);
    }
  }, []);

  return (
    <div
      className={cn(
        "flex flex-col h-full border rounded-lg overflow-hidden bg-background",
        className
      )}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between p-2 border-b bg-muted/40">
        <div className="text-sm font-medium">System Design Canvas</div>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={isSaving || !hasChanges}
          className="h-8"
        >
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? "Saving..." : "Save"}
        </Button>
      </div>

      {/* Excalidraw Canvas */}
      <div className="flex-1 min-h-0">
        <Excalidraw
          excalidrawAPI={handleExcalidrawAPI}
          onChange={handleChange}
          UIOptions={{
            canvasActions: {
              saveToActiveFile: false,
              loadScene: false,
              export: false,
            },
          }}
        />
      </div>
    </div>
  );
}
