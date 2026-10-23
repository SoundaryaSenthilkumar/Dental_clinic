import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import SectionHeading from './SectionHeading.jsx';
import { TESTIMONIALS } from '../data/testimonials.js';
import { useReducedMotion } from '../hooks/useReducedMotion.js';

gsap.registerPlugin(ScrollTrigger);

export default function TestimonialsSection() {
  const [index, setIndex] = useState(0);
  const total = TESTIMONIALS.length;
  const current = TESTIMONIALS[index];
  const cardRef = useRef(null);
  const sectionRef = useRef(null);
  const reducedMotion = useReducedMotion();

  const prev = () => setIndex((i) => (i - 1 + total) % total);
  const next = () => setIndex((i) => (i + 1) % total);

  const onKeyDown = (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
    if (e.key === 'ArrowLeft')  { e.preventDefault(); prev(); }
  };

  // Section entrance
  useLayoutEffect(() => {
    if (reducedMotion || !sectionRef.current) return undefined;
    const ctx = gsap.context(() => {
      gsap.fromTo('.carousel',
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 82%', once: true },
        },
      );
    }, sectionRef);
    return () => ctx.revert();
  }, [reducedMotion]);

  // Animate on slide change
  useEffect(() => {
    if (reducedMotion || !cardRef.current) return;
    gsap.fromTo(cardRef.current,
      { opacity: 0, y: 20, scale: 0.98 },
      { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'power2.out' },
    );
  }, [index, reducedMotion]);

  return (
    <section id="reviews" className="section section-tint" aria-labelledby="reviews-title" ref={sectionRef}>
      <div className="container narrow">
        <SectionHeading id="reviews-title" eyebrow="Patient Stories" title="What patients say" />

        <div
          className="carousel"
          role="region"
          aria-roledescription="carousel"
          aria-label="Patient testimonials"
          onKeyDown={onKeyDown}
          tabIndex={-1}
        >
          <figure className="testimonial-card" ref={cardRef} key={current.id} aria-live="polite">
            <blockquote className="testimonial-quote">"{current.quote}"</blockquote>
            <figcaption>
              <span className="avatar-initials small" aria-hidden="true">
                {current.name.split(' ').map((p) => p[0]).join('')}
              </span>
              <span>
                <strong>{current.name}</strong>
                <span className="muted block">{current.context}</span>
              </span>
            </figcaption>
          </figure>

          <div className="carousel-controls">
            <button type="button" className="icon-btn" onClick={prev} aria-label="Previous testimonial">
              <ChevronLeft size={20} aria-hidden="true" />
            </button>
            <div className="carousel-dots" role="group" aria-label="Choose testimonial">
              {TESTIMONIALS.map((t, i) => (
                <button
                  key={t.id}
                  type="button"
                  className={`dot ${i === index ? 'is-active' : ''}`}
                  aria-label={`Show testimonial ${i + 1} of ${total}`}
                  aria-current={i === index}
                  onClick={() => setIndex(i)}
                />
              ))}
            </div>
            <button type="button" className="icon-btn" onClick={next} aria-label="Next testimonial">
              <ChevronRight size={20} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
