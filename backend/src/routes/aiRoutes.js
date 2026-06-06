// =============================================================================
// routes/aiRoutes.js — AI-assisted procurement endpoints.
// Left unauthenticated so the standalone frontend can call them directly;
// CORS is still restricted to CLIENT_ORIGIN in app.js. Wrap with `authenticate`
// from middlewares/auth.js if you later require a logged-in session.
// =============================================================================
import { Router } from 'express';
import { status, compare, draftRfq, insights } from '../controllers/aiController.js';

const router = Router();

router.get('/status', status);
router.post('/compare-quotations', compare);
router.post('/generate-rfq', draftRfq);
router.post('/insights', insights);

export default router;
