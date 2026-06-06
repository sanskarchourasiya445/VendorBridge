// =============================================================================
// routes/quotationRoutes.js
// =============================================================================
import { Router } from 'express';
import * as quotation from '../controllers/quotationController.js';
import { authenticate, requirePermission } from '../middlewares/auth.js';
import { MODULES, ACTIONS } from '../utils/permissions.js';

const router = Router();
router.use(authenticate);

router.get('/', requirePermission(MODULES.QUOTATIONS, ACTIONS.VIEW), quotation.list);
router.get('/:id', requirePermission(MODULES.QUOTATIONS, ACTIONS.VIEW), quotation.getById);
router.post('/', requirePermission(MODULES.QUOTATIONS, ACTIONS.CREATE), quotation.create);
router.put('/:id', requirePermission(MODULES.QUOTATIONS, ACTIONS.EDIT), quotation.update);

export default router;
