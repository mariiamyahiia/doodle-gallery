import { useRef, useEffect } from 'react';
import { drawStrokes } from '../utils/drawStrokes';

const ORIGINAL_SIZE = 500;
const THUMBNAIL_SIZE = 200;

function DoodleCard({ doodle }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const scale = THUMBNAIL_SIZE / ORIGINAL_SIZE;

    ctx.save();
    ctx.scale(scale, scale);
    drawStrokes(ctx, doodle.strokes);
    ctx.restore();
  }, [doodle]);

  return (
    <canvas
      ref={canvasRef}
      width={THUMBNAIL_SIZE}
      height={THUMBNAIL_SIZE}
      style={{ border: '1px solid #ccc' }}
    />
  );
}

export default DoodleCard;