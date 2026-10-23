import { useMemo, useState } from 'react';
import SectionHeading from './SectionHeading.jsx';
import Lightbox from './Lightbox.jsx';
import DemoBadge from './DemoBadge.jsx';
import { GALLERY_CATEGORIES, GALLERY_ITEMS } from '../data/gallery.js';
import { frameUrl } from '../utils/frames.js';

export default function GallerySection() {
  const [filter, setFilter] = useState('All');
  const [openIndex, setOpenIndex] = useState(null);

  const items = useMemo(
    () => (filter === 'All' ? GALLERY_ITEMS : GALLERY_ITEMS.filter((i) => i.category === filter)),
    [filter],
  );

  return (
    <section id="gallery" className="section section-soft" aria-labelledby="gallery-title">
      <div className="container">
        <SectionHeading id="gallery-title" eyebrow="Gallery" title="Inside our clinic" />
        <DemoBadge>Placeholder stills from the hero video: replace with clinic photos</DemoBadge>

        <div className="gallery-filters" role="group" aria-label="Filter gallery by category">
          {GALLERY_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`chip ${filter === cat ? 'is-active' : ''}`}
              aria-pressed={filter === cat}
              onClick={() => { setFilter(cat); setOpenIndex(null); }}
            >
              {cat}
            </button>
          ))}
        </div>

        <ul className="gallery-grid">
          {items.map((item, i) => (
            <li key={item.id}>
              <button type="button" className="gallery-item" onClick={() => setOpenIndex(i)} aria-label={`Open image: ${item.caption}`}>
                <img
                  src={frameUrl(item.frame, { small: true })}
                  alt=""
                  width="1280"
                  height="720"
                  loading="lazy"
                  decoding="async"
                />
                <span className="gallery-caption">{item.caption}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {openIndex !== null && (
        <Lightbox
          items={items}
          index={openIndex}
          onIndexChange={setOpenIndex}
          onClose={() => setOpenIndex(null)}
        />
      )}
    </section>
  );
}
