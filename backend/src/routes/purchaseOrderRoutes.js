// =============================================================================
// routes/purchaseOrderRoutes.js
// =============================================================================
import { Router } from 'express';
import * as po from '../controllers/purchaseOrderController.js';
import { authenticate, requirePermission } from '../middlewares/auth.js';
import { MODULES, ACTIONS } from '../utils/permissions.js';

const router = Router();
router.use(authenticate);

router.get('/', requirePermission(MODULES.PURCHASE_ORDERS, ACTIONS.VIEW), po.list);
router.get('/:id', requirePermission(MODULES.PURCHASE_ORDERS, ACTIONS.VIEW), po.getById);
router.post('/', requirePermission(MODULES.PURCHASE_ORDERS, ACTIONS.CREATE), po.create);
router.put('/:id', requirePermission(MODULES.PURCHASE_ORDERS, ACTIONS.EDIT), po.update);

export default router;
