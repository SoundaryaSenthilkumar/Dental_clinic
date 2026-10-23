import { Instagram, Facebook, Youtube, Linkedin, MessageCircle, MapPin, Phone, Mail, Clock } from 'lucide-react';
import Logo from './Logo.jsx';
import { CLINIC, NAV_ITEMS, SOCIAL_LINKS } from '../data/clinicConfig.js';
import { TREATMENTS } from '../data/treatments.js';
import { useBooking } from '../hooks/BookingContext.jsx';

const ICONS = { instagram: Instagram, facebook: Facebook, youtube: Youtube, whatsapp: MessageCircle, linkedin: Linkedin };

export default function Footer() {
  const year = new Date().getFullYear();
  const { openBooking } = useBooking();
  const socials = SOCIAL_LINKS.filter((s) => s.url);

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <a href="#home" className="brand"><Logo size={34} /><span className="brand-name">{CLINIC.shortName}</span></a>
          <p>{CLINIC.description}</p>
          <ul className="social-list" aria-label="Social media">
            {socials.map((s) => {
              const Icon = ICONS[s.id];
              return (
                <li key={s.id}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${CLINIC.name} on ${s.label} (opens in a new tab)`}
                    className="social-link"
                  >
                    <Icon size={18} aria-hidden="true" />
                  </a>
                </li>
              );
            })}
          </ul>
        </div>

        <nav aria-label="Footer quick links">
          <h3>Quick links</h3>
          <ul>
            {NAV_ITEMS.map((i) => <li key={i.id}><a href={`#${i.id}`}>{i.label}</a></li>)}
          </ul>
        </nav>

        <nav aria-label="Footer treatment links">
          <h3>Treatments</h3>
          <ul>
            {TREATMENTS.map((t) => <li key={t.name}><a href="#treatments">{t.name}</a></li>)}
          </ul>
        </nav>

        <div className="footer-contact">
          <h3>Contact</h3>
          <ul className="footer-info">
            <li>
              <MapPin size={16} aria-hidden="true" />
              <span>{CLINIC.address.line1}<br />{CLINIC.address.line2}</span>
            </li>
            <li>
              <Phone size={16} aria-hidden="true" />
              <a href={CLINIC.phoneHref}>{CLINIC.phone}</a>
            </li>
            <li>
              <Mail size={16} aria-hidden="true" />
              <a href={`mailto:${CLINIC.email}`}>{CLINIC.email}</a>
            </li>
            <li>
              <Clock size={16} aria-hidden="true" />
              <span>
                {CLINIC.hours.map((h) => (
                  <span key={h.days} className="block">{h.days}: {h.time}</span>
                ))}
              </span>
            </li>
          </ul>
          <button type="button" className="btn btn-primary footer-cta" onClick={() => openBooking()}>
            Book an Appointment
          </button>
        </div>
      </div>

      <div className="container footer-bottom">
        <p>© {year} {CLINIC.copyrightHolder}. All rights reserved.</p>
        <ul className="legal-links">
          <li><a href="/privacy-policy.html">Privacy Policy</a></li>
          <li><a href="/terms.html">Terms and Conditions</a></li>
        </ul>
      </div>
    </footer>
  );
}
