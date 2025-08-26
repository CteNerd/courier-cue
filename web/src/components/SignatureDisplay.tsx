import React, { useRef, useEffect } from 'react';

interface Point {
  x: number;
  y: number;
}

interface SignatureDisplayProps {
  signature: {
    strokes: Point[][];
    timestamp?: string;
    recipientName?: string;
  };
  width?: number;
  height?: number;
  strokeColor?: string;
  strokeWidth?: number;
  showMetadata?: boolean;
}

const SignatureDisplay: React.FC<SignatureDisplayProps> = ({
  signature,
  width = 400,
  height = 200,
  strokeColor = '#000000',
  strokeWidth = 2,
  showMetadata = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
    signature.strokes.forEach(stroke => {
      if (stroke.length > 1) {
        ctx.beginPath();
        ctx.moveTo(stroke[0].x, stroke[0].y);
        stroke.forEach(point => {
          ctx.lineTo(point.x, point.y);
        });
        ctx.stroke();
      }
    });
  }, [signature, width, height, strokeColor, strokeWidth]);

  const isEmpty = !signature.strokes || signature.strokes.length === 0;

  return (
    <div className="signature-display">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{
          border: '2px solid #e5e7eb',
          borderRadius: '4px',
          backgroundColor: isEmpty ? '#f9fafb' : 'white'
        }}
      />
      {isEmpty && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#6b7280',
            fontSize: '14px',
            pointerEvents: 'none'
          }}
        >
          No signature
        </div>
      )}
      {showMetadata && !isEmpty && (
        <div style={{ marginTop: '8px', fontSize: '12px', color: '#6b7280' }}>
          {signature.recipientName && (
            <div><strong>Signed by:</strong> {signature.recipientName}</div>
          )}
          {signature.timestamp && (
            <div><strong>Signed at:</strong> {new Date(signature.timestamp).toLocaleString()}</div>
          )}
        </div>
      )}
    </div>
  );
};

export default SignatureDisplay;