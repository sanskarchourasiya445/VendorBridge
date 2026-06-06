// =============================================================================
// controllers/invoiceController.js
// =============================================================================
import { Invoices } from '../models/index.js';
import { crudFactory } from './crudFactory.js';

const base = crudFactory(Invoices, {
  label: 'Invoice',
  searchFields: ['invoiceNumber', 'vendorName', 'poNumber'],
});

export const { list, getById, create, update, remove } = base;
export default base;
