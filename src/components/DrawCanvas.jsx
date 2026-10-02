import { useRef, useState } from 'react';
import { supabase } from '../supabaseClient';

function getPos(e, canvas) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  };
}

function DrawCanvas() {
  const canvasRef = useRef(null);
  const currentStroke = useRef(null);
  const isDrawing = useRef(false);

  const [strokes, setStrokes] = useState([]);
  const [color, setColor] = useState('#000000');
  const [width, setWidth] = useState(3);
  const [showJson, setShowJson] = useState(false);
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
    setStrokes((prev) => [...prev, currentStroke.current]);
    currentStroke.current = null;
    isDrawing.current = false;
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

    const { error } = await supabase
      .from('doodles')
      .insert({ strokes });

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
          Color:{' '}
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />
        </label>
        <label>
          Width:{' '}
          <input
            type="range"
            min="1"
            max="20"
            value={width}
            onChange={(e) => setWidth(Number(e.target.value))}
          />{' '}
          {width}px
        </label>
      </div>

      <canvas
        ref={canvasRef}
        width={500}
        height={500}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ border: '1px solid black' }}
      />

      <div>
        <button onClick={clearCanvas}>Clear</button>
        <button onClick={() => setShowJson((prev) => !prev)}>
          {showJson ? 'Hide' : 'Show'} Raw JSON
        </button>
        <button onClick={saveDoodle} disabled={saving || strokes.length === 0}>
          {saving ? 'Saving...' : 'Save Doodle'}
        </button>
      </div>

      {saveError && <p style={{ color: 'red' }}>Error: {saveError}</p>}
      {showJson && <pre>{JSON.stringify(strokes, null, 2)}</pre>}
    </div>
  );
}

export default DrawCanvas;