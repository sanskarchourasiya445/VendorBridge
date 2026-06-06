// =============================================================================
// routes/index.js — mounts every resource router under /api.
// =============================================================================
import { Router } from 'express';
import authRoutes from './authRoutes.js';
import vendorRoutes from './vendorRoutes.js';
import rfqRoutes from './rfqRoutes.js';
import quotationRoutes from './quotationRoutes.js';
import purchaseOrderRoutes from './purchaseOrderRoutes.js';
import invoiceRoutes from './invoiceRoutes.js';
import approvalRoutes from './approvalRoutes.js';
import activityLogRoutes from './activityLogRoutes.js';
import userRoutes from './userRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';
import aiRoutes from './aiRoutes.js';

const router = Router();

router.get('/', (req, res) =>
  res.json({
    success: true,
    data: {
      name: 'VendorBridge API',
      version: '1.0.0',
      endpoints: [
        'POST /api/auth/login',
        'POST /api/auth/signup',
        'GET  /api/auth/me',
        'GET  /api/dashboard/stats',
        'GET  /api/dashboard/reports',
        'GET  /api/vendors',
        'GET  /api/rfqs',
        'GET  /api/quotations',
        'GET  /api/purchase-orders',
        'GET  /api/invoices',
        'GET  /api/approvals',
        'PATCH /api/approvals/:id/decision',
        'GET  /api/activity-logs',
        'GET  /api/users',
        'GET  /api/ai/status',
        'POST /api/ai/compare-quotations',
        'POST /api/ai/generate-rfq',
        'POST /api/ai/insights',
      ],
    },
  })
);

router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/vendors', vendorRoutes);
router.use('/rfqs', rfqRoutes);
router.use('/quotations', quotationRoutes);
router.use('/purchase-orders', purchaseOrderRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/approvals', approvalRoutes);
router.use('/activity-logs', activityLogRoutes);
router.use('/users', userRoutes);
router.use('/ai', aiRoutes);

export default router;
