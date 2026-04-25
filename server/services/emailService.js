import { BrevoClient } from "@getbrevo/brevo";
import "dotenv/config";

const brevo = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY,
});

const getClientUrl = () => {
  const origins =
    process.env.ALLOWED_ORIGINS?.split(",").map((o) => o.trim()) ?? [];
  if (process.env.NODE_ENV === "production") {
    return (
      origins.find((o) => o.includes("citygo.") && !o.includes("dashboard")) ??
      origins[0]
    );
  }
  return origins.find((o) => o.includes("5173")) ?? origins[0];
};
const FROM = { name: "CityGo Tours", email: "citygo@liuladniak.com" };

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const baseStyle = `font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; color: #111;`;

const send = async ({ to, subject, html }) => {
  try {
    await brevo.transactionalEmails.sendTransacEmail({
      sender: FROM,
      to: [{ email: to }],
      subject,
      htmlContent: html,
    });
    console.log(`Email sent to ${to}: ${subject}`);
  } catch (err) {
    console.error("Email send failed:", err?.message ?? err);
  }
};

export const sendBookingConfirmation = async (booking) => {
  const html = `
    <div style="${baseStyle}">
      <div style="background:#f97316;padding:24px 32px;border-radius:12px 12px 0 0">
        <h1 style="color:white;margin:0;font-size:22px">Booking Confirmed ✓</h1>
        <p style="color:rgba(255,255,255,0.85);margin:4px 0 0">CityGo Tours — Istanbul</p>
      </div>
      <div style="background:white;padding:32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
        <p style="font-size:16px">Dear <strong>${
          booking.primary_contact_name
        }</strong>,</p>
        <p>Your booking has been confirmed. Here are your details:</p>

        <div style="background:#f9fafb;border-radius:8px;padding:20px;margin:20px 0">
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <tr><td style="padding:6px 0;color:#666">Booking Reference</td>
                <td style="padding:6px 0;font-weight:600;text-align:right">${
                  booking.booking_reference
                }</td></tr>
            <tr><td style="padding:6px 0;color:#666">Tour</td>
                <td style="padding:6px 0;font-weight:600;text-align:right">${
                  booking.tour_name ?? "Custom Tour"
                }</td></tr>
            <tr><td style="padding:6px 0;color:#666">Date</td>
                <td style="padding:6px 0;font-weight:600;text-align:right">${formatDate(
                  booking.tour_date
                )}</td></tr>
            <tr><td style="padding:6px 0;color:#666">Time</td>
                <td style="padding:6px 0;font-weight:600;text-align:right">${
                  booking.display_start_time?.slice(0, 5) ?? "—"
                }${
    booking.display_end_time ? ` – ${booking.display_end_time.slice(0, 5)}` : ""
  }</td></tr>
            ${
              booking.meeting_point
                ? `
            <tr><td style="padding:6px 0;color:#666">Meeting Point</td>
                <td style="padding:6px 0;font-weight:600;text-align:right">${booking.meeting_point}</td></tr>`
                : ""
            }
            <tr><td style="padding:6px 0;color:#666">Guests</td>
                <td style="padding:6px 0;font-weight:600;text-align:right">${
                  booking.total_guests ?? "—"
                }</td></tr>
          </table>
        </div>

        ${
          booking.staff?.length > 0
            ? `
        <div style="margin:20px 0">
          <p style="font-weight:600;margin-bottom:8px">Your Guide${
            booking.staff.length > 1 ? "s" : ""
          }:</p>
          ${booking.staff
            .map(
              (s) =>
                `<p style="margin:4px 0;font-size:14px">👤 ${s.guide_name}</p>`
            )
            .join("")}
        </div>`
            : ""
        }

        <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:16px;margin:20px 0">
          <p style="margin:0;font-size:14px;color:#c2410c">
            <strong>Important:</strong> Please arrive 10 minutes early at the meeting point. 
            Present this email or your booking reference on the day.
          </p>
        </div>

        <p style="font-size:14px;color:#666">
          Questions? Reply to this email or contact us at hello@citygo.com
        </p>

        <div style="border-top:1px solid #e5e7eb;margin-top:24px;padding-top:16px;font-size:12px;color:#aaa;text-align:center">
          CityGo Tours · Istanbul City Experiences
        </div>
      </div>
    </div>
  `;

  await send({
    to: booking.primary_contact_email,
    subject: `Booking Confirmed — ${booking.booking_reference} | CityGo Tours`,
    html,
  });
};

