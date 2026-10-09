// src/components/DrawCanvas.jsx
import { useRef, useState } from 'react';
import { supabase } from '../supabaseClient';
import { drawStrokes } from '../utils/drawStrokes';

function getPos(e, canvas) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top) * scaleY,
  };
}

function DrawCanvas() {
  const canvasRef = useRef(null);
  const currentStroke = useRef(null);
  const isDrawing = useRef(false);

  const [strokes, setStrokes] = useState([]);
  const [color, setColor] = useState('#3d4a37');
  const [width, setWidth] = useState(3);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  function handleMouseDown(e) {
    const pos = getPos(e, canvasRef.current);
    currentStroke.current = { color, width, points: [pos] };
    isDrawing.current = true;
  }

  function handleMouseMove(e) {
    if (!isDrawing.current) return;
    const pos = getPos(e, canvasRef.current);
    currentStroke.current.points.push(pos);
    drawLiveSegment(pos);
  }

  function handleMouseUp() {
    if (!isDrawing.current) return;
    const finishedStroke = currentStroke.current;
    currentStroke.current = null;
    isDrawing.current = false;
    setStrokes((prev) => [...prev, finishedStroke]);
  }

  function drawLiveSegment(pos) {
    const ctx = canvasRef.current.getContext('2d');
    const points = currentStroke.current.points;
    const prev = points[points.length - 2];
    if (!prev) return;
    ctx.beginPath();
    ctx.strokeStyle = currentStroke.current.color;
    ctx.lineWidth = currentStroke.current.width;
    ctx.moveTo(prev.x, prev.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  }

  function undo() {
    if (strokes.length === 0) return;
    const remaining = strokes.slice(0, -1);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawStrokes(ctx, remaining);
    setStrokes(remaining);
  }

  function clearCanvas() {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setStrokes([]);
  }

  async function saveDoodle() {
    if (strokes.length === 0) return;
    setSaving(true);
    setSaveError(null);

    const { error } = await supabase.from('doodles').insert({ strokes });

    setSaving(false);

    if (error) {
      setSaveError(error.message);
      return;
    }

    clearCanvas();
  }

  return (
    <div>
      <div className="toolbar">
        <label>
          Color
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />
        </label>
        <label>
          Width
          <input
            type="range"
            min="1"
            max="20"
            value={width}
            onChange={(e) => setWidth(Number(e.target.value))}
          />
          <span className="width-value">{width}px</span>
        </label>
      </div>

      <div className="canvas-wrap">
        <canvas
          ref={canvasRef}
          className="draw-canvas"
          width={500}
          height={500}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
      </div>

      <div className="actions">
        <button
          className="btn btn-undo"
          onClick={undo}
          disabled={saving || strokes.length === 0}
        >
          Undo
        </button>
        <button
          className="btn btn-clear"
          onClick={clearCanvas}
          disabled={saving || strokes.length === 0}
        >
          Clear
        </button>
        <button
          className="btn btn-save"
          onClick={saveDoodle}
          disabled={saving || strokes.length === 0}
        >
          {saving ? 'Saving...' : 'Save Doodle'}
        </button>
      </div>

      {saveError && <p className="error">Error: {saveError}</p>}
    </div>
  );
}

export default DrawCanvas;