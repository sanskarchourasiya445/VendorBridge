// =============================================================================
// routes/vendorRoutes.js
// =============================================================================
import { Router } from 'express';
import * as vendor from '../controllers/vendorController.js';
import { authenticate, requirePermission } from '../middlewares/auth.js';
import { MODULES, ACTIONS } from '../utils/permissions.js';

const router = Router();
router.use(authenticate);

router.get('/', requirePermission(MODULES.VENDORS, ACTIONS.VIEW), vendor.list);
router.get('/:id', requirePermission(MODULES.VENDORS, ACTIONS.VIEW), vendor.getById);
router.post('/', requirePermission(MODULES.VENDORS, ACTIONS.CREATE), vendor.create);
router.put('/:id', requirePermission(MODULES.VENDORS, ACTIONS.EDIT), vendor.update);
router.delete('/:id', requirePermission(MODULES.VENDORS, ACTIONS.DELETE), vendor.remove);

export default router;