export const sendBookingReminder = async (booking) => {
  const html = `
    <div style="${baseStyle}">
      <div style="background:#3b82f6;padding:24px 32px;border-radius:12px 12px 0 0">
        <h1 style="color:white;margin:0;font-size:22px">Your Tour is Tomorrow! 🗺️</h1>
        <p style="color:rgba(255,255,255,0.85);margin:4px 0 0">CityGo Tours — Reminder</p>
      </div>
      <div style="background:white;padding:32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
        <p style="font-size:16px">Dear <strong>${
          booking.primary_contact_name
        }</strong>,</p>
        <p>This is a reminder that your tour is <strong>tomorrow</strong>. Here's everything you need:</p>

        <div style="background:#f9fafb;border-radius:8px;padding:20px;margin:20px 0">
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <tr><td style="padding:6px 0;color:#666">Tour</td>
                <td style="padding:6px 0;font-weight:600;text-align:right">${
                  booking.tour_name ?? "Custom Tour"
                }</td></tr>
            <tr><td style="padding:6px 0;color:#666">Date</td>
                <td style="padding:6px 0;font-weight:600;text-align:right">${formatDate(
                  booking.tour_date
                )}</td></tr>
            <tr><td style="padding:6px 0;color:#666">Start Time</td>
                <td style="padding:6px 0;font-weight:600;text-align:right">${
                  booking.display_start_time?.slice(0, 5) ?? "—"
                }</td></tr>
            ${
              booking.meeting_point
                ? `
            <tr><td style="padding:6px 0;color:#666">Meeting Point</td>
                <td style="padding:6px 0;font-weight:600;text-align:right">${booking.meeting_point}</td></tr>`
                : ""
            }
          </table>
        </div>

        ${
          booking.includes
            ? `
        <div style="margin:20px 0">
          <p style="font-weight:600;margin-bottom:8px">What's included:</p>
          ${booking.includes
            .split(",")
            .map(
              (i) => `<p style="margin:2px 0;font-size:14px">✓ ${i.trim()}</p>`
            )
            .join("")}
        </div>`
            : ""
        }

        ${
          booking.essentials
            ? `
        <div style="margin:20px 0">
          <p style="font-weight:600;margin-bottom:8px">What to bring:</p>
          ${booking.essentials
            .split(",")
            .map(
              (i) => `<p style="margin:2px 0;font-size:14px">· ${i.trim()}</p>`
            )
            .join("")}
        </div>`
            : ""
        }

        <p style="font-size:14px;color:#666">See you tomorrow! — CityGo Tours Team</p>

        <div style="border-top:1px solid #e5e7eb;margin-top:24px;padding-top:16px;font-size:12px;color:#aaa;text-align:center">
          CityGo Tours · Istanbul City Experiences<br/>
          Ref: ${booking.booking_reference}
        </div>
      </div>
    </div>
  `;

  await send({
    to: booking.primary_contact_email,
    subject: `Reminder: Your Tour Tomorrow — ${
      booking.tour_name ?? "Custom Tour"
    } | CityGo`,
    html,
  });
};

export const sendCancellationConfirmation = async (
  booking,
  refundAmount = 0
) => {
  const html = `
    <div style="${baseStyle}">
      <div style="background:#ef4444;padding:24px 32px;border-radius:12px 12px 0 0">
        <h1 style="color:white;margin:0;font-size:22px">Booking Cancelled</h1>
        <p style="color:rgba(255,255,255,0.85);margin:4px 0 0">CityGo Tours</p>
      </div>
      <div style="background:white;padding:32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
        <p style="font-size:16px">Dear <strong>${
          booking.primary_contact_name
        }</strong>,</p>
        <p>Your booking has been cancelled. Here's a summary:</p>

        <div style="background:#f9fafb;border-radius:8px;padding:20px;margin:20px 0">
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <tr><td style="padding:6px 0;color:#666">Booking Reference</td>
                <td style="padding:6px 0;font-weight:600;text-align:right">${
                  booking.booking_reference
                }</td></tr>
            <tr><td style="padding:6px 0;color:#666">Tour</td>
                <td style="padding:6px 0;font-weight:600;text-align:right">${
                  booking.tour_name ?? "Custom Tour"
                }</td></tr>
            <tr><td style="padding:6px 0;color:#666">Original Date</td>
                <td style="padding:6px 0;font-weight:600;text-align:right">${formatDate(
                  booking.tour_date
                )}</td></tr>
          </table>
        </div>

        ${
          refundAmount > 0
            ? `
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:20px 0">
          <p style="margin:0;font-size:14px;color:#166534">
            <strong>Refund:</strong> €${Number(refundAmount).toFixed(
              2
            )} will be processed within 5-10 business days.
          </p>
        </div>`
            : ""
        }

        <p style="font-size:14px;color:#666">
          We hope to welcome you on a future tour. Browse our experiences at citygo.com
        </p>

        <p style="font-size:14px;color:#666">
          Questions? Contact us at hello@citygo.com
        </p>

        <div style="border-top:1px solid #e5e7eb;margin-top:24px;padding-top:16px;font-size:12px;color:#aaa;text-align:center">
          CityGo Tours · Istanbul City Experiences
        </div>
      </div>
    </div>
  `;

  await send({
    to: booking.primary_contact_email,
    subject: `Booking Cancelled — ${booking.booking_reference} | CityGo Tours`,
    html,
  });
};

