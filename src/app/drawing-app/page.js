"use client";

import { useRef, useState, useEffect } from 'react';
import ControlPopup from './modules/ControlPopup';
import ToolbarButton from './modules/ToolbarButton';

export default function DrawingApp() {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [bgColor, setBgColor] = useState('#ffffff'); // Added state for background color
  const [lineColor, setLineColor] = useState('#000000'); // Added state for line color
  const [lineWidth, setLineWidth] = useState(1); // Added state for line width
  const [lineSoftness, setLineSoftness] = useState(0); // Added state for line softness
  const [showBgColorControl, setShowBgColorControl] = useState(false);
  const [showLineColorControl, setShowLineColorControl] = useState(false);
  const [showLineWidthControl, setShowLineWidthControl] = useState(false);
  const [showLineSoftnessControl, setShowLineSoftnessControl] = useState(false); // Added state for line softness control

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
    }
  }, []);

  const toggleControl = (control) => {
    setShowBgColorControl(control === 'bgColor');
    setShowLineColorControl(control === 'lineColor');
    setShowLineWidthControl(control === 'lineWidth');
    setShowLineSoftnessControl(control === 'lineSoftness'); // Added toggle for line softness control
  };

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
      setIsDrawing(true);
    }
  };

  const draw = (e) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = lineColor;
      ctx.shadowBlur = lineSoftness; // Apply line softness
      ctx.shadowColor = lineColor; // Match shadow color to line color
      ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.closePath();
      ctx.globalAlpha = 1; // Reset alpha
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '20px', backgroundColor: '#fff9e6' }}>

      {/* Background Color Control Popup */}
      {showBgColorControl && (
        <ControlPopup
          title="Background Color"
          value={bgColor}
          onChange={(e) => setBgColor(e.target.value)}
          onClose={() => toggleControl(null)}
        />
      )}

      {/* Line Color Control Popup */}
      {showLineColorControl && (
        <ControlPopup
          title="Line Color"
          value={lineColor}
          onChange={(e) => setLineColor(e.target.value)}
          onClose={() => toggleControl(null)}
        />
      )}

      {/* Line Width Control Popup */}
      {showLineWidthControl && (
        <ControlPopup
          title="Line Width"
          value={lineWidth}
          onChange={(e) => setLineWidth(Number(e.target.value))}
          onClose={() => toggleControl(null)}
          type="range"
          min="1"
          max="50"
        />
      )}

      {/* Line Softness Control Popup */}
      {showLineSoftnessControl && (
        <ControlPopup
          title="Line Softness"
          value={lineSoftness}
          onChange={(e) => setLineSoftness(Number(e.target.value))}
          onClose={() => toggleControl(null)}
          type="range"
          min="0"
          max="100"
        />
      )}

      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: '20px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            border: '2px solid grey',
            padding: '10px',
            marginRight: '20px',
            backgroundColor: '#f0f0f0',
          }}
        >
          <ToolbarButton onClick={() => toggleControl('bgColor')} icon="🎨" />
          <ToolbarButton onClick={() => toggleControl('lineColor')} icon="🖌️" />
          <ToolbarButton onClick={() => toggleControl('lineWidth')} icon="📏" />
          <ToolbarButton onClick={() => toggleControl('lineSoftness')} icon="🌫️" />
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginRight: '20px',
          }}
        >
        
        </div>

        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          style={{ border: '1px solid black', cursor: 'crosshair', backgroundColor: bgColor }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
      </div>
    </div>
  );
}

export { ControlPopup, ToolbarButton };