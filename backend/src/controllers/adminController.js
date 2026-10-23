import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { validateStatus } from '../utils/validators.js';
import * as appointmentService from '../services/appointmentService.js';
import { verifyAdminCredentials, signAdminToken } from '../services/authService.js';
import { APPOINTMENT_STATUSES } from '../utils/constants.js';
import { env } from '../config/env.js';

export const login = asyncHandler(async (req, res) => {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  if (!email || !password || password.length > 200) {
    throw new ApiError(400, 'Email and password are required.');
  }

  const user = await verifyAdminCredentials(email, password);
  if (!user) throw new ApiError(401, 'Invalid email or password.');

  res.json({ token: signAdminToken(user), expiresIn: env.JWT_EXPIRES_IN, email: user.email });
});

export const listAppointments = asyncHandler(async (req, res) => {
  const status = req.query.status ? String(req.query.status) : '';
  const date = req.query.date ? String(req.query.date) : '';
  if (status && !APPOINTMENT_STATUSES.includes(status)) throw new ApiError(400, 'Invalid status filter.');
  if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new ApiError(400, 'Invalid date filter.');

  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 100);
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);

  const appointments = await appointmentService.listAppointments({
    status: status || null,
    date: date || null,
    limit,
    offset: (page - 1) * limit,
  });
  res.json({ appointments, page, limit });
});

export const updateAppointmentStatus = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) throw new ApiError(400, 'Invalid appointment id.');

  const error = validateStatus(req.body?.status);
  if (error) throw new ApiError(422, error, { status: error });

  try {
    const updated = await appointmentService.updateStatus(id, req.body.status);
    if (!updated) throw new ApiError(404, 'Appointment not found.');
  } catch (err) {
    if (err instanceof appointmentService.SlotTakenError) {
      throw new ApiError(409, 'Another active booking already occupies this slot.');
    }
    throw err;
  }
  res.json({ id, status: req.body.status });
});
