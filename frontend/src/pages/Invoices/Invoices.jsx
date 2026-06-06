import { useMemo, useState } from "react";
import {
  Search,
  ReceiptIndianRupee,
  Plus,
  X,
  ShoppingCart,
} from "lucide-react";

import PageHeader from "../../components/shared/PageHeader";
import DataTable from "../../components/shared/DataTable";
import StatusBadge from "../../components/shared/StatusBadge";
import InvoiceDetailModal from "./InvoiceDetailModal";
import InvoiceFormModal from "./InvoiceFormModal";
import { useInvoiceStore, usePurchaseOrderStore } from "../../store/dataStores";
import { usePermissions } from "../../hooks/usePermissions";
import { INVOICE_STATUS, MODULES } from "../../utils/constants";
import { formatCurrency, formatDate, daysUntil } from "../../utils/formatters";

export default function Invoices() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null); // invoice detail modal
  const [picking, setPicking] = useState(false); // PO picker open
  const [poForInvoice, setPoForInvoice] = useState(null); // chosen PO -> form modal

  const invoices = useInvoiceStore((s) => s.items);
  const addInvoice = useInvoiceStore((s) => s.add);
  const purchaseOrders = usePurchaseOrderStore((s) => s.items);
  const { canCreate } = usePermissions();

  const invoicedPoIds = useMemo(
    () => new Set(invoices.map((i) => i.poId).filter(Boolean)),
    [invoices],
  );

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return invoices;
    return invoices.filter(
      (i) =>
        i.invoiceNumber.toLowerCase().includes(q) ||
        i.vendorName.toLowerCase().includes(q) ||
        i.poNumber.toLowerCase().includes(q),
    );
  }, [query, invoices]);

  // Their InvoiceFormModal calls onSubmit(invoice); we persist + close here.
  const handleCreate = (invoice) => {
    addInvoice(invoice);
    setPoForInvoice(null);
  };

  const pickPo = (po) => {
    setPoForInvoice(po);
    setPicking(false);
  };

  const columns = [
    {
      key: "invoiceNumber",
      header: "Invoice",
      render: (i) => (
        <div>
          <p className="font-semibold text-primary-700">{i.invoiceNumber}</p>
          <p className="text-xs text-slate-500">{i.poNumber}</p>
        </div>
      ),
    },
    {
      key: "vendorName",
      header: "Vendor",
      render: (i) => <span className="text-slate-700">{i.vendorName}</span>,
    },
    {
      key: "tax",
      header: "GST",
      align: "right",
      render: (i) =>
        i.igst > 0 ? (
          <span className="text-xs text-slate-500">
            IGST {formatCurrency(i.igst)}
          </span>
        ) : (
          <span className="text-xs text-slate-500">
            CGST {formatCurrency(i.cgst)} + SGST {formatCurrency(i.sgst)}
          </span>
        ),
    },
    {
      key: "grandTotal",
      header: "Total",
      align: "right",
      render: (i) => (
        <span className="font-semibold text-slate-900">
          {formatCurrency(i.grandTotal)}
        </span>
      ),
    },
    {
      key: "dueDate",
      header: "Due Date",
      render: (i) => {
        const overdue = i.status === INVOICE_STATUS.OVERDUE;
        const d = daysUntil(i.dueDate);
        return (
          <div>
            <p
              className={
                overdue ? "font-medium text-danger-600" : "text-slate-700"
              }
            >
              {formatDate(i.dueDate)}
            </p>
            {i.status !== INVOICE_STATUS.PAID && (
              <p className="text-xs text-slate-400">
                {d >= 0
                  ? `due in ${d} day(s)`
                  : `${Math.abs(d)} day(s) overdue`}
              </p>
            )}
          </div>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      align: "center",
      render: (i) => <StatusBadge status={i.status} />,
    },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Invoices"
        subtitle={`${invoices.length} invoices on record`}
        actions={
          canCreate(MODULES.INVOICES) && (
            <button
              onClick={() => setPicking(true)}
              className="focus-ring inline-flex items-center gap-2 rounded-lg bg-primary-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-primary-700"
            >
              <Plus className="h-4 w-4" /> Generate Invoice
            </button>
          )
        }
      />

      <div className="mb-4 relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search invoice, vendor or PO…"
          className="focus-ring w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400"
        />
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        onRowClick={setSelected}
        emptyIcon={ReceiptIndianRupee}
        emptyTitle="No invoices found"
        emptyDescription="Try adjusting your search query."
      />

      {/* Invoice detail (your existing modal) */}
      {selected && (
        <InvoiceDetailModal
          invoice={selected}
          onClose={() => setSelected(null)}
        />
      )}

      {/* Step 1: pick the PO to invoice */}
      {picking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="relative flex w-full max-w-lg flex-col rounded-xl bg-white shadow-2xl max-h-[85vh]">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-primary-600" />
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Select Purchase Order
                  </h2>
                  <p className="text-sm text-slate-500">
                    Choose a PO to generate an invoice from
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPicking(false)}
                className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-y-auto p-3">
              {purchaseOrders.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-400">
                  No purchase orders available.
                </p>
              ) : (
                <ul className="space-y-1.5">
                  {purchaseOrders.map((po) => {
                    const already = invoicedPoIds.has(po.id);
                    return (
                      <li key={po.id}>
                        <button
                          onClick={() => pickPo(po)}
                          className="flex w-full items-center justify-between gap-3 rounded-lg border border-slate-200 px-4 py-3 text-left transition-colors hover:border-primary-300 hover:bg-primary-50/40"
                        >
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-slate-800">
                              {po.poNumber}
                            </p>
                            <p className="truncate text-xs text-slate-500">
                              {po.vendorName}
                            </p>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            {already && (
                              <span className="rounded-md bg-warning-50 px-1.5 py-0.5 text-[11px] font-medium text-warning-700">
                                invoiced
                              </span>
                            )}
                            <span className="text-sm font-semibold text-slate-900">
                              {formatCurrency(po.grandTotal)}
                            </span>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Step 2: your invoice form modal for the chosen PO */}
      {poForInvoice && (
        <InvoiceFormModal
          po={poForInvoice}
          onClose={() => setPoForInvoice(null)}
          onSubmit={handleCreate}
        />
      )}
    </div>
  );
}
