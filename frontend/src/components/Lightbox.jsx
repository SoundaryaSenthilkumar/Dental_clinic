import { useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { frameUrl } from '../utils/frames.js';

export default function Lightbox({ items, index, onIndexChange, onClose }) {
  const item = items[index];
  const closeRef = useRef(null);
  const total = items.length;

  // Focus the close button on open; restore focus to the opener on close.
  useEffect(() => {
    const opener = document.activeElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
      opener?.focus?.();
    };
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onIndexChange((index + 1) % total);
      if (e.key === 'ArrowLeft') onIndexChange((index - 1 + total) % total);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [index, total, onClose, onIndexChange]);

  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={`Image viewer: ${item.caption}`}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <button ref={closeRef} type="button" className="icon-btn lightbox-close" aria-label="Close image viewer" onClick={onClose}>
        <X size={22} aria-hidden="true" />
      </button>
      <button type="button" className="icon-btn lightbox-nav prev" aria-label="Previous image"
        onClick={() => onIndexChange((index - 1 + total) % total)}>
        <ChevronLeft size={26} aria-hidden="true" />
      </button>
      <figure className="lightbox-figure">
        <img key={item.id} className="lightbox-img" src={frameUrl(item.frame)} alt={item.alt} />
        <figcaption>{item.caption} <span className="muted">({index + 1} of {total})</span></figcaption>
      </figure>
      <button type="button" className="icon-btn lightbox-nav next" aria-label="Next image"
        onClick={() => onIndexChange((index + 1) % total)}>
        <ChevronRight size={26} aria-hidden="true" />
      </button>
    </div>
  );
}
