import { useMemo, useState } from "react";
import { Search, ReceiptIndianRupee } from "lucide-react";

import PageHeader from "../../components/shared/PageHeader";
import DataTable from "../../components/shared/DataTable";
import StatusBadge from "../../components/shared/StatusBadge";
import InvoiceDetailModal from "./InvoiceDetailModal";
import { INVOICES } from "../../data/mockData";
import { INVOICE_STATUS } from "../../utils/constants";
import { formatCurrency, formatDate, daysUntil } from "../../utils/formatters";

export default function Invoices() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return INVOICES;
    return INVOICES.filter(
      (i) =>
        i.invoiceNumber.toLowerCase().includes(q) ||
        i.vendorName.toLowerCase().includes(q) ||
        i.poNumber.toLowerCase().includes(q),
    );
  }, [query]);

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
        subtitle={`${INVOICES.length} invoices on record`}
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

      {selected && (
        <InvoiceDetailModal
          invoice={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
