import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateAppointmentInput, validateAppointmentDate, validatePhone, validateEmail } from '../src/utils/validators.js';
import { generateReference } from '../src/utils/referenceNumber.js';

const NOW = new Date(2026, 9, 22, 10, 0, 0); // local 22 Oct 2026
const valid = {
  patientName: 'Asha Kumar',
  phone: '+91 98765-43210',
  email: 'Asha@Example.com',
  doctorId: 1,
  treatment: 'Teeth Cleaning',
  appointmentDate: '2026-10-29',
  timeSlot: '10:30',
  message: '',
  clientRequestId: '3f2a9c1e-8b7d-4e6f-9a0b-1c2d3e4f5a6b',
};

test('accepts a valid booking and normalises values', () => {
  const { errors, value } = validateAppointmentInput(valid, NOW);
  assert.deepEqual(errors, {});
  assert.equal(value.phone, '+919876543210');
  assert.equal(value.email, 'asha@example.com');
  assert.equal(value.message, null);
});

test('rejects past dates and today-earlier dates, accepts today', () => {
  assert.ok(validateAppointmentDate('2026-10-21', NOW));
  assert.equal(validateAppointmentDate('2026-10-22', NOW), null);
});

test('rejects impossible calendar dates', () => {
  assert.ok(validateAppointmentDate('2026-02-30', NOW));
  assert.ok(validateAppointmentDate('26-10-29', NOW));
});

test('rejects invalid phone, email and slot', () => {
  assert.ok(validatePhone('12ab'));
  assert.ok(validateEmail('not-an-email'));
  const { errors } = validateAppointmentInput({ ...valid, timeSlot: '03:15', treatment: 'Magic' }, NOW);
  assert.ok(errors.timeSlot);
  assert.ok(errors.treatment);
});

test('honeypot filled marks submission invalid', () => {
  const { errors } = validateAppointmentInput({ ...valid, website: 'http://spam' }, NOW);
  assert.ok(errors._form);
});

test('rejects message over 500 characters', () => {
  const { errors } = validateAppointmentInput({ ...valid, message: 'x'.repeat(501) }, NOW);
  assert.ok(errors.message);
});

test('requires a client request id to be a UUID', () => {
  const { errors } = validateAppointmentInput({ ...valid, clientRequestId: 'abc' }, NOW);
  assert.ok(errors.clientRequestId);
});

test('generated references match the expected format', () => {
  const ref = generateReference(new Date('2026-10-22T10:00:00Z'));
  assert.match(ref, /^DC-20261022-[A-HJ-NP-Z2-9]{5}$/);
});
