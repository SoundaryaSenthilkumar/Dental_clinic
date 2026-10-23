import { useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MapPin, Phone, Mail, Clock, Navigation, Send } from 'lucide-react';
import SectionHeading from './SectionHeading.jsx';
import { CLINIC } from '../data/clinicConfig.js';
import { sendEnquiry, ApiError } from '../services/appointmentService.js';
import { validateContact } from '../utils/validation.js';
import { useBooking } from '../hooks/BookingContext.jsx';
import { useReducedMotion } from '../hooks/useReducedMotion.js';

gsap.registerPlugin(ScrollTrigger);

// OpenStreetMap embed — free, no API key required.
// Replace the lat/lon and marker coordinates with your real clinic location.
// To find your coordinates: open maps.google.com, right-click your location → "What's here?"
const OSM_EMBED =
  import.meta.env.VITE_MAP_EMBED_URL ||
  'https://www.openstreetmap.org/export/embed.html?bbox=-0.1276%2C51.5074%2C-0.1176%2C51.5124&layer=mapnik&marker=51.5099%2C-0.1226';

const OSM_LINK =
  'https://www.openstreetmap.org/?mlat=51.5099&mlon=-0.1226#map=16/51.5099/-0.1226';

function EnquiryForm() {
  const [values, setValues] = useState({ name: '', email: '', message: '', website: '' });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');
  const [notice, setNotice] = useState('');
  const busy = useRef(false);

  const update = (field) => (e) => setValues((v) => ({ ...v, [field]: e.target.value }));

  async function onSubmit(e) {
    e.preventDefault();
    if (busy.current) return;
    const found = validateContact(values);
    setErrors(found);
    if (Object.keys(found).length) return;

    busy.current = true;
    setStatus('sending');
    setNotice('');
    try {
      const data = await sendEnquiry(values);
      setStatus('sent');
      setNotice(data.message);
      setValues({ name: '', email: '', message: '', website: '' });
    } catch (err) {
      setErrors(err instanceof ApiError && err.errors ? err.errors : {});
      setNotice(err.message);
      setStatus('error');
    } finally {
      busy.current = false;
    }
  }

  return (
    <form className="enquiry-form" onSubmit={onSubmit} noValidate aria-labelledby="enquiry-title">
      <h3 id="enquiry-title">Send us a message</h3>
      <div className="field">
        <label htmlFor="enq-name">Name</label>
        <input id="enq-name" name="name" autoComplete="name" value={values.name} onChange={update('name')}
          aria-invalid={!!errors.name} aria-describedby={errors.name ? 'enq-name-err' : undefined} />
        {errors.name && <p id="enq-name-err" className="field-error">{errors.name}</p>}
      </div>
      <div className="field">
        <label htmlFor="enq-email">Email</label>
        <input id="enq-email" name="email" type="email" autoComplete="email" value={values.email} onChange={update('email')}
          aria-invalid={!!errors.email} aria-describedby={errors.email ? 'enq-email-err' : undefined} />
        {errors.email && <p id="enq-email-err" className="field-error">{errors.email}</p>}
      </div>
      <div className="field">
        <label htmlFor="enq-message">Message</label>
        <textarea id="enq-message" name="message" rows={4} value={values.message} onChange={update('message')}
          aria-invalid={!!errors.message} aria-describedby={errors.message ? 'enq-message-err' : undefined} />
        {errors.message && <p id="enq-message-err" className="field-error">{errors.message}</p>}
      </div>
      {/* Honeypot: hidden from people, filled by many bots */}
      <div className="hp-field" aria-hidden="true">
        <label htmlFor="enq-website">Website</label>
        <input id="enq-website" name="website" tabIndex={-1} autoComplete="off" value={values.website} onChange={update('website')} />
      </div>
      <button type="submit" className="btn btn-primary" disabled={status === 'sending'}>
        <Send size={18} aria-hidden="true" />
        {status === 'sending' ? 'Sending…' : 'Send message'}
      </button>
      <p className={`form-notice ${status === 'error' ? 'is-error' : ''}`} role="status" aria-live="polite">
        {notice}
      </p>
    </form>
  );
}

export default function ContactSection() {
  const { openBooking } = useBooking();
  const sectionRef = useRef(null);
  const reducedMotion = useReducedMotion();

  useLayoutEffect(() => {
    if (reducedMotion || !sectionRef.current) return undefined;
    const ctx = gsap.context(() => {
      gsap.fromTo('.contact-info',
        { opacity: 0, x: -50 },
        { opacity: 1, x: 0, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 80%', once: true } },
      );
      gsap.fromTo('.map-frame',
        { opacity: 0, x: 50, scale: 0.97 },
        { opacity: 1, x: 0, scale: 1, duration: 0.9, ease: 'power3.out', delay: 0.15,
          scrollTrigger: { trigger: sectionRef.current, start: 'top 80%', once: true } },
      );
      gsap.fromTo('.info-list li',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', stagger: 0.1, delay: 0.3,
          scrollTrigger: { trigger: sectionRef.current, start: 'top 80%', once: true } },
      );
    }, sectionRef);
    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <section id="contact" className="section" aria-labelledby="contact-title" ref={sectionRef}>
      <div className="container">
        <SectionHeading id="contact-title" eyebrow="Contact" title="Visit or get in touch" />

        <div className="contact-grid">
          <div className="contact-info">
            <ul className="info-list">
              <li>
                <MapPin size={20} aria-hidden="true" />
                <address>{CLINIC.address.line1}<br />{CLINIC.address.line2}</address>
              </li>
              <li>
                <Phone size={20} aria-hidden="true" />
                <a href={CLINIC.phoneHref}>{CLINIC.phone}</a>
              </li>
              <li>
                <Mail size={20} aria-hidden="true" />
                <a href={`mailto:${CLINIC.email}`}>{CLINIC.email}</a>
              </li>
            </ul>

            <div className="hours">
              <h3><Clock size={18} aria-hidden="true" /> Opening hours</h3>
              <dl>
                {CLINIC.hours.map((h) => (
                  <div key={h.days}>
                    <dt>{h.days}</dt>
                    <dd>{h.time}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="contact-actions">
              <a className="btn btn-outline" href={CLINIC.directionsUrl} target="_blank" rel="noopener noreferrer">
                <Navigation size={18} aria-hidden="true" /> Get directions
              </a>
              <button type="button" className="btn btn-primary" onClick={() => openBooking()}>
                Book an Appointment
              </button>
            </div>

            <EnquiryForm />
          </div>

          <div className="map-frame">
            <iframe
              title={`Map showing ${CLINIC.name}`}
              src={OSM_EMBED}
              loading="lazy"
              referrerPolicy="no-referrer"
              allowFullScreen
            />
            <a
              className="map-directions-btn"
              href={OSM_LINK}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open clinic location in OpenStreetMap (opens in a new tab)"
            >
              <Navigation size={15} aria-hidden="true" />
              View larger map
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
