// =============================================================================
// routes/authRoutes.js
// =============================================================================
import { Router } from 'express';
import { login, signup, me } from '../controllers/authController.js';
import { authenticate } from '../middlewares/auth.js';

const router = Router();

router.post('/login', login);
router.post('/signup', signup);
router.get('/me', authenticate, me);

export default router;
