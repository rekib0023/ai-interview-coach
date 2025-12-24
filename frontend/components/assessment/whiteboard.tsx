"use client";

import { ReactSketchCanvas, type ReactSketchCanvasRef } from "react-sketch-canvas";
import { Button } from "@/components/ui/button";
import {
    Eraser,
    Undo,
    Redo,
    Trash2,
    Pen,
    Download
} from "lucide-react";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface WhiteboardProps {
    className?: string;
}

export function Whiteboard({ className }: WhiteboardProps) {
    const canvasRef = useRef<ReactSketchCanvasRef>(null);
    const [tool, setTool] = useState<"pen" | "eraser">("pen");
    const [strokeColor, setStrokeColor] = useState("#000000");

    const handleClear = () => {
        canvasRef.current?.clearCanvas();
    };

    const handleUndo = () => {
        canvasRef.current?.undo();
    };

    const handleRedo = () => {
        canvasRef.current?.redo();
    };

    const handleExport = async () => {
        try {
            const dataUrl = await canvasRef.current?.exportImage("png");
            if (dataUrl) {
                const link = document.createElement("a");
                link.href = dataUrl;
                link.download = "diagram.png";
                link.click();
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className={cn("flex flex-col h-full border rounded-lg overflow-hidden bg-background", className)}>
            {/* Toolbar */}
            <div className="flex items-center justify-between p-2 border-b bg-muted/40">
                <div className="flex items-center gap-1">
                    <Button
                        variant={tool === "pen" ? "secondary" : "ghost"}
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                            setTool("pen");
                            canvasRef.current?.eraseMode(false);
                        }}
                    >
                        <Pen className="w-4 h-4" />
                    </Button>
                    <Button
                        variant={tool === "eraser" ? "secondary" : "ghost"}
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                            setTool("eraser");
                            canvasRef.current?.eraseMode(true);
                        }}
                    >
                        <Eraser className="w-4 h-4" />
                    </Button>
                    <div className="w-px h-6 bg-border mx-1" />
                    <input
                        type="color"
                        value={strokeColor}
                        onChange={(e) => {
                            setStrokeColor(e.target.value);
                            // If we change color, auto-switch to pen
                            setTool("pen");
                            canvasRef.current?.eraseMode(false);
                        }}
                        className="w-8 h-8 p-0 border-0 rounded cursor-pointer"
                        title="Stroke Color"
                    />
                </div>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleUndo} title="Undo">
                        <Undo className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleRedo} title="Redo">
                        <Redo className="w-4 h-4" />
                    </Button>
                    <div className="w-px h-6 bg-border mx-1" />
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={handleClear} title="Clear">
                        <Trash2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleExport} title="Save as PNG">
                        <Download className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Canvas */}
            <div className="flex-1 h-full w-full bg-white cursor-crosshair">
                 {/* Note: Canvas is usually white for sketching */}
                <ReactSketchCanvas
                    ref={canvasRef}
                    strokeWidth={4}
                    strokeColor={strokeColor}
                    canvasColor="transparent"
                    style={{ border: "none" }}
                />
            </div>
        </div>
    );
}
