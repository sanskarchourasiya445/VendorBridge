// =============================================================================
// InvoiceFormModal — create an invoice from a PO with tax calculations.
// =============================================================================
import { useState } from "react";
import { X, FileText } from "lucide-react";
import { formatCurrency } from "../../utils/formatters";
import { nextDocId } from "../../utils/formatters";

const TAX_TYPES = [
  { label: "IGST (Inter-state 18%)", value: "igst" },
  { label: "CGST + SGST (Intra-state 18%)", value: "cgst_sgst" },
];

export default function InvoiceFormModal({ po, onClose, onSubmit }) {
  if (!po) return null;

  const today = new Date().toISOString().split("T")[0];
  const due = new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0];

  const [form, setForm] = useState({
    invoiceNumber: `INV-${po.vendorName.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
    invoiceDate: today,
    dueDate: due,
    taxType: "igst",
    note: "",
  });

  const taxRate = 0.18;
  const subtotal = po.subtotal;
  const taxAmount = Math.round(subtotal * taxRate);
  const grandTotal = subtotal + taxAmount;

  const igst = form.taxType === "igst" ? taxAmount : 0;
  const cgst = form.taxType === "cgst_sgst" ? Math.round(taxAmount / 2) : 0;
  const sgst = form.taxType === "cgst_sgst" ? Math.round(taxAmount / 2) : 0;

  const set = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = () => {
    onSubmit({
      invoiceNumber: form.invoiceNumber,
      poId: po.id,
      poNumber: po.poNumber,
      vendorId: po.vendorId,
      vendorName: po.vendorName,
      invoiceDate: form.invoiceDate,
      dueDate: form.dueDate,
      status: "pending",
      subtotal,
      cgst,
      sgst,
      igst,
      taxAmount,
      grandTotal,
      amountPaid: 0,
      paymentDate: null,
      paymentRef: null,
      note: form.note,
      items: po.items,
    });
  };

  const Field = ({ label, children }) => (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );

  const inputCls =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="relative w-full max-w-xl bg-white rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between rounded-t-xl z-10">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary-600" />
            <h2 className="text-lg font-bold text-slate-900">
              Generate Invoice
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* PO reference banner */}
          <div className="bg-primary-50 border border-primary-100 rounded-lg px-4 py-3 text-sm">
            <span className="text-primary-600 font-semibold">
              PO Reference:
            </span>{" "}
            <span className="text-primary-800">
              {po.poNumber} — {po.vendorName}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Invoice Number">
              <input
                className={inputCls}
                value={form.invoiceNumber}
                onChange={set("invoiceNumber")}
              />
            </Field>
            <Field label="Tax Type">
              <select
                className={inputCls}
                value={form.taxType}
                onChange={set("taxType")}
              >
                {TAX_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Invoice Date">
              <input
                type="date"
                className={inputCls}
                value={form.invoiceDate}
                onChange={set("invoiceDate")}
              />
            </Field>
            <Field label="Due Date">
              <input
                type="date"
                className={inputCls}
                value={form.dueDate}
                onChange={set("dueDate")}
              />
            </Field>
          </div>

          <Field label="Notes (optional)">
            <textarea
              className={inputCls}
              rows={2}
              value={form.note}
              onChange={set("note")}
              placeholder="Add any payment or delivery notes…"
            />
          </Field>

          {/* Tax breakdown */}
          <div className="bg-slate-50 rounded-lg p-4 space-y-2 border border-slate-200">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
              Invoice Summary
            </p>
            {[
              { label: "Subtotal", value: subtotal },
              form.taxType === "igst"
                ? { label: "IGST @ 18%", value: igst }
                : { label: `CGST @ 9% + SGST @ 9%`, value: taxAmount },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-slate-500">{label}</span>
                <span className="text-slate-700">{formatCurrency(value)}</span>
              </div>
            ))}
            <div className="flex justify-between font-bold text-base border-t border-slate-200 pt-2 mt-1">
              <span className="text-slate-800">Grand Total</span>
              <span className="text-primary-700">
                {formatCurrency(grandTotal)}
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-1">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
            >
              <FileText className="h-4 w-4" />
              Create Invoice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
