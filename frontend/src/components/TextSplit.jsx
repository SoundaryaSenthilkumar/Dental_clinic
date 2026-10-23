import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from '../hooks/useReducedMotion.js';

gsap.registerPlugin(ScrollTrigger);

// Splits text into individual word spans and animates them in on scroll.
// mode: 'words' | 'chars'
export function SplitText({ as: Tag = 'h2', text, className = '', mode = 'words', delay = 0, id }) {
  const ref = useRef(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion || !ref.current) return undefined;
    const el = ref.current;
    const spans = el.querySelectorAll('.split-unit');
    if (!spans.length) return undefined;

    gsap.set(spans, { opacity: 0, y: '110%' });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        once: true,
      },
    });

    tl.to(spans, {
      opacity: 1,
      y: '0%',
      duration: 0.7,
      ease: 'power3.out',
      stagger: mode === 'chars' ? 0.03 : 0.06,
      delay: delay / 1000,
    });

    return () => tl.kill();
  }, [reducedMotion, mode, delay]);

  const units = mode === 'chars'
    ? text.split('').map((ch, i) => (
        <span key={i} className="split-unit" aria-hidden="true">
          {ch === ' ' ? '\u00A0' : ch}
        </span>
      ))
    : text.split(' ').map((word, i) => (
        <span key={i} className="split-unit" aria-hidden="true">
          {word}{i < text.split(' ').length - 1 ? '\u00A0' : ''}
        </span>
      ));

  return (
    <Tag
      ref={ref}
      id={id}
      className={`split-text ${className}`.trim()}
      aria-label={text}
    >
      {units}
    </Tag>
  );
}

// Animates a paragraph line by line (each sentence/line fades+rises).
export function LineReveal({ as: Tag = 'p', text, className = '', delay = 0 }) {
  const ref = useRef(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion || !ref.current) return undefined;
    const el = ref.current;

    gsap.fromTo(el,
      { opacity: 0, y: 28, clipPath: 'inset(0 0 100% 0)' },
      {
        opacity: 1,
        y: 0,
        clipPath: 'inset(0 0 0% 0)',
        duration: 0.85,
        ease: 'power3.out',
        delay: delay / 1000,
        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      },
    );

    return () => ScrollTrigger.getAll().forEach((st) => {
      if (st.trigger === el) st.kill();
    });
  }, [reducedMotion, delay]);

  return <Tag ref={ref} className={`line-reveal ${className}`.trim()}>{text}</Tag>;
}

// Eyebrow label with left-slide + underline draw effect.
export function EyebrowReveal({ text, className = '' }) {
  const ref = useRef(null);
  const lineRef = useRef(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion || !ref.current) return undefined;

    gsap.fromTo(ref.current,
      { opacity: 0, x: -24 },
      {
        opacity: 1, x: 0, duration: 0.6, ease: 'power2.out',
        scrollTrigger: { trigger: ref.current, start: 'top 90%', once: true },
      },
    );

    if (lineRef.current) {
      gsap.fromTo(lineRef.current,
        { scaleX: 0 },
        {
          scaleX: 1, duration: 0.5, ease: 'power2.out', delay: 0.25,
          scrollTrigger: { trigger: ref.current, start: 'top 90%', once: true },
        },
      );
    }

    return () => ScrollTrigger.getAll().forEach((st) => {
      if (st.trigger === ref.current) st.kill();
    });
  }, [reducedMotion]);

  return (
    <div ref={ref} className={`eyebrow-wrap ${className}`.trim()}>
      <span ref={lineRef} className="eyebrow-line" aria-hidden="true" />
      <p className="eyebrow">{text}</p>
    </div>
  );
}
