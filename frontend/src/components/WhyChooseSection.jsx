import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Cpu, Heart, UserRound, CalendarCheck } from 'lucide-react';
import SectionHeading from './SectionHeading.jsx';
import { useReducedMotion } from '../hooks/useReducedMotion.js';

gsap.registerPlugin(ScrollTrigger);

const REASONS = [
  {
    icon: Cpu,
    title: 'Modern equipment',
    text: 'We use digital X-rays, intraoral cameras, and same-day CAD/CAM restorations. Advanced diagnostics mean faster, more accurate treatment with minimal discomfort.',
  },
  {
    icon: Heart,
    title: 'Patient comfort',
    text: 'Topical anaesthesia, ergonomic treatment chairs, and a calm clinic environment ensure every visit is as relaxed as possible — even for anxious patients.',
  },
  {
    icon: UserRound,
    title: 'Personalised care',
    text: 'Your dentist reviews your full dental history and discusses all treatment options with you before any procedure. No surprises — just clear, honest guidance.',
  },
  {
    icon: CalendarCheck,
    title: 'Convenient booking',
    text: 'Request an appointment online in a few steps, any time of day. Our team confirms each booking promptly and sends a reminder before your visit.',
  },
];

export default function WhyChooseSection() {
  const gridRef = useRef(null);
  const reducedMotion = useReducedMotion();

  useLayoutEffect(() => {
    if (reducedMotion || !gridRef.current) return undefined;
    const ctx = gsap.context(() => {
      gsap.fromTo('.reason-card',
        { opacity: 0, y: 44, scale: 0.95 },
        {
          opacity: 1, y: 0, scale: 1,
          duration: 0.75,
          ease: 'power3.out',
          stagger: { amount: 0.4, from: 'start' },
          scrollTrigger: { trigger: gridRef.current, start: 'top 82%', once: true },
        },
      );
      // Icon pops in after card
      gsap.fromTo('.reason-icon',
        { scale: 0, opacity: 0 },
        {
          scale: 1, opacity: 1,
          duration: 0.5,
          ease: 'back.out(1.7)',
          stagger: 0.1,
          delay: 0.2,
          scrollTrigger: { trigger: gridRef.current, start: 'top 82%', once: true },
        },
      );
    }, gridRef);
    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <section id="why-us" className="section section-tint" aria-labelledby="why-title">
      <div className="container">
        <SectionHeading
          id="why-title"
          eyebrow="Why Choose Us"
          title="Care that is clear, comfortable and convenient"
        />
        <ul className="reason-grid" ref={gridRef}>
          {REASONS.map((r) => {
            const Icon = r.icon;
            return (
              <li key={r.title} className="reason-card">
                <span className="reason-icon"><Icon size={22} aria-hidden="true" /></span>
                <h3>{r.title}</h3>
                <p>{r.text}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
