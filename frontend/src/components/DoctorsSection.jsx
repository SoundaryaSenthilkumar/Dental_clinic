import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CalendarCheck } from 'lucide-react';
import SectionHeading from './SectionHeading.jsx';
import { DOCTORS } from '../data/doctors.js';
import { useBooking } from '../hooks/BookingContext.jsx';
import { useReducedMotion } from '../hooks/useReducedMotion.js';
import { assetUrl } from '../utils/frames.js';

gsap.registerPlugin(ScrollTrigger);

const initials = (name) =>
  name.replace(/^Dr\.?\s+/i, '').split(/\s+/).slice(0, 2).map((p) => p[0]).join('').toUpperCase();

export default function DoctorsSection() {
  const gridRef = useRef(null);
  const reducedMotion = useReducedMotion();
  const { openBooking } = useBooking();

  useLayoutEffect(() => {
    if (reducedMotion || !gridRef.current) return undefined;
    const ctx = gsap.context(() => {
      // Cards slide up and fade in with stagger
      gsap.fromTo('.doctor-card',
        { opacity: 0, y: 60, scale: 0.95 },
        {
          opacity: 1, y: 0, scale: 1,
          duration: 0.8,
          ease: 'power3.out',
          stagger: 0.15,
          scrollTrigger: { trigger: gridRef.current, start: 'top 82%', once: true },
        },
      );
      // Doctor photo zooms in slightly
      gsap.fromTo('.doctor-photo',
        { scale: 1.08 },
        {
          scale: 1,
          duration: 1,
          ease: 'power2.out',
          stagger: 0.15,
          scrollTrigger: { trigger: gridRef.current, start: 'top 82%', once: true },
        },
      );
    }, gridRef);
    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <section id="doctors" className="section" aria-labelledby="doctors-title">
      <div className="container">
        <SectionHeading
          id="doctors-title"
          eyebrow="Our Doctors"
          title="Meet your dental team"
        />
        <ul className="doctor-grid" ref={gridRef}>
          {DOCTORS.map((doc) => (
            <li key={doc.id} className="doctor-card">
              <div className="doctor-photo">
                {doc.photo ? (
                  <img
                    src={doc.photo.startsWith('http') ? doc.photo : assetUrl(doc.photo)}
                    alt={`Portrait of ${doc.name}`}
                    loading="lazy"
                    decoding="async"
                    width="400"
                    height="400"
                  />
                ) : (
                  <span className="avatar-initials" aria-hidden="true">{initials(doc.name)}</span>
                )}
              </div>
              <div className="doctor-body">
                <h3>{doc.name}</h3>
                <p className="doctor-qual">{doc.qualification}</p>
                <p className="doctor-spec">{doc.specialization}</p>
                {doc.experienceYears !== null && (
                  <p className="doctor-exp">{doc.experienceYears} years of experience</p>
                )}
                <p className="doctor-bio">{doc.bio}</p>
                <button
                  type="button"
                  className="btn btn-outline btn-block"
                  onClick={() => openBooking(doc.id)}
                  aria-label={`Book an appointment with ${doc.name}`}
                >
                  <CalendarCheck size={18} aria-hidden="true" />
                  Book with {doc.name.replace(/^Dr\.?\s+/, 'Dr. ')}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