export const sendGuideAssignment = async ({
  guideName,
  guideEmail,
  booking,
  role,
}) => {
  const roleLabel =
    {
      lead_guide: "Lead Guide",
      assistant_guide: "Assistant Guide",
      driver: "Driver",
    }[role] ?? role;

  const html = `
    <div style="${baseStyle}">
      <div style="background:#8b5cf6;padding:24px 32px;border-radius:12px 12px 0 0">
        <h1 style="color:white;margin:0;font-size:22px">New Tour Assignment 📋</h1>
        <p style="color:rgba(255,255,255,0.85);margin:4px 0 0">CityGo Tours — Staff Notification</p>
      </div>
      <div style="background:white;padding:32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
        <p style="font-size:16px">Hi <strong>${guideName}</strong>,</p>
        <p>You have been assigned to a tour as <strong>${roleLabel}</strong>.</p>

        <div style="background:#f9fafb;border-radius:8px;padding:20px;margin:20px 0">
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <tr><td style="padding:6px 0;color:#666">Tour</td>
                <td style="padding:6px 0;font-weight:600;text-align:right">${
                  booking.tour_name ?? "Custom Tour"
                }</td></tr>
            <tr><td style="padding:6px 0;color:#666">Date</td>
                <td style="padding:6px 0;font-weight:600;text-align:right">${formatDate(
                  booking.tour_date
                )}</td></tr>
            <tr><td style="padding:6px 0;color:#666">Time</td>
                <td style="padding:6px 0;font-weight:600;text-align:right">${
                  booking.display_start_time?.slice(0, 5) ?? "—"
                }${
    booking.display_end_time ? ` – ${booking.display_end_time.slice(0, 5)}` : ""
  }</td></tr>
            ${
              booking.meeting_point
                ? `
            <tr><td style="padding:6px 0;color:#666">Meeting Point</td>
                <td style="padding:6px 0;font-weight:600;text-align:right">${booking.meeting_point}</td></tr>`
                : ""
            }
            <tr><td style="padding:6px 0;color:#666">Guests</td>
                <td style="padding:6px 0;font-weight:600;text-align:right">${
                  booking.total_guests ?? "—"
                }</td></tr>
            <tr><td style="padding:6px 0;color:#666">Your Role</td>
                <td style="padding:6px 0;font-weight:600;text-align:right">${roleLabel}</td></tr>
            <tr><td style="padding:6px 0;color:#666">Booking Ref</td>
                <td style="padding:6px 0;font-weight:600;text-align:right">${
                  booking.booking_reference
                }</td></tr>
          </table>
        </div>

        <p style="font-size:14px;color:#666">
          Please log in to the CityGo dashboard for full booking details.
        </p>

        <div style="border-top:1px solid #e5e7eb;margin-top:24px;padding-top:16px;font-size:12px;color:#aaa;text-align:center">
          CityGo Tours · Staff Portal
        </div>
      </div>
    </div>
  `;

  await send({
    to: guideEmail,
    subject: `Tour Assignment — ${
      booking.tour_name ?? "Custom Tour"
    } on ${formatDate(booking.tour_date)}`,
    html,
  });
};

