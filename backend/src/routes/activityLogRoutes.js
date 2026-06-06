// =============================================================================
// routes/activityLogRoutes.js
// =============================================================================
import { Router } from 'express';
import * as activity from '../controllers/activityLogController.js';
import { authenticate, requirePermission } from '../middlewares/auth.js';
import { MODULES, ACTIONS } from '../utils/permissions.js';

const router = Router();
router.use(authenticate);

router.get('/', requirePermission(MODULES.ACTIVITY_LOGS, ACTIONS.VIEW), activity.list);

export default router;
