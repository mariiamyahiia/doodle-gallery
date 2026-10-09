import { useRef, useEffect } from 'react';
import { drawStrokes } from '../utils/drawStrokes';

function Lightbox({ doodle, onClose }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const ctx = canvasRef.current.getContext('2d');
    drawStrokes(ctx, doodle.strokes);
  }, [doodle]);

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return (
    <div className="lightbox-backdrop" onClick={onClose}>
      <div
        className="lightbox"
        role="dialog"
        aria-modal="true"
        aria-label="Doodle preview"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="btn lightbox-close"
          onClick={onClose}
          aria-label="Close preview"
        >
          ✕
        </button>
        <canvas
          ref={canvasRef}
          className="lightbox-canvas"
          width={500}
          height={500}
        />
        <p className="lightbox-date">
            drawn on {new Date(doodle.created_at).toLocaleDateString('en-GB')}
        </p>
      </div>
    </div>
  );
}

export default Lightbox;