// =============================================================================
// routes/dashboardRoutes.js
// =============================================================================
import { Router } from 'express';
import * as dashboard from '../controllers/dashboardController.js';
import { authenticate, requirePermission } from '../middlewares/auth.js';
import { MODULES, ACTIONS } from '../utils/permissions.js';

const router = Router();
router.use(authenticate);

router.get('/stats', requirePermission(MODULES.DASHBOARD, ACTIONS.VIEW), dashboard.stats);
router.get('/reports', requirePermission(MODULES.REPORTS, ACTIONS.VIEW), dashboard.reports);

export default router;
