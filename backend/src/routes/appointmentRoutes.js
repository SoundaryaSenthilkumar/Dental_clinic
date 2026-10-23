import { Router } from 'express';
import { createAppointment } from '../controllers/appointmentController.js';
import { bookingLimiter } from '../middleware/rateLimiters.js';

const router = Router();

router.post('/', bookingLimiter, createAppointment);

export default router;
