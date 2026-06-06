import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  ClipboardCheck,
  User,
  Calendar,
  IndianRupee,
  Check,
  X,
} from "lucide-react";
import StatusBadge from "../../components/shared/StatusBadge";
import EmptyState from "../../components/shared/EmptyState";
import { APPROVALS } from "../../data/mockData";
import { usePermissions } from "../../hooks/usePermissions";
import { MODULES, APPROVAL_STATUS } from "../../utils/constants";
import { formatCurrency, formatDate, humanize } from "../../utils/formatters";

export default function ApprovalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { canApprove } = usePermissions();
  const [reason, setReason] = useState("");
  const approval = APPROVALS.find((a) => a.id === id);

  if (!approval) {
    return (
      <div className="animate-fade-in">
        <button
          onClick={() => navigate("/approvals")}
          className="focus-ring mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Approvals
        </button>
        <EmptyState
          icon={ClipboardCheck}
          title="Request not found"
          description="It may have been removed."
        />
      </div>
    );
  }

  const allowed = canApprove(MODULES.APPROVALS);
  const pending = approval.status === APPROVAL_STATUS.PENDING;

  const decide = (status) => {
    if (status === APPROVAL_STATUS.REJECTED && !reason.trim()) {
      toast.error("Please add a reason for rejection.");
      return;
    }
    approval.status = status; // session-level update (mockData shared in memory)
    approval.decidedDate = new Date().toISOString().slice(0, 10);
    if (reason.trim()) approval.rejectionReason = reason.trim();
    toast.success(
      status === APPROVAL_STATUS.APPROVED
        ? "Request approved."
        : "Request rejected.",
    );
    navigate("/approvals");
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <button
          onClick={() => navigate("/approvals")}
          className="focus-ring mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Approvals
        </button>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
              <ClipboardCheck className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                {approval.title}
              </h1>
              <p className="text-sm text-slate-500">
                {humanize(approval.type)} · {approval.refNumber}
              </p>
            </div>
          </div>
          <StatusBadge status={approval.status} />
        </div>
      </div>

      <div className="space-y-5 rounded-xl border border-slate-200 bg-white p-5 shadow-card sm:p-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex items-start gap-3 rounded-lg bg-slate-50 p-3">
            <IndianRupee className="mt-0.5 h-4 w-4 text-slate-400" />
            <div>
              <p className="text-xs text-slate-500">Amount</p>
              <p className="text-base font-bold text-slate-900">
                {formatCurrency(approval.amount)}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg bg-slate-50 p-3">
            <ClipboardCheck className="mt-0.5 h-4 w-4 text-slate-400" />
            <div>
              <p className="text-xs text-slate-500">Priority</p>
              <div className="mt-0.5">
                <StatusBadge status={approval.priority} />
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg bg-slate-50 p-3">
            <User className="mt-0.5 h-4 w-4 text-slate-400" />
            <div>
              <p className="text-xs text-slate-500">Requested By</p>
              <p className="text-sm font-medium text-slate-800">
                {approval.requestedBy}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg bg-slate-50 p-3">
            <Calendar className="mt-0.5 h-4 w-4 text-slate-400" />
            <div>
              <p className="text-xs text-slate-500">Requested On</p>
              <p className="text-sm font-medium text-slate-800">
                {formatDate(approval.requestedDate)}
              </p>
            </div>
          </div>
        </div>

        {approval.assignedTo && (
          <p className="text-sm text-slate-600">
            Assigned to{" "}
            <span className="font-semibold text-slate-800">
              {approval.assignedTo}
            </span>
            {approval.decidedDate &&
              ` · decided ${formatDate(approval.decidedDate)}`}
          </p>
        )}

        {approval.rejectionReason && (
          <p className="rounded-lg border border-danger-200 bg-danger-50 p-3 text-sm text-danger-700">
            <span className="font-semibold">Reason: </span>
            {approval.rejectionReason}
          </p>
        )}

        {pending && allowed && (
          <>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                Decision note (required to reject)
              </label>
              <textarea
                rows={2}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Add an optional note or rejection reason…"
                className="focus-ring w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
              />
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                onClick={() => decide(APPROVAL_STATUS.REJECTED)}
                className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-danger-200 bg-danger-50 px-4 py-2 text-sm font-semibold text-danger-700 hover:bg-danger-100"
              >
                <X className="h-4 w-4" /> Reject
              </button>
              <button
                onClick={() => decide(APPROVAL_STATUS.APPROVED)}
                className="focus-ring inline-flex items-center gap-1.5 rounded-lg bg-success-600 px-4 py-2 text-sm font-semibold text-white hover:bg-success-700"
              >
                <Check className="h-4 w-4" /> Approve
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
