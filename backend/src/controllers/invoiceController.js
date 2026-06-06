import nodemailer from "nodemailer";
import { Invoices } from "../models/index.js";
import { crudFactory } from "./crudFactory.js";
import { config } from "../config/env.js";

const base = crudFactory(Invoices, {
  label: "Invoice",
  searchFields: ["invoiceNumber", "vendorName", "poNumber"],
});

export const { list, getById, create, update, remove } = base;

export const sendEmail = async (req, res) => {
  try {
    const invoice = Invoices.findById(req.params.id);
    if (!invoice)
      return res
        .status(404)
        .json({ success: false, message: "Invoice not found" });

    const { to, subject, message } = req.body;
    if (!to)
      return res
        .status(400)
        .json({ success: false, message: "Recipient email is required" });

    const transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: false,
      auth: { user: config.email.user, pass: config.email.pass },
    });

    const html = `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;border:1px solid #e2e8f0;border-radius:8px">
        <div style="background:#1e40af;padding:16px 24px;border-radius:6px 6px 0 0;margin:-24px -24px 24px">
          <h1 style="color:white;margin:0;font-size:20px">VendorBridge</h1>
          <p style="color:#bfdbfe;margin:4px 0 0;font-size:13px">Procurement & Vendor Management</p>
        </div>
        <h2 style="color:#1e293b;font-size:18px">Invoice ${invoice.invoiceNumber}</h2>
        <p style="color:#475569">${message || `Please find the invoice ${invoice.invoiceNumber} attached for your reference.`}</p>
        <table style="width:100%;border-collapse:collapse;margin:20px 0">
          <tr style="background:#f8fafc">
            <td style="padding:10px 12px;color:#64748b;font-size:13px;border:1px solid #e2e8f0">Invoice Number</td>
            <td style="padding:10px 12px;color:#1e293b;font-weight:600;font-size:13px;border:1px solid #e2e8f0">${invoice.invoiceNumber}</td>
          </tr>
          <tr>
            <td style="padding:10px 12px;color:#64748b;font-size:13px;border:1px solid #e2e8f0">PO Number</td>
            <td style="padding:10px 12px;color:#1e293b;font-size:13px;border:1px solid #e2e8f0">${invoice.poNumber}</td>
          </tr>
          <tr style="background:#f8fafc">
            <td style="padding:10px 12px;color:#64748b;font-size:13px;border:1px solid #e2e8f0">Vendor</td>
            <td style="padding:10px 12px;color:#1e293b;font-size:13px;border:1px solid #e2e8f0">${invoice.vendorName}</td>
          </tr>
          <tr>
            <td style="padding:10px 12px;color:#64748b;font-size:13px;border:1px solid #e2e8f0">Amount Due</td>
            <td style="padding:10px 12px;color:#1e293b;font-weight:700;font-size:14px;border:1px solid #e2e8f0">₹${invoice.grandTotal?.toLocaleString("en-IN")}</td>
          </tr>
          <tr style="background:#f8fafc">
            <td style="padding:10px 12px;color:#64748b;font-size:13px;border:1px solid #e2e8f0">Due Date</td>
            <td style="padding:10px 12px;color:#dc2626;font-weight:600;font-size:13px;border:1px solid #e2e8f0">${invoice.dueDate}</td>
          </tr>
        </table>
        <p style="color:#94a3b8;font-size:12px;margin-top:32px;border-top:1px solid #e2e8f0;padding-top:16px">
          This is an automated email from VendorBridge ERP. Please do not reply to this email.
        </p>
      </div>
    `;

    await transporter.sendMail({
      from: config.email.from,
      to,
      subject: subject || `Invoice ${invoice.invoiceNumber} from VendorBridge`,
      html,
    });

    res.json({ success: true, message: `Invoice sent to ${to}` });
  } catch (err) {
    console.error("[email] send failed:", err.message);
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to send email: " + err.message,
      });
  }
};

export default base;
