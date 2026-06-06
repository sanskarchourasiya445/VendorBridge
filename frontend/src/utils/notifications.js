// =============================================================================
// notifications — derive an alert feed from mock data (approvals, invoices,
// RFQs) and track read-state in localStorage. Used by the Activity &
// Notifications screen (and reusable by a header bell later).
// =============================================================================
import { daysUntil } from "./formatters";
import { APPROVALS, INVOICES, RFQS } from "../data/mockData";

const READ_KEY = "vendorbridge.notifications.read";

export function getReadIds() {
  try {
    return new Set(JSON.parse(localStorage.getItem(READ_KEY) || "[]"));
  } catch {
    return new Set();
  }
}

export function saveReadIds(idSet) {
  try {
    localStorage.setItem(READ_KEY, JSON.stringify([...idSet]));
  } catch {
    /* storage unavailable — read-state simply won't persist */
  }
}

export function buildNotifications() {
  const out = [];

  // ── Approval alerts ────────────────────────────────────────────────────────
  APPROVALS.filter((a) => a.status === "pending").forEach((a) => {
    out.push({
      id: `apr-${a.id}`,
      kind: "approval",
      severity:
        a.priority === "urgent" || a.priority === "high" ? "warning" : "info",
      title: "Approval pending",
      message: `${a.refNumber} — ${a.title} is awaiting a decision`,
      time: a.requestedDate,
      link: "/approvals",
    });
  });

  // ── Invoice updates ────────────────────────────────────────────────────────
  INVOICES.forEach((i) => {
    if (i.status === "overdue") {
      out.push({
        id: `inv-${i.id}`,
        kind: "invoice",
        severity: "danger",
        title: "Invoice overdue",
        message: `${i.invoiceNumber} (${i.vendorName}) is past its due date`,
        time: i.dueDate,
        link: "/invoices",
      });
    } else if (i.status !== "paid") {
      const d = daysUntil(i.dueDate);
      if (d >= 0 && d <= 7) {
        out.push({
          id: `inv-${i.id}`,
          kind: "invoice",
          severity: "warning",
          title: "Invoice due soon",
          message: `${i.invoiceNumber} (${i.vendorName}) is due in ${d} day(s)`,
          time: i.dueDate,
          link: "/invoices",
        });
      }
    }
  });

  // ── RFQ notifications ──────────────────────────────────────────────────────
  RFQS.forEach((r) => {
    if (r.status === "published") {
      const d = daysUntil(r.dueDate);
      if (d >= 0 && d <= 7) {
        out.push({
          id: `rfq-${r.id}`,
          kind: "rfq",
          severity: "warning",
          title: "RFQ closing soon",
          message: `${r.rfqNumber} closes in ${d} day(s) · ${r.quotationsReceived} quote(s) received`,
          time: r.dueDate,
          link: "/rfq",
        });
      } else {
        out.push({
          id: `rfq-${r.id}`,
          kind: "rfq",
          severity: "info",
          title: "RFQ open for quotations",
          message: `${r.rfqNumber} — ${r.title}`,
          time: r.publishedDate,
          link: "/rfq",
        });
      }
    } else if (r.status === "awarded") {
      out.push({
        id: `rfq-${r.id}`,
        kind: "rfq",
        severity: "info",
        title: "RFQ awarded",
        message: `${r.rfqNumber} — ${r.title}`,
        time: r.publishedDate,
        link: "/rfq",
      });
    }
  });

  return out.sort((a, b) => new Date(b.time) - new Date(a.time));
}

export default { buildNotifications, getReadIds, saveReadIds };