export const sendGuideUnassignment = async ({
  guideName,
  guideEmail,
  booking,
}) => {
  const html = `
    <div style="${baseStyle}">
      <div style="background:#6b7280;padding:24px 32px;border-radius:12px 12px 0 0">
        <h1 style="color:white;margin:0;font-size:22px">Tour Assignment Removed</h1>
        <p style="color:rgba(255,255,255,0.85);margin:4px 0 0">CityGo Tours — Staff Notification</p>
      </div>
      <div style="background:white;padding:32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
        <p style="font-size:16px">Hi <strong>${guideName}</strong>,</p>
        <p>You have been removed from the following tour assignment:</p>

        <div style="background:#f9fafb;border-radius:8px;padding:20px;margin:20px 0">
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <tr><td style="padding:6px 0;color:#666">Tour</td>
                <td style="padding:6px 0;font-weight:600;text-align:right">${
                  booking.tour_name ?? "Custom Tour"
                }</td></tr>
            <tr><td style="padding:6px 0;color:#666">Date</td>
                <td style="padding:6px 0;font-weight:600;text-align:right">${formatDate(
                  booking.tour_date
                )}</td></tr>
            <tr><td style="padding:6px 0;color:#666">Booking Ref</td>
                <td style="padding:6px 0;font-weight:600;text-align:right">${
                  booking.booking_reference
                }</td></tr>
          </table>
        </div>

        <p style="font-size:14px;color:#666">
          If you have questions, please contact your manager.
        </p>

        <div style="border-top:1px solid #e5e7eb;margin-top:24px;padding-top:16px;font-size:12px;color:#aaa;text-align:center">
          CityGo Tours · Staff Portal
        </div>
      </div>
    </div>
  `;

  await send({
    to: guideEmail,
    subject: `Assignment Removed — ${
      booking.tour_name ?? "Custom Tour"
    } on ${formatDate(booking.tour_date)}`,
    html,
  });
};

export const sendPasswordReset = async ({
  to,
  name,
  resetUrl,
  isGoogleAccount = false,
}) => {
  const html = isGoogleAccount
    ? `
    <div style="${baseStyle}">
      <div style="background:#1e556d;padding:24px 32px;border-radius:12px 12px 0 0">
        <h1 style="color:white;margin:0;font-size:22px">Password reset</h1>
        <p style="color:rgba(255,255,255,0.85);margin:4px 0 0">CityGo Tours</p>
      </div>
      <div style="background:white;padding:32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
        <p style="font-size:16px">Hi <strong>${name}</strong>,</p>
        <p>We received a password reset request for this email address.</p>
        <p>Your CityGo account was created using <strong>Google sign-in</strong> — 
        there is no password to reset.</p>
        <p>To access your account, click <strong>Continue with Google</strong> on the sign-in page.</p>
        <p style="font-size:13px;color:#6b7280">
          If you didn't request this, you can safely ignore this email.
        </p>
        <div style="border-top:1px solid #e5e7eb;margin-top:24px;padding-top:16px;
                    font-size:12px;color:#aaa;text-align:center">
          CityGo Tours · Istanbul City Experiences
        </div>
      </div>
    </div>
  `
    : `
    <div style="${baseStyle}">
      <div style="background:#1e556d;padding:24px 32px;border-radius:12px 12px 0 0">
        <h1 style="color:white;margin:0;font-size:22px">Reset your password</h1>
        <p style="color:rgba(255,255,255,0.85);margin:4px 0 0">CityGo Tours</p>
      </div>
      <div style="background:white;padding:32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
        <p style="font-size:16px">Hi <strong>${name}</strong>,</p>
        <p>We received a request to reset your CityGo password. Click the button below to choose a new one.</p>
        <div style="text-align:center;margin:32px 0">
          <a href="${resetUrl}"
             style="background:#9b1c1c;color:white;padding:14px 32px;border-radius:8px;
                    text-decoration:none;font-size:16px;font-weight:600;display:inline-block">
            Reset Password
          </a>
        </div>
        <p style="font-size:13px;color:#6b7280">
          This link expires in <strong>1 hour</strong>. If you didn't request a password reset,
          you can safely ignore this email — your password won't change.
        </p>
        <p style="font-size:13px;color:#9ca3af;word-break:break-all">
          Or copy this link: ${resetUrl}
        </p>
        <div style="border-top:1px solid #e5e7eb;margin-top:24px;padding-top:16px;
                    font-size:12px;color:#aaa;text-align:center">
          CityGo Tours · Istanbul City Experiences
        </div>
      </div>
    </div>
  `;

  await send({
    to,
    subject: isGoogleAccount
      ? "Password reset request — CityGo"
      : "Reset your CityGo password",
    html,
  });
};

