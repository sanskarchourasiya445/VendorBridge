// =============================================================================
// controllers/quotationController.js
// =============================================================================
import { Quotations } from '../models/index.js';
import { crudFactory } from './crudFactory.js';

const base = crudFactory(Quotations, {
  label: 'Quotation',
  searchFields: ['quotationNumber', 'vendorName', 'rfqNumber'],
});

export const { list, getById, create, update, remove } = base;
export default base;
