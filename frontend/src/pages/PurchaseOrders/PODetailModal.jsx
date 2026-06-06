// =============================================================================
// PODetailModal — shows full PO details and a "Generate Invoice" button.
// =============================================================================
import {
  X,
  FileText,
  Building2,
  Calendar,
  MapPin,
  CheckCircle2,
  Package,
} from "lucide-react";
import StatusBadge from "../../components/shared/StatusBadge";
import { formatCurrency, formatDate } from "../../utils/formatters";

export default function PODetailModal({ po, onClose, onGenerateInvoice }) {
  if (!po) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between rounded-t-xl z-10">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{po.poNumber}</h2>
            <p className="text-sm text-slate-500">{po.vendorName}</p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={po.status} />
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Meta info */}
          <div className="grid grid-cols-2 gap-4">
            {[
              {
                icon: Calendar,
                label: "Issued Date",
                value: formatDate(po.issuedDate),
              },
              {
                icon: Calendar,
                label: "Expected Delivery",
                value: formatDate(po.expectedDelivery),
              },
              {
                icon: CheckCircle2,
                label: "Approved By",
                value: po.approvedBy,
              },
              {
                icon: FileText,
                label: "Payment Terms",
                value: po.paymentTerms,
              },
            ].map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg"
              >
                <Icon className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-slate-500">{label}</p>
                  <p className="text-sm font-medium text-slate-800">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Delivery address */}
          <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
            <MapPin className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-slate-500">Delivery Address</p>
              <p className="text-sm font-medium text-slate-800">
                {po.deliveryAddress}
              </p>
            </div>
          </div>

          {/* Line items */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Package className="h-4 w-4 text-slate-400" />
              <h3 className="text-sm font-semibold text-slate-700">
                Line Items
              </h3>
            </div>
            <div className="overflow-hidden rounded-lg border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    {["Item", "Qty", "Unit", "Unit Price", "Total"].map((h) => (
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
                  {po.items.map((item, i) => (
                    <tr key={i}>
                      <td className="px-3 py-2.5 text-sm text-slate-800">
                        {item.name}
                      </td>
                      <td className="px-3 py-2.5 text-sm text-slate-600">
                        {item.quantity}
                      </td>
                      <td className="px-3 py-2.5 text-sm text-slate-600">
                        {item.unit}
                      </td>
                      <td className="px-3 py-2.5 text-sm text-slate-600">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="px-3 py-2.5 text-sm font-medium text-slate-800">
                        {formatCurrency(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="bg-slate-50 rounded-lg p-4 space-y-2">
            {[
              { label: "Subtotal", value: po.subtotal },
              { label: "GST / Tax", value: po.taxAmount },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-slate-500">{label}</span>
                <span className="text-slate-700">{formatCurrency(value)}</span>
              </div>
            ))}
            <div className="flex justify-between text-base font-bold border-t border-slate-200 pt-2 mt-2">
              <span className="text-slate-800">Grand Total</span>
              <span className="text-primary-700">
                {formatCurrency(po.grandTotal)}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => onGenerateInvoice(po)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
            >
              <FileText className="h-4 w-4" />
              Generate Invoice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
