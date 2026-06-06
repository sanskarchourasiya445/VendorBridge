// =============================================================================
// Activity Logs & Notifications — keeps users informed about procurement.
//   • Notifications feed: RFQ alerts, approval alerts, invoice updates
//     (read / unread state persisted in localStorage)
//   • Activity timeline: full audit log across all modules
// Client-side from mock data, consistent with the rest of the app.
// =============================================================================
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";
import {
  Bell,
  CheckCheck,
  ClipboardCheck,
  ReceiptIndianRupee,
  FileQuestion,
  Search,
  Activity,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  LogIn,
  LogOut,
  Download,
  RefreshCw,
} from "lucide-react";

import PageHeader from "../../components/shared/PageHeader";
import EmptyState from "../../components/shared/EmptyState";
import { ACTIVITY_LOGS } from "../../data/mockData";
import { ACTIVITY_TYPES } from "../../utils/constants";
import { formatDateTime, formatRelativeTime } from "../../utils/formatters";
import {
  buildNotifications,
  getReadIds,
  saveReadIds,
} from "../../utils/notifications";

// ── Notification presentation ─────────────────────────────────────────────────
const KIND_META = {
  approval: { icon: ClipboardCheck, label: "Approval" },
  invoice: { icon: ReceiptIndianRupee, label: "Invoice" },
  rfq: { icon: FileQuestion, label: "RFQ" },
};
const SEVERITY = {
  danger: "bg-danger-50 text-danger-600 ring-danger-100",
  warning: "bg-warning-50 text-warning-600 ring-warning-100",
  info: "bg-primary-50 text-primary-600 ring-primary-100",
};

// ── Activity-log presentation ───────────────────────────────────────────────
const TYPE_META = {
  [ACTIVITY_TYPES.CREATE]: {
    icon: Plus,
    tone: "bg-primary-50 text-primary-600",
  },
  [ACTIVITY_TYPES.UPDATE]: {
    icon: Pencil,
    tone: "bg-warning-50 text-warning-600",
  },
  [ACTIVITY_TYPES.DELETE]: {
    icon: Trash2,
    tone: "bg-danger-50 text-danger-600",
  },
  [ACTIVITY_TYPES.APPROVE]: {
    icon: Check,
    tone: "bg-success-50 text-success-600",
  },
  [ACTIVITY_TYPES.REJECT]: { icon: X, tone: "bg-danger-50 text-danger-600" },
  [ACTIVITY_TYPES.LOGIN]: { icon: LogIn, tone: "bg-slate-100 text-slate-600" },
  [ACTIVITY_TYPES.LOGOUT]: {
    icon: LogOut,
    tone: "bg-slate-100 text-slate-600",
  },
  [ACTIVITY_TYPES.EXPORT]: {
    icon: Download,
    tone: "bg-primary-50 text-primary-600",
  },
  [ACTIVITY_TYPES.STATUS_CHANGE]: {
    icon: RefreshCw,
    tone: "bg-warning-50 text-warning-600",
  },
};

export default function ActivityLogs() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("notifications");
  const [query, setQuery] = useState("");
  const [readIds, setReadIds] = useState(() => getReadIds());

  const notifications = useMemo(() => buildNotifications(), []);
  const unreadCount = notifications.filter((n) => !readIds.has(n.id)).length;

  const markRead = (id) => {
    setReadIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      saveReadIds(next);
      return next;
    });
  };

  const markAllRead = () => {
    const next = new Set(notifications.map((n) => n.id));
    saveReadIds(next);
    setReadIds(next);
  };

  const openNotification = (n) => {
    markRead(n.id);
    navigate(n.link);
  };

  const logs = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = q
      ? ACTIVITY_LOGS.filter(
          (l) =>
            l.description.toLowerCase().includes(q) ||
            l.actor.toLowerCase().includes(q) ||
            l.module.toLowerCase().includes(q),
        )
      : ACTIVITY_LOGS;
    return [...base].sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp),
    );
  }, [query]);

  const TabButton = ({ id, label, badge }) => (
    <button
      onClick={() => setTab(id)}
      className={clsx(
        "relative inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors",
        tab === id
          ? "bg-primary-600 text-white"
          : "text-slate-600 hover:bg-slate-100",
      )}
    >
      {label}
      {badge > 0 && (
        <span
          className={clsx(
            "inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1.5 text-xs font-bold",
            tab === id ? "bg-white/25 text-white" : "bg-danger-500 text-white",
          )}
        >
          {badge}
        </span>
      )}
    </button>
  );

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Activity & Notifications"
        subtitle="Procurement alerts and a full audit trail of platform activity"
        actions={
          tab === "notifications" &&
          unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="focus-ring inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <CheckCheck className="h-4 w-4" /> Mark all read
            </button>
          )
        }
      />

      {/* Tabs */}
      <div className="mb-5 flex items-center gap-2">
        <TabButton
          id="notifications"
          label="Notifications"
          badge={unreadCount}
        />
        <TabButton id="activity" label="Activity Log" />
      </div>

      {/* Notifications tab */}
      {tab === "notifications" &&
        (notifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="You're all caught up"
            description="No procurement alerts right now."
          />
        ) : (
          <div className="space-y-2.5">
            {notifications.map((n) => {
              const meta = KIND_META[n.kind] || KIND_META.rfq;
              const Icon = meta.icon;
              const unread = !readIds.has(n.id);
              return (
                <button
                  key={n.id}
                  onClick={() => openNotification(n)}
                  className={clsx(
                    "flex w-full items-start gap-3 rounded-lg border p-4 text-left shadow-card transition-colors",
                    unread
                      ? "border-slate-200 bg-white hover:bg-slate-50"
                      : "border-slate-100 bg-slate-50/60 hover:bg-slate-50",
                  )}
                >
                  <div
                    className={clsx(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ring-4",
                      SEVERITY[n.severity],
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p
                        className={clsx(
                          "truncate text-sm",
                          unread
                            ? "font-semibold text-slate-900"
                            : "font-medium text-slate-600",
                        )}
                      >
                        {n.title}
                      </p>
                      <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-500">
                        {meta.label}
                      </span>
                      {unread && (
                        <span className="h-2 w-2 shrink-0 rounded-full bg-primary-500" />
                      )}
                    </div>
                    <p className="mt-0.5 truncate text-sm text-slate-500">
                      {n.message}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {formatRelativeTime(n.time)}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        ))}

      {/* Activity tab */}
      {tab === "activity" && (
        <>
          <div className="relative mb-4 max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search activity, actor or module…"
              className="focus-ring w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400"
            />
          </div>

          {logs.length === 0 ? (
            <EmptyState
              icon={Activity}
              title="No activity found"
              description="Try adjusting your search query."
            />
          ) : (
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-card">
              <ol className="space-y-5">
                {logs.map((log) => {
                  const meta =
                    TYPE_META[log.type] || TYPE_META[ACTIVITY_TYPES.UPDATE];
                  const Icon = meta.icon;
                  return (
                    <li key={log.id} className="flex gap-3">
                      <div
                        className={clsx(
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                          meta.tone,
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-slate-800">
                          {log.description}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-400">
                          <span className="font-medium text-slate-500">
                            {log.actor}
                          </span>{" "}
                          · {log.module} · {formatDateTime(log.timestamp)} ·{" "}
                          {formatRelativeTime(log.timestamp)}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          )}
        </>
      )}
    </div>
  );
}
