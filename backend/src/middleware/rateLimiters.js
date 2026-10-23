import rateLimit from 'express-rate-limit';

const common = { standardHeaders: 'draft-7', legacyHeaders: false };

export const globalLimiter = rateLimit({
  ...common,
  windowMs: 15 * 60 * 1000,
  limit: 300,
  message: { message: 'Too many requests. Please try again later.' },
});

// Limits booking attempts per IP to slow down spam and automated form submissions.
export const bookingLimiter = rateLimit({
  ...common,
  windowMs: 15 * 60 * 1000,
  limit: 5,
  message: { message: 'Too many booking attempts from this network. Please wait before trying again or call the clinic.' },
});

export const loginLimiter = rateLimit({
  ...common,
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: { message: 'Too many sign-in attempts. Please try again later.' },
});

export const contactLimiter = rateLimit({
  ...common,
  windowMs: 60 * 60 * 1000,
  limit: 5,
  message: { message: 'Too many messages from this network. Please try again later or call the clinic.' },
});
