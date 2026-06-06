// =============================================================================
// routes/rfqRoutes.js
// =============================================================================
import { Router } from 'express';
import * as rfq from '../controllers/rfqController.js';
import { authenticate, requirePermission } from '../middlewares/auth.js';
import { MODULES, ACTIONS } from '../utils/permissions.js';

const router = Router();
router.use(authenticate);

router.get('/', requirePermission(MODULES.RFQ, ACTIONS.VIEW), rfq.list);
router.get('/:id', requirePermission(MODULES.RFQ, ACTIONS.VIEW), rfq.getById);
router.post('/', requirePermission(MODULES.RFQ, ACTIONS.CREATE), rfq.create);
router.put('/:id', requirePermission(MODULES.RFQ, ACTIONS.EDIT), rfq.update);

export default router;
