export function drawStrokes(ctx, strokes) {
  if (!Array.isArray(strokes)) return;

  strokes.forEach((stroke) => {
    if (!stroke || !Array.isArray(stroke.points)) return;

    ctx.beginPath();
    ctx.strokeStyle = stroke.color || '#000000';
    ctx.lineWidth = stroke.width || 1;
    stroke.points.forEach((point, i) => {
      if (i === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });
    ctx.stroke();
  });
}