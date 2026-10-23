// Frontend validation mirrors backend/src/utils/validators.js. The server is always the final authority.
const NAME_RE = /^[\p{L}\p{M} .'’-]+$/u;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^\+?\d{7,15}$/;

export function formatLocalDate(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function validateBooking(v, { timeSlots, treatments, doctorIds, today = formatLocalDate() }) {
  const e = {};
  const name = v.patientName.trim();
  if (name.length < 2 || name.length > 100) e.patientName = 'Enter your full name (2 to 100 characters).';
  else if (!NAME_RE.test(name) || !/\p{L}{2}/u.test(name)) e.patientName = 'Use letters, spaces, apostrophes, periods and hyphens only.';

  const phone = v.phone.replace(/[\s().-]/g, '');
  if (!PHONE_RE.test(phone)) e.phone = 'Enter a valid phone number, for example +44 7700 900123.';

  if (!EMAIL_RE.test(v.email.trim())) e.email = 'Enter a valid email address.';
  if (!doctorIds.includes(Number(v.doctorId))) e.doctorId = 'Choose a doctor.';
  if (!treatments.includes(v.treatment)) e.treatment = 'Choose a treatment.';

  if (!v.appointmentDate) e.appointmentDate = 'Choose a date.';
  else if (v.appointmentDate < today) e.appointmentDate = 'Please choose today or a future date.';

  if (!timeSlots.includes(v.timeSlot)) e.timeSlot = 'Choose a time slot.';
  if (v.message.length > 500) e.message = 'Message must be 500 characters or fewer.';
  return e;
}

export function validateContact(v) {
  const e = {};
  if (v.name.trim().length < 2) e.name = 'Enter your name.';
  if (!EMAIL_RE.test(v.email.trim())) e.email = 'Enter a valid email address.';
  if (v.message.trim().length < 10) e.message = 'Please write a short message (at least 10 characters).';
  if (v.message.length > 1000) e.message = 'Message must be 1000 characters or fewer.';
  return e;
}
