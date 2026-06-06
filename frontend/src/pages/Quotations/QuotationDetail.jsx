import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  ReceiptText,
  Calendar,
  Clock,
  CreditCard,
  CheckCircle2,
  XCircle,
  ListChecks,
} from "lucide-react";
import StatusBadge from "../../components/shared/StatusBadge";
import EmptyState from "../../components/shared/EmptyState";
import { QUOTATIONS } from "../../data/mockData";
import { usePermissions } from "../../hooks/usePermissions";
import { MODULES, QUOTATION_STATUS } from "../../utils/constants";
import { formatCurrency, formatDate } from "../../utils/formatters";

function Meta({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 rounded-lg bg-slate-50 p-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-sm font-medium text-slate-800">{value}</p>
      </div>
    </div>
  );
}

export default function QuotationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { canEdit } = usePermissions();
  const quotation = QUOTATIONS.find((q) => q.id === id);

  if (!quotation) {
    return (
      <div className="animate-fade-in">
        <button
          onClick={() => navigate("/quotations")}
          className="focus-ring mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Quotations
        </button>
        <EmptyState
          icon={ReceiptText}
          title="Quotation not found"
          description="It may have been removed."
        />
      </div>
    );
  }

  const editable = canEdit(MODULES.QUOTATIONS);
  const isFinal =
    quotation.status === QUOTATION_STATUS.ACCEPTED ||
    quotation.status === QUOTATION_STATUS.REJECTED;

  const decide = (status) => {
    quotation.status = status; // session-level update (mockData is shared in memory)
    toast.success(`Quotation marked ${status.replace(/_/g, " ")}.`);
    navigate("/quotations");
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <button
          onClick={() => navigate("/quotations")}
          className="focus-ring mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Quotations
        </button>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
              <ReceiptText className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                {quotation.quotationNumber}
              </h1>
              <p className="text-sm text-slate-500">
                {quotation.vendorName} · against {quotation.rfqNumber}
              </p>
            </div>
          </div>
          <StatusBadge status={quotation.status} />
        </div>
      </div>

      <div className="space-y-5 rounded-xl border border-slate-200 bg-white p-5 shadow-card sm:p-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Meta
            icon={Calendar}
            label="Submitted"
            value={formatDate(quotation.submittedDate)}
          />
          <Meta
            icon={Calendar}
            label="Valid Until"
            value={formatDate(quotation.validUntil)}
          />
          <Meta
            icon={Clock}
            label="Delivery"
            value={`${quotation.deliveryDays} days`}
          />
          <Meta
            icon={CreditCard}
            label="Payment"
            value={quotation.paymentTerms}
          />
        </div>

        <div>
          <h3 className="mb-2 text-sm font-semibold text-slate-700">
            Line Items
          </h3>
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
                {(quotation.items || []).map((item, i) => (
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
                      {formatCurrency(
                        (item.unitPrice || 0) * (item.quantity || 0),
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-2 rounded-lg bg-slate-50 p-4 sm:ml-auto sm:max-w-sm">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Subtotal</span>
            <span className="text-slate-700">
              {formatCurrency(quotation.subtotal)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">GST / Tax</span>
            <span className="text-slate-700">
              {formatCurrency(quotation.taxAmount)}
            </span>
          </div>
          <div className="mt-1 flex justify-between border-t border-slate-200 pt-2 text-base font-bold">
            <span className="text-slate-800">Grand Total</span>
            <span className="text-primary-700">
              {formatCurrency(quotation.grandTotal)}
            </span>
          </div>
        </div>

        {quotation.notes && (
          <p className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-600">
            <span className="font-semibold text-slate-700">Notes: </span>
            {quotation.notes}
          </p>
        )}

        {editable && !isFinal && (
          <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
            <button
              onClick={() => decide(QUOTATION_STATUS.SHORTLISTED)}
              className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-primary-200 bg-primary-50 px-4 py-2 text-sm font-semibold text-primary-700 hover:bg-primary-100"
            >
              <ListChecks className="h-4 w-4" /> Shortlist
            </button>
            <button
              onClick={() => decide(QUOTATION_STATUS.REJECTED)}
              className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-danger-200 bg-danger-50 px-4 py-2 text-sm font-semibold text-danger-700 hover:bg-danger-100"
            >
              <XCircle className="h-4 w-4" /> Reject
            </button>
            <button
              onClick={() => decide(QUOTATION_STATUS.ACCEPTED)}
              className="focus-ring inline-flex items-center gap-1.5 rounded-lg bg-success-600 px-4 py-2 text-sm font-semibold text-white hover:bg-success-700"
            >
              <CheckCircle2 className="h-4 w-4" /> Accept
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
