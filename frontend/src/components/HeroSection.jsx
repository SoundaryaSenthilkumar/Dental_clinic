import { useRef } from 'react';
import FrameSequence from './FrameSequence.jsx';
import { CLINIC } from '../data/clinicConfig.js';
import { useReducedMotion } from '../hooks/useReducedMotion.js';

export default function HeroSection({ onBook }) {
  const trackRef = useRef(null);
  const reducedMotion = useReducedMotion();

  return (
    <section
      id="home"
      ref={trackRef}
      className={`hero ${reducedMotion ? 'hero--static' : ''}`}
      aria-labelledby="hero-title"
    >
      {/* frame-stage-fullbleed is sticky; hero-sticky sits inside it as an absolute overlay */}
      <div className="frame-stage-fullbleed">
        <FrameSequence trackRef={trackRef} />

        {/* Cinematic overlay + text content */}
        <div className="hero-sticky">
          <div className="container hero-content">
            <p className="hero-chip">{CLINIC.trustIndicator}</p>
            <h1 id="hero-title" className="hero-title">
              Advanced Dental Care.<br />
              <span className="text-gradient-light">Confident Smiles.</span>
            </h1>
            <p className="hero-lead">
              Experience personalized dental care with modern technology,
              expert dentists, and a gentle approach to every smile.
            </p>
            <div className="hero-ctas">
              <button type="button" className="btn btn-primary" onClick={() => onBook()}>
                Book an Appointment
              </button>
              <a className="btn btn-hero-ghost" href="#treatments">
                Explore Our Treatments
              </a>
            </div>
          </div>

          {!reducedMotion && (
            <div className="hero-scroll-hint" aria-hidden="true">
              <span className="scroll-dot" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
