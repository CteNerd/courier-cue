import React, { useRef, useEffect, useState } from 'react';

interface Point {
  x: number;
  y: number;
}

interface SignatureCaptureProps {
  onSignatureChange: (signature: { strokes: Point[][]; isEmpty: boolean }) => void;
  width?: number;
  height?: number;
  strokeColor?: string;
  strokeWidth?: number;
}

const SignatureCapture: React.FC<SignatureCaptureProps> = ({
  onSignatureChange,
  width = 400,
  height = 200,
  strokeColor = '#000000',
  strokeWidth = 2
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokes, setStrokes] = useState<Point[][]>([]);
  const [currentStroke, setCurrentStroke] = useState<Point[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set up canvas
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw all strokes
    strokes.forEach(stroke => {
      if (stroke.length > 1) {
        ctx.beginPath();
        ctx.moveTo(stroke[0].x, stroke[0].y);
        stroke.forEach(point => {
          ctx.lineTo(point.x, point.y);
        });
        ctx.stroke();
      }
    });

    // Draw current stroke
    if (currentStroke.length > 1) {
      ctx.beginPath();
      ctx.moveTo(currentStroke[0].x, currentStroke[0].y);
      currentStroke.forEach(point => {
        ctx.lineTo(point.x, point.y);
      });
      ctx.stroke();
    }
  }, [strokes, currentStroke, width, height, strokeColor, strokeWidth]);

  useEffect(() => {
    const isEmpty = strokes.length === 0 && currentStroke.length === 0;
    onSignatureChange({ strokes: [...strokes, ...(currentStroke.length > 0 ? [currentStroke] : [])], isEmpty });
  }, [strokes, currentStroke, onSignatureChange]);

  const getPointFromEvent = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX: number, clientY: number;

    if ('touches' in event) {
      // Touch event
      const touch = event.touches[0] || event.changedTouches[0];
      clientX = touch.clientX;
      clientY = touch.clientY;
    } else {
      // Mouse event
      clientX = event.clientX;
      clientY = event.clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    setIsDrawing(true);
    const point = getPointFromEvent(event);
    setCurrentStroke([point]);
  };

  const draw = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    if (!isDrawing) return;

    const point = getPointFromEvent(event);
    setCurrentStroke(prev => [...prev, point]);
  };

  const stopDrawing = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    if (!isDrawing) return;

    setIsDrawing(false);
    if (currentStroke.length > 0) {
      setStrokes(prev => [...prev, currentStroke]);
      setCurrentStroke([]);
    }
  };

  const clearSignature = () => {
    setStrokes([]);
    setCurrentStroke([]);
    setIsDrawing(false);
  };

  return (
    <div className="signature-capture">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{
          border: '2px solid #ccc',
          borderRadius: '4px',
          cursor: 'crosshair',
          touchAction: 'none'
        }}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />
      <div style={{ marginTop: '10px' }}>
        <button
          type="button"
          onClick={clearSignature}
          style={{
            padding: '8px 16px',
            backgroundColor: '#f3f4f6',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Clear Signature
        </button>
      </div>
    </div>
  );
};

export default SignatureCapture;