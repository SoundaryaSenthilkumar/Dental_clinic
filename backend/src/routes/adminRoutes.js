import { Router } from 'express';
import * as admin from '../controllers/adminController.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { loginLimiter } from '../middleware/rateLimiters.js';

const router = Router();

router.post('/login', loginLimiter, admin.login);

// Every route below this line requires a valid admin token.
router.use(requireAdmin);
router.get('/appointments', admin.listAppointments);
router.patch('/appointments/:id', admin.updateAppointmentStatus);

export default router;
