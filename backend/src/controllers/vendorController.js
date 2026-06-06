// =============================================================================
// controllers/vendorController.js — full CRUD for the vendor master.
// =============================================================================
import { Vendors, ActivityLogs } from '../models/index.js';
import { crudFactory } from './crudFactory.js';
import { ok, created, fail, noContent } from '../views/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const base = crudFactory(Vendors, {
  label: 'Vendor',
  searchFields: ['name', 'category', 'city', 'state', 'gstin', 'contactPerson'],
});

export const list = base.list;
export const getById = base.getById;

export const create = asyncHandler(async (req, res) => {
  const body = req.body || {};
  if (!body.name) return fail(res, 400, 'Vendor name is required.');

  const vendor = Vendors.create({
    code: body.code || `VB-${Vendors.nextId()}`,
    status: body.status || 'active',
    rating: body.rating ?? 0,
    totalOrders: body.totalOrders ?? 0,
    totalSpend: body.totalSpend ?? 0,
    onboardedDate: body.onboardedDate || new Date().toISOString().slice(0, 10),
    ...body,
  });

  ActivityLogs.create({
    type: 'create',
    module: 'Vendors',
    actor: req.user?.name || 'System',
    description: `Onboarded vendor ${vendor.name}`,
    entityId: vendor.id,
    timestamp: new Date().toISOString(),
  });

  return created(res, vendor);
});

export const update = asyncHandler(async (req, res) => {
  const vendor = Vendors.update(req.params.id, req.body || {});
  if (!vendor) return fail(res, 404, `Vendor ${req.params.id} not found.`);

  ActivityLogs.create({
    type: 'update',
    module: 'Vendors',
    actor: req.user?.name || 'System',
    description: `Updated vendor ${vendor.name}`,
    entityId: vendor.id,
    timestamp: new Date().toISOString(),
  });

  return ok(res, vendor);
});

export const remove = asyncHandler(async (req, res) => {
  const vendor = Vendors.findById(req.params.id);
  if (!vendor) return fail(res, 404, `Vendor ${req.params.id} not found.`);
  Vendors.remove(req.params.id);

  ActivityLogs.create({
    type: 'delete',
    module: 'Vendors',
    actor: req.user?.name || 'System',
    description: `Removed vendor ${vendor.name}`,
    entityId: vendor.id,
    timestamp: new Date().toISOString(),
  });

  return noContent(res);
});

export default { list, getById, create, update, remove };
