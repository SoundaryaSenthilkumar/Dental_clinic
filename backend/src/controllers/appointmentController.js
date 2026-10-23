import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { validateAppointmentInput } from '../utils/validators.js';
import { generateReference } from '../utils/referenceNumber.js';
import * as appointmentService from '../services/appointmentService.js';
import { sendConfirmationEmail } from '../services/emailService.js';

const FORM_ERROR_MESSAGE = 'Please correct the highlighted fields.';

// Only non-sensitive fields are returned to the public booking client.
const toPublic = (row) => ({
  reference: row.reference,
  status: row.status,
  doctorName: row.doctorName,
  treatment: row.treatment,
  appointmentDate: row.appointmentDate,
  timeSlot: row.timeSlot,
});

export const createAppointment = asyncHandler(async (req, res) => {
  const { errors, value } = validateAppointmentInput(req.body, new Date());
  if (Object.keys(errors).length) throw new ApiError(422, FORM_ERROR_MESSAGE, errors);

  // Retried submissions (double clicks, network retries) return the original booking.
  const existing = await appointmentService.findByClientRequestId(value.clientRequestId);
  if (existing) return res.status(200).json({ appointment: toPublic(existing), duplicate: true });

  const doctor = await appointmentService.findActiveDoctor(value.doctorId);
  if (!doctor) {
    throw new ApiError(422, FORM_ERROR_MESSAGE, { doctorId: 'The selected doctor is not available.' });
  }

  let insertId = null;
  for (let attempt = 1; attempt <= 3 && insertId === null; attempt += 1) {
    const reference = generateReference();
    try {
      insertId = await appointmentService.insertAppointment({ ...value, reference });
    } catch (err) {
      if (err instanceof appointmentService.SlotTakenError) {
        throw new ApiError(409, 'That time slot has just been booked. Please choose another time.', {
          timeSlot: 'This slot is no longer available for the selected doctor.',
        });
      }
      if (err instanceof appointmentService.DuplicateRequestError) {
        const dup = await appointmentService.findByClientRequestId(value.clientRequestId);
        return res.status(200).json({ appointment: toPublic(dup), duplicate: true });
      }
      // Extremely unlikely reference collision: retry with a fresh reference.
      if (err.code === 'ER_DUP_ENTRY' && err.message.includes('reference') && attempt < 3) continue;
      throw err;
    }
  }

  const row = await appointmentService.findById(insertId);

  // Email is best-effort and runs after the booking is saved.
  sendConfirmationEmail({
    reference: row.reference,
    patientName: value.patientName,
    email: value.email,
    doctorName: doctor.fullName,
    treatment: value.treatment,
    appointmentDate: value.appointmentDate,
    timeSlot: value.timeSlot,
  }).catch(() => {});

  return res.status(201).json({ appointment: toPublic(row) });
});
