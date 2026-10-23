import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { X, Check, AlertCircle } from 'lucide-react';
import { DOCTORS } from '../data/doctors.js';
import { TREATMENTS } from '../data/treatments.js';
import { TIME_SLOTS } from '../data/clinicConfig.js';
import { createAppointment, ApiError } from '../services/appointmentService.js';
import { validateBooking, formatLocalDate } from '../utils/validation.js';
import { uuidv4 } from '../utils/uuid.js';

const EMPTY = {
  patientName: '', phone: '', email: '', doctorId: '', treatment: '',
  appointmentDate: '', timeSlot: '', message: '', website: '',
};

const DOCTOR_IDS = DOCTORS.map((d) => d.id);
const TREATMENT_NAMES = TREATMENTS.map((t) => t.name);

function formatDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function Field({ id, label, error, children, full = false }) {
  return (
    <div className={`field ${full ? 'field--full' : ''} ${error ? 'has-error' : ''}`}>
      <label htmlFor={id}>{label}</label>
      {children}
      {error && <p id={`${id}-error`} className="field-error">{error}</p>}
    </div>
  );
}

export default function AppointmentForm({ initialDoctorId = '', onClose }) {
  const [values, setValues] = useState({ ...EMPTY, doctorId: initialDoctorId ? String(initialDoctorId) : '' });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [notice, setNotice] = useState('');
  const [appointment, setAppointment] = useState(null);

  // One ID per form instance. Retries send the same ID, so the server returns the existing booking instead of duplicating it.
  const requestIdRef = useRef(uuidv4());
  const inFlight = useRef(false);
  const busyRef = useRef(false);
  const dialogRef = useRef(null);
  const firstFieldRef = useRef(null);
  const titleId = useId();
  const fieldId = (name) => `${titleId}-${name}`;
  const today = useMemo(() => formatLocalDate(), []);

  useEffect(() => {
    const opener = document.activeElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    firstFieldRef.current?.focus();

    const onKey = (e) => {
      if (e.key === 'Escape' && !busyRef.current) onClose();
      // Keep Tab focus inside the dialog while it is open.
      if (e.key === 'Tab' && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll('button:not([disabled]), input:not([tabindex="-1"]), select, textarea, a[href]');
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      opener?.focus?.();
    };
  }, [onClose]);

  const update = (field) => (e) => {
    const value = e.target.value;
    setValues((v) => ({ ...v, [field]: value }));
    setErrors((er) => (er[field] ? { ...er, [field]: undefined } : er));
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (inFlight.current || status === 'success') return;

    const found = validateBooking(values, {
      timeSlots: TIME_SLOTS,
      treatments: TREATMENT_NAMES,
      doctorIds: DOCTOR_IDS,
      today,
    });
    setErrors(found);
    setNotice('');
    if (Object.keys(found).length) {
      document.getElementById(fieldId(Object.keys(found)[0]))?.focus();
      return;
    }

    inFlight.current = true;
    busyRef.current = true;
    setStatus('submitting');
    try {
      const saved = await createAppointment({
        ...values,
        doctorId: Number(values.doctorId),
        clientRequestId: requestIdRef.current,
      });
      setAppointment(saved);
      setStatus('success');
    } catch (err) {
      const fieldErrors = err instanceof ApiError && err.errors ? err.errors : {};
      const { _form, ...rest } = fieldErrors;
      setErrors((prev) => ({ ...prev, ...rest }));
      setNotice(_form || err.message);
      setStatus('error');
    } finally {
      inFlight.current = false;
      busyRef.current = false;
    }
  }

  const submitting = status === 'submitting';

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => { if (e.target === e.currentTarget && !submitting) onClose(); }}
    >
      <div ref={dialogRef} className="modal" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <header className="modal-header">
          <h2 id={titleId}>{status === 'success' ? 'Request received' : 'Book an appointment'}</h2>
          <button type="button" className="icon-btn" aria-label="Close booking form" onClick={onClose} disabled={submitting}>
            <X size={20} aria-hidden="true" />
          </button>
        </header>

        {status === 'success' && appointment ? (
          <div className="booking-success" role="status">
            <span className="success-icon"><Check size={26} aria-hidden="true" /></span>
            <p>Your appointment request has been saved. Please keep your reference number.</p>
            <p className="reference">Reference <strong>{appointment.reference}</strong></p>
            <dl className="summary">
              <div><dt>Doctor</dt><dd>{appointment.doctorName}</dd></div>
              <div><dt>Treatment</dt><dd>{appointment.treatment}</dd></div>
              <div><dt>Preferred date</dt><dd>{formatDate(appointment.appointmentDate)}</dd></div>
              <div><dt>Preferred time</dt><dd>{appointment.timeSlot}</dd></div>
              <div><dt>Status</dt><dd><span className="status-badge">{appointment.status}</span></dd></div>
            </dl>
            <p className="muted">Our team will contact you to confirm this appointment.</p>
            <button type="button" className="btn btn-primary" onClick={onClose}>Done</button>
          </div>
        ) : (
          <form className="booking-form" onSubmit={handleSubmit} noValidate>
            <div className="form-grid">
              <Field id={fieldId('patientName')} label="Full name *" error={errors.patientName}>
                <input ref={firstFieldRef} id={fieldId('patientName')} name="patientName" autoComplete="name"
                  value={values.patientName} onChange={update('patientName')}
                  aria-invalid={!!errors.patientName} aria-describedby={errors.patientName ? `${fieldId('patientName')}-error` : undefined} />
              </Field>
              <Field id={fieldId('phone')} label="Phone number *" error={errors.phone}>
                <input id={fieldId('phone')} name="phone" type="tel" autoComplete="tel" inputMode="tel"
                  value={values.phone} onChange={update('phone')}
                  aria-invalid={!!errors.phone} aria-describedby={errors.phone ? `${fieldId('phone')}-error` : undefined} />
              </Field>
              <Field id={fieldId('email')} label="Email address *" error={errors.email}>
                <input id={fieldId('email')} name="email" type="email" autoComplete="email"
                  value={values.email} onChange={update('email')}
                  aria-invalid={!!errors.email} aria-describedby={errors.email ? `${fieldId('email')}-error` : undefined} />
              </Field>
              <Field id={fieldId('doctorId')} label="Preferred doctor *" error={errors.doctorId}>
                <select id={fieldId('doctorId')} name="doctorId" value={values.doctorId} onChange={update('doctorId')}
                  aria-invalid={!!errors.doctorId} aria-describedby={errors.doctorId ? `${fieldId('doctorId')}-error` : undefined}>
                  <option value="">Select a doctor</option>
                  {DOCTORS.map((d) => (
                    <option key={d.id} value={d.id}>{d.name} · {d.specialization}</option>
                  ))}
                </select>
              </Field>
              <Field id={fieldId('treatment')} label="Dental treatment *" error={errors.treatment}>
                <select id={fieldId('treatment')} name="treatment" value={values.treatment} onChange={update('treatment')}
                  aria-invalid={!!errors.treatment} aria-describedby={errors.treatment ? `${fieldId('treatment')}-error` : undefined}>
                  <option value="">Select a treatment</option>
                  {TREATMENT_NAMES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
              <Field id={fieldId('appointmentDate')} label="Preferred date *" error={errors.appointmentDate}>
                <input id={fieldId('appointmentDate')} name="appointmentDate" type="date" min={today}
                  value={values.appointmentDate} onChange={update('appointmentDate')}
                  aria-invalid={!!errors.appointmentDate} aria-describedby={errors.appointmentDate ? `${fieldId('appointmentDate')}-error` : undefined} />
              </Field>
              <Field id={fieldId('timeSlot')} label="Preferred time *" error={errors.timeSlot}>
                <select id={fieldId('timeSlot')} name="timeSlot" value={values.timeSlot} onChange={update('timeSlot')}
                  aria-invalid={!!errors.timeSlot} aria-describedby={errors.timeSlot ? `${fieldId('timeSlot')}-error` : undefined}>
                  <option value="">Select a time</option>
                  {TIME_SLOTS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
              <Field id={fieldId('message')} label="Message (optional)" error={errors.message} full>
                <textarea id={fieldId('message')} name="message" rows={3} maxLength={600}
                  value={values.message} onChange={update('message')}
                  aria-invalid={!!errors.message} aria-describedby={errors.message ? `${fieldId('message')}-error` : undefined} />
              </Field>
            </div>

            {/* Honeypot: hidden from people, often filled by bots. */}
            <div className="hp-field" aria-hidden="true">
              <label htmlFor={fieldId('website')}>Leave this field empty</label>
              <input id={fieldId('website')} name="website" tabIndex={-1} autoComplete="off"
                value={values.website} onChange={update('website')} />
            </div>

            {notice && (
              <p className="form-alert" role="alert">
                <AlertCircle size={18} aria-hidden="true" /> {notice}
              </p>
            )}

            <div className="form-footer">
              <p className="muted small">Requests are confirmed by our team. Fields marked * are required.</p>
              <button type="submit" className="btn btn-primary" disabled={submitting} aria-busy={submitting}>
                {submitting ? 'Submitting…' : 'Request appointment'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
