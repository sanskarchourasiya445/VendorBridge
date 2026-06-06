// =============================================================================
// InvoiceDetailModal — view invoice, print, download PDF, send via email.
// =============================================================================
import { useState, useRef } from "react";
import {
  X,
  Printer,
  Download,
  Mail,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import StatusBadge from "../../components/shared/StatusBadge";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { useAuthStore } from "../../store/authStore";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export default function InvoiceDetailModal({ invoice, onClose }) {
  if (!invoice) return null;

  const token = useAuthStore((s) => s.token);
  const printRef = useRef();
  const [emailTo, setEmailTo] = useState("");
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState(null); // { type: 'success'|'error', msg }

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  // ── Print ──────────────────────────────────────────────────────────────────
  const handlePrint = () => {
    const content = printRef.current?.innerHTML;
    const win = window.open("", "_blank", "width=800,height=900");
    win.document.write(`
      <html><head><title>${invoice.invoiceNumber}</title>
      <style>
        body { font-family: sans-serif; padding: 40px; color: #1e293b; }
        h1 { color: #1e40af; } table { width: 100%; border-collapse: collapse; margin: 16px 0; }
        th { background: #f8fafc; text-align: left; padding: 8px 12px; font-size: 12px; text-transform: uppercase; color: #64748b; border: 1px solid #e2e8f0; }
        td { padding: 8px 12px; font-size: 13px; border: 1px solid #e2e8f0; }
        .total-row { font-weight: bold; font-size: 15px; }
        .label { color: #64748b; } .value { font-weight: 600; }
        @media print { body { padding: 20px; } }
      </style></head><body>${content}</body></html>
    `);
    win.document.close();
    win.focus();
    win.print();
    win.close();
  };

  // ── Download PDF (print-to-PDF via browser) ────────────────────────────────
  const handleDownloadPDF = () => {
    const content = printRef.current?.innerHTML;
    const win = window.open("", "_blank", "width=800,height=900");
    win.document.write(`
      <html><head><title>${invoice.invoiceNumber}</title>
      <style>
        body { font-family: sans-serif; padding: 40px; color: #1e293b; }
        h1 { color: #1e40af; } table { width: 100%; border-collapse: collapse; margin: 16px 0; }
        th { background: #f8fafc; text-align: left; padding: 8px 12px; font-size: 12px; text-transform: uppercase; color: #64748b; border: 1px solid #e2e8f0; }
        td { padding: 8px 12px; font-size: 13px; border: 1px solid #e2e8f0; }
        .total-row td { font-weight: bold; font-size: 15px; }
        @media print { body { padding: 20px; } }
      </style></head><body>${content}
      <script>window.onload=()=>{window.print();setTimeout(()=>window.close(),500)}<\/script>
      </body></html>
    `);
    win.document.close();
  };

  // ── Send Email ─────────────────────────────────────────────────────────────
  const handleSendEmail = async () => {
    if (!emailTo.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`${API}/invoices/${invoice.id}/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: emailTo,
          subject: `Invoice ${invoice.invoiceNumber} from VendorBridge`,
          message: `Please find invoice ${invoice.invoiceNumber} for ${formatCurrency(invoice.grandTotal)} due on ${formatDate(invoice.dueDate)}.`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("success", `Invoice sent to ${emailTo}`);
        setShowEmailForm(false);
        setEmailTo("");
      } else {
        showToast("error", data.message || "Failed to send email");
      }
    } catch {
      showToast("error", "Network error — could not send email");
    } finally {
      setSending(false);
    }
  };

  // ── Printable invoice HTML ─────────────────────────────────────────────────
  const PrintableInvoice = () => (
    <div ref={printRef} style={{ display: "none" }}>
      <h1>VendorBridge — Tax Invoice</h1>
      <p>
        <strong>Invoice No:</strong> {invoice.invoiceNumber} &nbsp;|&nbsp;{" "}
        <strong>PO:</strong> {invoice.poNumber}
      </p>
      <p>
        <strong>Vendor:</strong> {invoice.vendorName}
      </p>
      <p>
        <strong>Invoice Date:</strong> {formatDate(invoice.invoiceDate)}{" "}
        &nbsp;|&nbsp; <strong>Due Date:</strong> {formatDate(invoice.dueDate)}
      </p>
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Unit</th>
            <th>Unit Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {(invoice.items || []).map((item, i) => (
            <tr key={i}>
              <td>{item.name}</td>
              <td>{item.quantity}</td>
              <td>{item.unit}</td>
              <td>{formatCurrency(item.unitPrice)}</td>
              <td>
                {formatCurrency(item.total || item.unitPrice * item.quantity)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <table>
        <tbody>
          <tr>
            <td className="label">Subtotal</td>
            <td>{formatCurrency(invoice.subtotal)}</td>
          </tr>
          {invoice.igst > 0 && (
            <tr>
              <td className="label">IGST</td>
              <td>{formatCurrency(invoice.igst)}</td>
            </tr>
          )}
          {invoice.cgst > 0 && (
            <tr>
              <td className="label">CGST</td>
              <td>{formatCurrency(invoice.cgst)}</td>
            </tr>
          )}
          {invoice.sgst > 0 && (
            <tr>
              <td className="label">SGST</td>
              <td>{formatCurrency(invoice.sgst)}</td>
            </tr>
          )}
          <tr className="total-row">
            <td>
              <strong>Grand Total</strong>
            </td>
            <td>
              <strong>{formatCurrency(invoice.grandTotal)}</strong>
            </td>
          </tr>
        </tbody>
      </table>
      {invoice.paymentRef && (
        <p>
          <strong>Payment Ref:</strong> {invoice.paymentRef} on{" "}
          {formatDate(invoice.paymentDate)}
        </p>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <PrintableInvoice />

        {/* Toast */}
        {toast && (
          <div
            className={`fixed top-5 right-5 z-[60] flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium text-white ${toast.type === "success" ? "bg-success-600" : "bg-danger-600"}`}
          >
            {toast.type === "success" ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            {toast.msg}
          </div>
        )}

        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between rounded-t-xl z-10">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {invoice.invoiceNumber}
            </h2>
            <p className="text-sm text-slate-500">
              {invoice.vendorName} · {invoice.poNumber}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={invoice.status} />
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Dates row */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Invoice Date", value: formatDate(invoice.invoiceDate) },
              { label: "Due Date", value: formatDate(invoice.dueDate) },
              {
                label: "Payment Terms",
                value: invoice.paymentTerms || "Net 30",
              },
              {
                label: "Amount Paid",
                value: formatCurrency(invoice.amountPaid || 0),
              },
            ].map(({ label, value }) => (
              <div key={label} className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500">{label}</p>
                <p className="text-sm font-semibold text-slate-800 mt-0.5">
                  {value}
                </p>
              </div>
            ))}
          </div>

          {/* Line items */}
          {invoice.items?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                Line Items
              </p>
              <div className="overflow-hidden rounded-lg border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      {["Item", "Qty", "Unit Price", "Total"].map((h) => (
                        <th
                          key={h}
                          className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {invoice.items.map((item, i) => (
                      <tr key={i}>
                        <td className="px-3 py-2.5 text-sm text-slate-800">
                          {item.name}
                        </td>
                        <td className="px-3 py-2.5 text-sm text-slate-600">
                          {item.quantity} {item.unit}
                        </td>
                        <td className="px-3 py-2.5 text-sm text-slate-600">
                          {formatCurrency(item.unitPrice)}
                        </td>
                        <td className="px-3 py-2.5 text-sm font-medium text-slate-800">
                          {formatCurrency(
                            item.total || item.unitPrice * item.quantity,
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tax & totals */}
          <div className="bg-slate-50 rounded-lg p-4 space-y-2 border border-slate-200">
            {[
              { label: "Subtotal", value: invoice.subtotal },
              ...(invoice.igst > 0
                ? [{ label: "IGST", value: invoice.igst }]
                : []),
              ...(invoice.cgst > 0
                ? [{ label: "CGST", value: invoice.cgst }]
                : []),
              ...(invoice.sgst > 0
                ? [{ label: "SGST", value: invoice.sgst }]
                : []),
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-slate-500">{label}</span>
                <span className="text-slate-700">{formatCurrency(value)}</span>
              </div>
            ))}
            <div className="flex justify-between font-bold text-base border-t border-slate-200 pt-2">
              <span className="text-slate-800">Grand Total</span>
              <span className="text-primary-700">
                {formatCurrency(invoice.grandTotal)}
              </span>
            </div>
          </div>

          {/* Payment ref */}
          {invoice.paymentRef && (
            <div className="bg-success-50 border border-success-200 rounded-lg p-3 text-sm">
              <span className="font-semibold text-success-700">
                Payment Received:{" "}
              </span>
              <span className="text-success-600">
                {invoice.paymentRef} on {formatDate(invoice.paymentDate)}
              </span>
            </div>
          )}

          {/* Notes */}
          {invoice.note && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm text-slate-600">
              <span className="font-semibold text-slate-700">Note: </span>
              {invoice.note}
            </div>
          )}

          {/* Email form */}
          {showEmailForm && (
            <div className="border border-slate-200 rounded-lg p-4 space-y-3 bg-slate-50">
              <p className="text-sm font-semibold text-slate-700">
                Send Invoice via Email
              </p>
              <input
                type="email"
                value={emailTo}
                onChange={(e) => setEmailTo(e.target.value)}
                placeholder="recipient@example.com"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setShowEmailForm(false)}
                  className="px-3 py-1.5 text-sm text-slate-600 border border-slate-300 rounded-lg hover:bg-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendEmail}
                  disabled={sending || !emailTo.trim()}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
                >
                  {sending ? (
                    "Sending…"
                  ) : (
                    <>
                      <Mail className="h-3.5 w-3.5" /> Send
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap justify-end gap-2 pt-1 border-t border-slate-100">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Printer className="h-4 w-4" /> Print
            </button>
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Download className="h-4 w-4" /> Download PDF
            </button>
            <button
              onClick={() => setShowEmailForm((v) => !v)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Mail className="h-4 w-4" /> Send via Email
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
