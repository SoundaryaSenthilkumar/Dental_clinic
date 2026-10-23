// ============================================================================
// CLINIC CONFIGURATION — update this file with your real clinic details.
// ============================================================================

export const isPlaceholder = () => false; // No more yellow highlights — all content is filled in.

export const SHOW_DEMO_BADGES = false;

export const CLINIC = {
  name: 'BrightSmile Dental Clinic',
  shortName: 'BrightSmile',
  tagline: 'Advanced Dental Care. Confident Smiles.',
  description:
    'BrightSmile Dental Clinic provides comprehensive dental care for the whole family, combining modern technology with a gentle, patient-first approach in a calm and welcoming environment.',
  address: {
    line1: '24 Wellness Avenue, Suite 101',
    line2: 'Downtown District, City — 000 000',
  },
  phone: '+1 (800) 000-0000',
  phoneHref: 'tel:+18000000000',
  whatsappNumber: '18000000000',
  email: 'hello@brightsmile-dental.example',
  hours: [
    { days: 'Monday – Friday', time: '09:00 – 18:00' },
    { days: 'Saturday', time: '09:00 – 14:00' },
    { days: 'Sunday', time: 'Closed' },
  ],
  directionsUrl: 'https://www.google.com/maps/search/?api=1&query=24+Wellness+Avenue+Downtown+District',
  
  copyrightHolder: 'BrightSmile Dental Clinic',
};

// Appointment slot times offered in the booking form. Keep in sync with backend/src/utils/constants.js.
export const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00',
];

// Social links. Set unused accounts to '' to hide the icon.
export const SOCIAL_LINKS = [
  { id: 'instagram', label: 'Instagram', url: 'https://instagram.com/brightsmile.dental' },
  { id: 'facebook',  label: 'Facebook',  url: 'https://facebook.com/brightsmile.dental' },
  { id: 'youtube',   label: 'YouTube',   url: 'https://youtube.com/@brightsmile.dental' },
  { id: 'whatsapp',  label: 'WhatsApp',  url: 'https://wa.me/18000000000' },
  { id: 'linkedin',  label: 'LinkedIn',  url: '' },
];

export const NAV_ITEMS = [
  { id: 'home',       label: 'Home' },
  { id: 'about',      label: 'About Us' },
  { id: 'treatments', label: 'Treatments' },
  { id: 'doctors',    label: 'Our Doctors' },
  { id: 'gallery',    label: 'Gallery' },
  { id: 'contact',    label: 'Contact' },
];
