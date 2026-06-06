// =============================================================================
// reportExport — reusable export helpers.
//   • downloadCSV(filename, headers, rows)  → triggers a .csv download
//   • openPrintReport(title, bodyHtml)      → opens a styled print/PDF window
// Matches the print-to-window approach used in InvoiceDetailModal.
// =============================================================================

const csvEscape = (value) => {
  const s = value == null ? "" : String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export function downloadCSV(filename, headers, rows) {
  const lines = [headers.map(csvEscape).join(",")];
  for (const row of rows) lines.push(row.map(csvEscape).join(","));
  const blob = new Blob(["\uFEFF" + lines.join("\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function openPrintReport(title, bodyHtml) {
  const win = window.open("", "_blank", "width=900,height=1000");
  if (!win) return;
  win.document.write(
    `
    <html><head><title>${title}</title>
    <style>
      * { box-sizing: border-box; }
      body { font-family: ui-sans-serif, system-ui, sans-serif; padding: 40px; color: #1e293b; }
      .brand { background: #1e40af; color: #fff; padding: 18px 24px; border-radius: 8px; }
      .brand h1 { margin: 0; font-size: 20px; }
      .brand p { margin: 4px 0 0; font-size: 12px; color: #bfdbfe; }
      h2 { font-size: 15px; color: #1e293b; margin: 28px 0 10px; }
      .kpis { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 16px; }
      .kpi { flex: 1 1 160px; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 14px; }
      .kpi .l { font-size: 11px; text-transform: uppercase; letter-spacing: .04em; color: #64748b; }
      .kpi .v { font-size: 18px; font-weight: 700; margin-top: 4px; }
      table { width: 100%; border-collapse: collapse; margin: 8px 0 4px; }
      th { background: #f8fafc; text-align: left; padding: 8px 12px; font-size: 11px; text-transform: uppercase; color: #64748b; border: 1px solid #e2e8f0; }
      td { padding: 8px 12px; font-size: 13px; border: 1px solid #e2e8f0; }
      td.r, th.r { text-align: right; }
      .muted { color: #94a3b8; font-size: 12px; margin-top: 28px; border-top: 1px solid #e2e8f0; padding-top: 14px; }
      @media print { body { padding: 20px; } }
    </style></head>
    <body>${bodyHtml}
    <script>window.onload=()=>{window.print();setTimeout(()=>window.close(),400)}</scr` +
      `ipt>
    </body></html>
  `,
  );
  win.document.close();
}

export default { downloadCSV, openPrintReport };
