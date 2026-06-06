// =============================================================================
// controllers/rfqController.js
// =============================================================================
import { Rfqs } from '../models/index.js';
import { crudFactory } from './crudFactory.js';

const base = crudFactory(Rfqs, {
  label: 'RFQ',
  searchFields: ['rfqNumber', 'title', 'category', 'createdBy'],
});

export const { list, getById, create, update, remove } = base;
export default base;
