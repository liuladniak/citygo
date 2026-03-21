import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

interface InvoiceProps {
  booking: any;
  company: any;
}

export function DownloadInvoiceButton({ booking, company }: InvoiceProps) {
  if (!booking) return null;

  const handlePrintInvoice = () => {
    const invoiceNumber = `INV-${booking.booking_reference}`;
    const issueDate = new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const tourDate = new Date(booking.tour_date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const adults = booking.guest_distribution?.adults ?? 0;
    const children = booking.guest_distribution?.children ?? 0;
    const infants = booking.guest_distribution?.infants ?? 0;
    const totalGuests = adults + children + infants;
    const totalPrice = Number(booking.total_price);
    const amountPaid = Number(booking.amount_paid);
    const balance = totalPrice - amountPaid;
    const isPaid = balance <= 0;

    const unitPrice = totalGuests > 0 ? totalPrice / totalGuests : totalPrice;
    const childPrice = unitPrice * 0.5;

    const win = window.open("", "_blank");
    if (!win) return;

    win.document.write(`
      <html>
        <head>
          <title>Invoice - ${invoiceNumber}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #111; background: white; font-size: 13px; }
            .page { max-width: 760px; margin: 0 auto; padding: 48px; }

            /* Header */
            .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 36px; }
            .brand { font-size: 22px; font-weight: 800; }
            .brand-sub { font-size: 11px; color: #888; margin-top: 3px; line-height: 1.6; }
            .invoice-label { font-size: 28px; font-weight: 800; text-align: right; letter-spacing: -0.5px; }
            .invoice-meta { font-size: 11px; color: #888; text-align: right; margin-top: 4px; line-height: 1.8; }
            .badge { display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; margin-top: 8px; }
            .badge-paid { background: #dcfce7; color: #166534; }
            .badge-due { background: #fef3c7; color: #92400e; }

            /* Divider */
            hr { border: none; border-top: 1px solid #e5e7eb; margin: 24px 0; }

            /* Bill to */
            .section-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #888; margin-bottom: 8px; }
            .bill-to { margin-bottom: 28px; }
            .bill-name { font-size: 15px; font-weight: 700; margin-bottom: 3px; }
            .bill-sub { font-size: 12px; color: #666; line-height: 1.6; }

            /* Table */
            .table { width: 100%; border-collapse: collapse; margin-top: 8px; }
            .table thead tr { background: #f9fafb; }
            .table th { padding: 8px 12px; text-align: left; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #888; }
            .table th.right { text-align: right; }
            .table th.center { text-align: center; }
            .table td { padding: 10px 12px; border-bottom: 1px solid #f3f4f6; vertical-align: top; }
            .table td.right { text-align: right; }
            .table td.center { text-align: center; }
            .table .sub-row td { background: #fafafa; color: #666; font-size: 12px; }
            .item-name { font-weight: 600; margin-bottom: 3px; }
            .item-meta { font-size: 11px; color: #888; line-height: 1.5; }

            /* Totals */
            .totals { margin-top: 16px; display: flex; justify-content: flex-end; }
            .totals-table { width: 260px; }
            .totals-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 13px; }
            .totals-row.grand { border-top: 2px solid #111; margin-top: 6px; padding-top: 8px; font-weight: 700; font-size: 14px; }
            .totals-row .lbl { color: #666; }
            .totals-row.grand .lbl { color: #111; }
            .paid-color { color: #16a34a; }
            .due-color { color: #dc2626; }

            /* Payment history */
            .payment-row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 12px; border-bottom: 1px solid #f3f4f6; }
            .payment-row:last-child { border-bottom: none; }

            /* Footer */
            .footer { margin-top: 48px; border-top: 1px solid #e5e7eb; padding-top: 16px; display: flex; justify-content: space-between; font-size: 10px; color: #aaa; }

            @media print {
              body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
              .page { padding: 32px; }
            }
          </style>
        </head>
        <body>
          <div class="page">
            <!-- Header -->
            <div class="header">
              <div>
                <div class="brand">${company?.name ?? "CityGo Tours"}</div>
                <div class="brand-sub">
                  ${
                    company?.address
                      ? `${company.address}${
                          company.city ? `, ${company.city}` : ""
                        }${company.country ? `, ${company.country}` : ""}<br/>`
                      : ""
                  }
                  ${company?.email ? `${company.email}<br/>` : ""}
                  ${company?.phone ? `${company.phone}<br/>` : ""}
                  ${company?.vat_number ? `VAT: ${company.vat_number}` : ""}
                </div>
              </div>
              <div style="text-align:right">
                <div class="invoice-label">INVOICE</div>
                <div class="invoice-meta">
                  ${invoiceNumber}<br/>
                  Issued: ${issueDate}<br/>
                  Booking: ${booking.booking_reference}
                </div>
                <span class="badge ${isPaid ? "badge-paid" : "badge-due"}">
                  ${isPaid ? "✓ PAID" : "PAYMENT DUE"}
                </span>
              </div>
            </div>

            <hr/>

            <!-- Bill to -->
            <div class="bill-to">
              <div class="section-label">Bill To</div>
              <div class="bill-name">${booking.primary_contact_name}</div>
              <div class="bill-sub">
                ${booking.primary_contact_email ?? ""}
                ${
                  booking.primary_contact_phone
                    ? `<br/>${booking.primary_contact_phone}`
                    : ""
                }
              </div>
            </div>

            <!-- Line items -->
            <div class="section-label">Services</div>
            <table class="table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th class="center">Qty</th>
                  <th class="right">Unit Price</th>
                  <th class="right">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div class="item-name">${
                      booking.tour_name ?? "Custom Tour"
                    }</div>
                    <div class="item-meta">
                      Tour date: ${tourDate}
                      ${
                        booking.display_start_time
                          ? ` · ${booking.display_start_time.slice(0, 5)}`
                          : ""
                      }
                      ${
                        booking.meeting_point
                          ? `<br/>Meeting point: ${booking.meeting_point}`
                          : ""
                      }
                    </div>
                  </td>
                  <td class="center">${totalGuests}</td>
                  <td class="right">—</td>
                  <td class="right">€${totalPrice.toFixed(2)}</td>
                </tr>
                ${
                  adults > 0
                    ? `
                <tr class="sub-row">
                  <td style="padding-left:24px">Adult × ${adults}</td>
                  <td class="center">${adults}</td>
                  <td class="right">€${unitPrice.toFixed(2)}</td>
                  <td class="right">€${(unitPrice * adults).toFixed(2)}</td>
                </tr>`
                    : ""
                }
                ${
                  children > 0
                    ? `
                <tr class="sub-row">
                  <td style="padding-left:24px">Child × ${children} (50% discount)</td>
                  <td class="center">${children}</td>
                  <td class="right">€${childPrice.toFixed(2)}</td>
                  <td class="right">€${(childPrice * children).toFixed(2)}</td>
                </tr>`
                    : ""
                }
                ${
                  infants > 0
                    ? `
                <tr class="sub-row">
                  <td style="padding-left:24px">Infant × ${infants} (complimentary)</td>
                  <td class="center">${infants}</td>
                  <td class="right">€0.00</td>
                  <td class="right">€0.00</td>
                </tr>`
                    : ""
                }
              </tbody>
            </table>

            <!-- Totals -->
            <div class="totals">
              <div class="totals-table">
                <div class="totals-row">
                  <span class="lbl">Subtotal</span>
                  <span>€${totalPrice.toFixed(2)}</span>
                </div>
                ${
                  amountPaid > 0
                    ? `
                <div class="totals-row">
                  <span class="lbl">Amount Paid</span>
                  <span class="paid-color">−€${amountPaid.toFixed(2)}</span>
                </div>`
                    : ""
                }
                <div class="totals-row grand">
                  <span class="lbl">${
                    isPaid ? "Total Paid" : "Balance Due"
                  }</span>
                  <span class="${isPaid ? "paid-color" : "due-color"}">
                    €${isPaid ? totalPrice.toFixed(2) : balance.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            ${
              booking.payment_history?.length > 0
                ? `
            <hr/>
            <div class="section-label">Payment History</div>
            ${booking.payment_history
              .map(
                (p: any) => `
              <div class="payment-row">
                <span style="color:#666">
                  ${new Date(p.paid_at).toLocaleDateString(
                    "en-GB"
                  )} · ${p.method?.replace("_", " ")}
                </span>
                <span style="font-weight:600;color:${
                  Number(p.amount) < 0 ? "#f97316" : "#16a34a"
                }">
                  ${Number(p.amount) < 0 ? "−" : "+"}€${Math.abs(
                  Number(p.amount)
                ).toFixed(2)}
                </span>
              </div>
            `
              )
              .join("")}`
                : ""
            }

            <!-- Footer -->
            <div class="footer">
              <span>${company?.name ?? "CityGo Tours"}${
      company?.website ? ` · ${company.website}` : ""
    }</span>
              <span>${
                company?.invoice_footer ?? "Thank you for your booking."
              }</span>
              <span>${invoiceNumber}</span>
            </div>
          </div>
          <script>window.onload = () => { window.print(); window.close(); }</script>
        </body>
      </html>
    `);
    win.document.close();
  };

  return (
    <Button variant="outline" onClick={handlePrintInvoice}>
      <FileText className="h-4 w-4 mr-2" />
      Print Invoice
    </Button>
  );
}
