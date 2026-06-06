// =============================================================================
// routes/invoiceRoutes.js
// =============================================================================
import { Router } from 'express';
import * as invoice from '../controllers/invoiceController.js';
import { authenticate, requirePermission } from '../middlewares/auth.js';
import { MODULES, ACTIONS } from '../utils/permissions.js';

const router = Router();
router.use(authenticate);

router.get('/', requirePermission(MODULES.INVOICES, ACTIONS.VIEW), invoice.list);
router.get('/:id', requirePermission(MODULES.INVOICES, ACTIONS.VIEW), invoice.getById);
router.post('/', requirePermission(MODULES.INVOICES, ACTIONS.CREATE), invoice.create);
router.put('/:id', requirePermission(MODULES.INVOICES, ACTIONS.EDIT), invoice.update);

export default router;