export const sendWelcome = async ({ to, name }) => {
  const html = `
    <div style="${baseStyle}">
      <div style="background:#1e556d;padding:24px 32px;border-radius:12px 12px 0 0">
        <h1 style="color:white;margin:0;font-size:22px">Welcome to CityGo 🌍</h1>
        <p style="color:rgba(255,255,255,0.85);margin:4px 0 0">Istanbul City Experiences</p>
      </div>
      <div style="background:white;padding:32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
        <p style="font-size:16px">Hi <strong>${name}</strong>,</p>
        <p>Welcome to CityGo — we're glad you're here.</p>
        <p>You can now browse and book Istanbul's best guided experiences, manage your bookings, and save your favourite tours.</p>

        <div style="background:#f9fafb;border-radius:8px;padding:20px;margin:24px 0">
          <p style="margin:0 0 12px;font-weight:600;font-size:15px">What you can do:</p>
          <p style="margin:4px 0;font-size:14px">🗺️ Browse curated city tours</p>
          <p style="margin:4px 0;font-size:14px">📅 Book and manage your experiences</p>
          <p style="margin:4px 0;font-size:14px">❤️ Save tours to your wishlist</p>
          <p style="margin:4px 0;font-size:14px">📖 Read our Istanbul travel guide</p>
        </div>

        <div style="text-align:center;margin:32px 0">
          <a href="${getClientUrl()}/tours"
             style="background:#9b1c1c;color:white;padding:14px 32px;border-radius:8px;
                    text-decoration:none;font-size:16px;font-weight:600;display:inline-block">
            Explore Tours
          </a>
        </div>

        <p style="font-size:13px;color:#6b7280">
          Questions? We're always happy to help at hello@citygo.com
        </p>

        <div style="border-top:1px solid #e5e7eb;margin-top:24px;padding-top:16px;
                    font-size:12px;color:#aaa;text-align:center">
          CityGo Tours · Istanbul City Experiences
        </div>
      </div>
    </div>
  `;

  await send({
    to,
    subject: "Welcome to CityGo 🌍",
    html,
  });
};

export const sendPasswordChanged = async ({ to, name }) => {
  const html = `
    <div style="${baseStyle}">
      <div style="background:#1e556d;padding:24px 32px;border-radius:12px 12px 0 0">
        <h1 style="color:white;margin:0;font-size:22px">Password updated</h1>
        <p style="color:rgba(255,255,255,0.85);margin:4px 0 0">CityGo Tours</p>
      </div>
      <div style="background:white;padding:32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
        <p style="font-size:16px">Hi <strong>${name}</strong>,</p>
        <p>Your CityGo password was successfully updated.</p>

        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;
                    padding:16px;margin:20px 0">
          <p style="margin:0;font-size:14px;color:#166534">
            ✓ Password changed successfully
          </p>
        </div>

        <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;
                    padding:16px;margin:20px 0">
          <p style="margin:0;font-size:14px;color:#c2410c">
            <strong>Wasn't you?</strong> If you didn't make this change, 
            please contact us immediately at hello@citygo.com
          </p>
        </div>

        <p style="font-size:13px;color:#6b7280">
          For security, you may need to sign in again on your devices.
        </p>

        <div style="border-top:1px solid #e5e7eb;margin-top:24px;padding-top:16px;
                    font-size:12px;color:#aaa;text-align:center">
          CityGo Tours · Istanbul City Experiences
        </div>
      </div>
    </div>
  `;

  await send({
    to,
    subject: "Your CityGo password has been updated",
    html,
  });
};
export const sendContactFormEmail = async ({ name, email, phone, message }) => {
  const html = `
    <div style="${baseStyle}">
      <div style="background:#1e556d;padding:24px 32px;border-radius:12px 12px 0 0">
        <h1 style="color:white;margin:0;font-size:22px">New Contact Form Message</h1>
        <p style="color:rgba(255,255,255,0.85);margin:4px 0 0">CityGo Tours — Website</p>
      </div>
      <div style="background:white;padding:32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
        <div style="background:#f9fafb;border-radius:8px;padding:20px;margin-bottom:24px">
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <tr>
              <td style="padding:6px 0;color:#666;width:120px">Name</td>
              <td style="padding:6px 0;font-weight:600">${name}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#666">Email</td>
              <td style="padding:6px 0;font-weight:600">
                <a href="mailto:${email}" style="color:#1e556d">${email}</a>
              </td>
            </tr>
            ${
              phone
                ? `
            <tr>
              <td style="padding:6px 0;color:#666">Phone</td>
              <td style="padding:6px 0;font-weight:600">${phone}</td>
            </tr>`
                : ""
            }
          </table>
        </div>

        <div>
          <p style="font-weight:600;margin-bottom:8px;font-size:14px">Message:</p>
          <p style="font-size:15px;line-height:1.6;color:#374151;white-space:pre-wrap">${message}</p>
        </div>

        <div style="border-top:1px solid #e5e7eb;margin-top:24px;padding-top:16px;font-size:12px;color:#aaa;text-align:center">
          CityGo Tours · Contact Form Submission
        </div>
      </div>
    </div>
  `;

  await send({
    to: process.env.CONTACT_EMAIL,
    subject: `Contact Form: ${name}`,
    html,
  });
};
