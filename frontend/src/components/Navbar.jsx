import { useEffect, useRef, useState } from 'react';
import { Menu, X } from 'lucide-react';
import Logo from './Logo.jsx';
import { CLINIC, NAV_ITEMS } from '../data/clinicConfig.js';
import { useScrolled } from '../hooks/useScrolled.js';
import { useActiveSection } from '../hooks/useActiveSection.js';

const SECTION_IDS = NAV_ITEMS.map((item) => item.id);

export default function Navbar({ onBook }) {
  const [open, setOpen] = useState(false);
  const scrolled = useScrolled();
  const active = useActiveSection(SECTION_IDS);
  const toggleRef = useRef(null);

  // Escape closes the mobile menu and returns focus to the toggle button.
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  // Close the mobile menu if the viewport grows to desktop size.
  useEffect(() => {
    const mql = window.matchMedia('(min-width: 961px)');
    const onChange = (e) => { if (e.matches) setOpen(false); };
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  const closeMenu = () => setOpen(false);

  return (
    <header className={`navbar ${scrolled ? 'is-scrolled' : 'is-hero'}`}>
      <div className="container navbar-inner">
        <a href="#home" className="brand" aria-label={`${CLINIC.name} home`} onClick={closeMenu}>
          <Logo />
          <span className="brand-name">{CLINIC.shortName}</span>
        </a>

        <nav
          id="primary-nav"
          className={`nav-panel ${open ? 'is-open' : ''}`}
          aria-label="Primary"
        >
          <ul className="nav-links">
            {NAV_ITEMS.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className={`nav-link ${active === item.id ? 'is-active' : ''}`}
                  aria-current={active === item.id ? 'location' : undefined}
                  onClick={closeMenu}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="btn btn-primary nav-cta"
            onClick={() => { closeMenu(); onBook(); }}
          >
            Book Appointment
          </button>
        </nav>

        <button
          ref={toggleRef}
          type="button"
          className="nav-toggle"
          aria-expanded={open}
          aria-controls="primary-nav"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
        </button>
      </div>
    </header>
  );
}
