// Pure validation helpers. No dependencies, so they can be unit-tested directly.
import { TREATMENTS, TIME_SLOTS, APPOINTMENT_STATUSES, MAX_MESSAGE_LENGTH } from './constants.js';

const NAME_RE = /^[\p{L}\p{M} .'’-]+$/u;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const PHONE_CLEAN_RE = /[\s().-]/g;
const PHONE_RE = /^\+?\d{7,15}$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const str = (v) => (typeof v === 'string' ? v.trim() : '');

export function validateName(value) {
  const v = str(value);
  if (v.length < 2 || v.length > 100) return 'Full name must be between 2 and 100 characters.';
  if (!NAME_RE.test(v) || !/\p{L}{2}/u.test(v)) {
    return 'Full name may contain letters, spaces, apostrophes, periods and hyphens only.';
  }
  return null;
}

export function normalizePhone(value) {
  return str(value).replace(PHONE_CLEAN_RE, '');
}

export function validatePhone(value) {
  if (!PHONE_RE.test(normalizePhone(value))) {
    return 'Enter a valid phone number (7 to 15 digits, optional leading +).';
  }
  return null;
}

export function validateEmail(value) {
  const v = str(value);
  if (v.length > 190 || !EMAIL_RE.test(v)) return 'Enter a valid email address.';
  return null;
}

// Calendar date string YYYY-MM-DD for `now`, in server local time.
export function todayString(now = new Date()) {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function validateAppointmentDate(value, now = new Date()) {
  const v = str(value);
  if (!DATE_RE.test(v)) return 'Choose a valid appointment date.';
  const [y, m, d] = v.split('-').map(Number);
  const probe = new Date(Date.UTC(y, m - 1, d));
  if (probe.getUTCFullYear() !== y || probe.getUTCMonth() !== m - 1 || probe.getUTCDate() !== d) {
    return 'Choose a valid appointment date.';
  }
  if (v < todayString(now)) return 'Appointments cannot be booked for a past date.';
  return null;
}

export function validateTimeSlot(value) {
  return TIME_SLOTS.includes(value) ? null : 'Choose a valid time slot.';
}

export function validateTreatment(value) {
  return TREATMENTS.includes(value) ? null : 'Choose a valid dental treatment.';
}

export function validateDoctorId(value) {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? null : 'Choose a preferred doctor.';
}

export function validateStatus(value) {
  return APPOINTMENT_STATUSES.includes(value) ? null : 'Invalid appointment status.';
}

export function validateUuid(value) {
  return typeof value === 'string' && UUID_RE.test(value) ? null : 'Invalid submission identifier.';
}

// Validates the public booking payload. Returns { errors, value }.
// `website` is a honeypot field: hidden from real users, so filling it signals a bot.
export function validateAppointmentInput(body = {}, now = new Date()) {
  const errors = {};
  const set = (field, message) => { if (message) errors[field] = message; };

  if (str(body.website) !== '') set('_form', 'Invalid submission.');

  set('patientName', validateName(body.patientName));
  set('phone', validatePhone(body.phone));
  set('email', validateEmail(body.email));
  set('doctorId', validateDoctorId(body.doctorId));
  set('treatment', validateTreatment(body.treatment));
  set('appointmentDate', validateAppointmentDate(body.appointmentDate, now));
  set('timeSlot', validateTimeSlot(body.timeSlot));
  set('clientRequestId', validateUuid(body.clientRequestId));

  const message = str(body.message);
  if (message.length > MAX_MESSAGE_LENGTH) {
    errors.message = `Message must be ${MAX_MESSAGE_LENGTH} characters or fewer.`;
  }

  const value = {
    patientName: str(body.patientName),
    phone: normalizePhone(body.phone),
    email: str(body.email).toLowerCase(),
    doctorId: Number(body.doctorId),
    treatment: str(body.treatment),
    appointmentDate: str(body.appointmentDate),
    timeSlot: str(body.timeSlot),
    message: message || null,
    clientRequestId: str(body.clientRequestId).toLowerCase(),
  };

  return { errors, value };
}
