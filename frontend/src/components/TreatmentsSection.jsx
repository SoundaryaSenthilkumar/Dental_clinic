import { useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ChevronDown } from 'lucide-react';
import SectionHeading from './SectionHeading.jsx';
import { TREATMENTS } from '../data/treatments.js';
import { useReducedMotion } from '../hooks/useReducedMotion.js';
import { useBooking } from '../hooks/BookingContext.jsx';

gsap.registerPlugin(ScrollTrigger);

export default function TreatmentsSection() {
  const gridRef = useRef(null);
  const reducedMotion = useReducedMotion();
  const [expanded, setExpanded] = useState(null);
  const { openBooking } = useBooking();

  useLayoutEffect(() => {
    if (reducedMotion || !gridRef.current) return undefined;
    const ctx = gsap.context(() => {
      gsap.fromTo('.treatment-card',
        { opacity: 0, y: 50, scale: 0.94 },
        {
          opacity: 1, y: 0, scale: 1,
          duration: 0.7,
          ease: 'power3.out',
          stagger: { amount: 0.5, from: 'start' },
          scrollTrigger: { trigger: gridRef.current, start: 'top 82%', once: true },
        },
      );
    }, gridRef);
    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <section id="treatments" className="section section-soft" aria-labelledby="treatments-title">
      <div className="container">
        <SectionHeading
          id="treatments-title"
          eyebrow="Dental Treatments"
          title="Treatments tailored to you"
          description="General information about the services we offer. Your dentist will explain what is right for you at your consultation."
        />
        <ul className="treatment-grid" ref={gridRef}>
          {TREATMENTS.map((t) => {
            const Icon = t.icon;
            const isOpen = expanded === t.name;
            const detailsId = `treatment-${t.name.replace(/\s+/g, '-').toLowerCase()}`;
            return (
              <li key={t.name} className="treatment-card">
                <span className="treatment-icon"><Icon size={24} aria-hidden="true" /></span>
                <h3>{t.name}</h3>
                <p>{t.summary}</p>
                <button
                  type="button"
                  className="link-btn"
                  aria-expanded={isOpen}
                  aria-controls={detailsId}
                  onClick={() => setExpanded(isOpen ? null : t.name)}
                >
                  Learn more
                  <ChevronDown size={16} aria-hidden="true" className={`chev ${isOpen ? 'is-open' : ''}`} />
                </button>
                <div id={detailsId} className={`treatment-details ${isOpen ? 'is-open' : ''}`} hidden={!isOpen}>
                  <p>{t.details}</p>
                  <button type="button" className="link-btn strong" onClick={() => openBooking()}>
                    Book about {t.name.toLowerCase()}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
