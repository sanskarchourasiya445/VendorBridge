// =============================================================================
// routes/userRoutes.js
// =============================================================================
import { Router } from 'express';
import * as user from '../controllers/userController.js';
import { authenticate, requirePermission } from '../middlewares/auth.js';
import { MODULES, ACTIONS } from '../utils/permissions.js';

const router = Router();
router.use(authenticate);

router.get('/', requirePermission(MODULES.USER_MANAGEMENT, ACTIONS.VIEW), user.list);
router.get('/:id', requirePermission(MODULES.USER_MANAGEMENT, ACTIONS.VIEW), user.getById);

export default router;
