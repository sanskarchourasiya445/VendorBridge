// =============================================================================
// routes/approvalRoutes.js
// =============================================================================
import { Router } from 'express';
import * as approval from '../controllers/approvalController.js';
import { authenticate, requirePermission } from '../middlewares/auth.js';
import { MODULES, ACTIONS } from '../utils/permissions.js';

const router = Router();
router.use(authenticate);

router.get('/', requirePermission(MODULES.APPROVALS, ACTIONS.VIEW), approval.list);
router.get('/:id', requirePermission(MODULES.APPROVALS, ACTIONS.VIEW), approval.getById);
router.patch(
  '/:id/decision',
  requirePermission(MODULES.APPROVALS, ACTIONS.APPROVE),
  approval.decide
);

export default router;
