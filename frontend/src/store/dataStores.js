// =============================================================================
// dataStores — one dynamic store per module, each seeded from static mock data.
// Pages read `useXStore((s) => s.items)`; forms call `useXStore((s) => s.add)`,
// `.update(id, patch)` and `.remove(id)`. CRUD reflects live across the app.
// =============================================================================
import { createEntityStore } from "./createEntityStore";
import {
  VENDORS,
  RFQS,
  QUOTATIONS,
  PURCHASE_ORDERS,
  INVOICES,
  APPROVALS,
  ACTIVITY_LOGS,
  USER_DIRECTORY,
} from "../data/mockData";

export const useVendorStore = createEntityStore(VENDORS, { idPrefix: "VEN" });
export const useRfqStore = createEntityStore(RFQS, { idPrefix: "RFQ" });
export const useQuotationStore = createEntityStore(QUOTATIONS, {
  idPrefix: "QT",
});
export const usePurchaseOrderStore = createEntityStore(PURCHASE_ORDERS, {
  idPrefix: "PO",
});
export const useInvoiceStore = createEntityStore(INVOICES, { idPrefix: "INV" });
export const useApprovalStore = createEntityStore(APPROVALS, {
  idPrefix: "APR",
});
export const useActivityStore = createEntityStore(ACTIVITY_LOGS, {
  idPrefix: "LOG",
});
export const useUserStore = createEntityStore(USER_DIRECTORY, {
  idPrefix: "USR",
});
