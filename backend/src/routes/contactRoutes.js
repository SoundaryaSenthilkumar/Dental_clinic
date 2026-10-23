import { Router } from 'express';
import { submitEnquiry } from '../controllers/contactController.js';
import { contactLimiter } from '../middleware/rateLimiters.js';

const router = Router();
router.post('/', contactLimiter, submitEnquiry);
export default router;
