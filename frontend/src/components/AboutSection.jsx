import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Cpu, ClipboardList, Armchair, ShieldCheck } from 'lucide-react';
import SectionHeading from './SectionHeading.jsx';
import { useReducedMotion } from '../hooks/useReducedMotion.js';

gsap.registerPlugin(ScrollTrigger);

const ABOUT_IMG = 'https://indusdentalcare.com/wp-content/uploads/2025/08/a-photo-of-a-modern-high-tech-dental-cli_egr9zp6zRFqXSnSf88vuNg_HJ4PIA9iR4eboPY8IcpqaA.jpeg';

const PILLARS = [
  {
    icon: Cpu,
    title: 'Modern dental technology',
    text: 'Our clinic is equipped with digital X-rays, intraoral cameras, and CAD/CAM same-day crown technology. These tools allow us to diagnose accurately, plan precisely, and complete many treatments in a single visit — with significantly less radiation than traditional imaging.',
  },
  {
    icon: ClipboardList,
    title: 'Personalised treatment planning',
    text: 'Before any procedure begins, your dentist walks you through a full clinical assessment and discusses every available option. We explain costs, timelines, and expected outcomes clearly, so you can make informed decisions about your care at your own pace.',
  },
  {
    icon: Armchair,
    title: 'Comfortable environment',
    text: 'Our treatment rooms are designed to feel calm and unintimidating, with ergonomic chairs, warm lighting, and a quiet atmosphere. We offer topical anaesthesia before injections and take regular breaks during longer procedures to keep you comfortable throughout.',
  },
  {
    icon: ShieldCheck,
    title: 'Preventive and restorative care',
    text: 'From routine scale-and-polish appointments and fluoride treatments to fillings, crowns, and bridges, we cover the full spectrum of preventive and restorative dentistry. Our goal is to help you keep your natural teeth healthy for as long as possible.',
  },
];

export default function AboutSection() {
  const sectionRef = useRef(null);
  const imgRef = useRef(null);
  const copyRef = useRef(null);
  const reducedMotion = useReducedMotion();

  useLayoutEffect(() => {
    if (reducedMotion || !sectionRef.current) return undefined;
    const ctx = gsap.context(() => {
      // Image slides in from left
      gsap.fromTo(imgRef.current,
        { opacity: 0, x: -60, scale: 1.04 },
        {
          opacity: 1, x: 0, scale: 1,
          duration: 1.1,
          ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 78%', once: true },
        },
      );
      // Feature items stagger from right
      gsap.fromTo('.feature-item',
        { opacity: 0, x: 48 },
        {
          opacity: 1, x: 0,
          duration: 0.7,
          ease: 'power3.out',
          stagger: 0.12,
          delay: 0.25,
          scrollTrigger: { trigger: sectionRef.current, start: 'top 78%', once: true },
        },
      );
      // Feature icons pop in
      gsap.fromTo('.feature-icon',
        { scale: 0, opacity: 0 },
        {
          scale: 1, opacity: 1,
          duration: 0.45,
          ease: 'back.out(2)',
          stagger: 0.12,
          delay: 0.4,
          scrollTrigger: { trigger: sectionRef.current, start: 'top 78%', once: true },
        },
      );
    }, sectionRef);
    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <section id="about" className="section" aria-labelledby="about-title" ref={sectionRef}>
      <div className="container split about-split">

        <div className="about-media" ref={imgRef}>
          <img
            src={ABOUT_IMG}
            alt="Modern high-tech dental clinic with AI-assisted equipment"
            width="1312"
            height="736"
            loading="lazy"
            decoding="async"
          />
        </div>

        <div className="about-copy" ref={copyRef}>
          <SectionHeading
            id="about-title"
            eyebrow="About Us"
            title="Patient-focused care, from the first visit"
            description="Our approach combines modern dental technology with clear communication, so you always know what to expect — and feel confident in every step of your treatment."
          />
          <div className="feature-list">
            {PILLARS.map((p) => {
              const Icon = p.icon;
              return (
                <div key={p.title} className="feature-item">
                  <span className="feature-icon"><Icon size={20} aria-hidden="true" /></span>
                  <div>
                    <h3>{p.title}</h3>
                    <p>{p.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
