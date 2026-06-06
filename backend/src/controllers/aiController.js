// =============================================================================
// controllers/aiController.js — AI-assisted procurement endpoints.
// Accepts data inline (so the standalone frontend can call it directly) and
// also resolves from the backend's own data when only ids are supplied.
// =============================================================================
import { Rfqs, Quotations, Vendors, Invoices, Analytics } from '../models/index.js';
import * as ai from '../services/aiService.js';
import { ok, fail } from '../views/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/** Attach the vendor's rating onto a quotation (for scoring). */
function withVendorRating(q) {
  const vendor = Vendors.findById(q.vendorId) || Vendors.findOne((v) => v.name === q.vendorName);
  return { ...q, vendorRating: q.vendorRating ?? vendor?.rating ?? null };
}

export const status = asyncHandler(async (req, res) => ok(res, ai.aiStatus()));

// POST /api/ai/compare-quotations
// Body: { rfq?, quotations?, rfqId? }
export const compare = asyncHandler(async (req, res) => {
  let { rfq, quotations, rfqId } = req.body || {};

  // Resolve from backend data when the caller only sends an rfqId.
  if ((!quotations || !quotations.length) && rfqId) {
    rfq = rfq || Rfqs.findById(rfqId);
    quotations = Quotations.all((q) => q.rfqId === rfqId);
  }

  if (!Array.isArray(quotations) || quotations.length < 1) {
    return fail(res, 400, 'Provide `quotations` (array) or an `rfqId` with received quotations.');
  }

  const enriched = quotations.map(withVendorRating);
  const result = await ai.compareQuotations({ rfq: rfq || {}, quotations: enriched });
  return ok(res, result);
});

// POST /api/ai/generate-rfq   Body: { prompt }
export const draftRfq = asyncHandler(async (req, res) => {
  const { prompt } = req.body || {};
  if (!prompt || !String(prompt).trim()) {
    return fail(res, 400, 'A plain-language `prompt` describing the need is required.');
  }
  const result = await ai.generateRfq({ prompt: String(prompt) });
  return ok(res, result);
});

// POST /api/ai/insights   Body: { question }
export const insights = asyncHandler(async (req, res) => {
  const { question } = req.body || {};
  if (!question || !String(question).trim()) {
    return fail(res, 400, 'A `question` is required.');
  }

  // Build a compact, read-only context from the backend's own data.
  const context = {
    vendors: Vendors.all().map((v) => ({
      name: v.name, category: v.category, rating: v.rating, totalSpend: v.totalSpend, status: v.status,
    })),
    invoices: Invoices.all().map((i) => ({
      number: i.invoiceNumber, vendor: i.vendorName, total: i.grandTotal, status: i.status, dueDate: i.dueDate,
    })),
    spendByCategory: Analytics.spendByCategory(),
    monthlySpend: Analytics.monthlySpend(),
  };

  const result = await ai.askInsight({ question: String(question), context });
  return ok(res, result);
});

export default { status, compare, draftRfq, insights };
