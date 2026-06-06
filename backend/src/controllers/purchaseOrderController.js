// =============================================================================
// controllers/purchaseOrderController.js
// =============================================================================
import { PurchaseOrders } from '../models/index.js';
import { crudFactory } from './crudFactory.js';

const base = crudFactory(PurchaseOrders, {
  label: 'Purchase Order',
  searchFields: ['poNumber', 'vendorName'],
});

export const { list, getById, create, update, remove } = base;
export default base;
