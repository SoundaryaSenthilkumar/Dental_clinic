import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { validateName, validateEmail } from '../utils/validators.js';
import { sendClinicEnquiry } from '../services/emailService.js';

// Enquiries are forwarded by email and are not stored in the database (data minimisation).
export const submitEnquiry = asyncHandler(async (req, res) => {
  const body = req.body || {};
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const message = typeof body.message === 'string' ? body.message.trim() : '';

  const errors = {};
  if (typeof body.website === 'string' && body.website.trim() !== '') errors._form = 'Invalid submission.';
  const nameError = validateName(name);
  if (nameError) errors.name = nameError;
  const emailError = validateEmail(email);
  if (emailError) errors.email = emailError;
  if (message.length < 10 || message.length > 1000) errors.message = 'Message must be between 10 and 1000 characters.';
  if (Object.keys(errors).length) throw new ApiError(422, 'Please correct the highlighted fields.', errors);

  const sent = await sendClinicEnquiry({ name, email, message });
  if (!sent) {
    throw new ApiError(503, 'Online messages are temporarily unavailable. Please call the clinic directly.');
  }
  res.status(202).json({ message: 'Thank you. Your message has been sent to the clinic.' });
});
