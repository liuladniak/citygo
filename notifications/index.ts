import dotenv from "dotenv";
dotenv.config();

import { Worker, Job } from "bullmq";
import nodemailer from "nodemailer";

const redisConnection = {
  host: process.env.REDIS_HOST || "redis",
  port: Number(process.env.REDIS_PORT) || 6379,
};

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM = `"CityGo Tours" <${process.env.SMTP_FROM}>`;

const baseStyle = `font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; color: #111;`;

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const sendEmail = async (to: string, subject: string, html: string) => {
  await transporter.sendMail({ from: FROM, to, subject, html });
  console.log(`[Notifications] Email sent to ${to}: ${subject}`);
};

const worker = new Worker(
  "notifications",
  async (job: Job) => {
    console.log(`[Notifications] Processing job: ${job.name} (${job.id})`);
    const d = job.data;

    switch (job.name) {
      case "booking-confirmation": {
        const html = `
          <div style="${baseStyle}">
            <div style="background:#f97316;padding:24px 32px;border-radius:12px 12px 0 0">
              <h1 style="color:white;margin:0;font-size:22px">Booking Confirmed ✓</h1>
              <p style="color:rgba(255,255,255,0.85);margin:4px 0 0">CityGo Tours — Istanbul</p>
            </div>
            <div style="background:white;padding:32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
              <p style="font-size:16px">Dear <strong>${d.userName}</strong>,</p>
              <p>Your booking has been confirmed. Here are your details:</p>
              <div style="background:#f9fafb;border-radius:8px;padding:20px;margin:20px 0">
                <table style="width:100%;border-collapse:collapse;font-size:14px">
                  <tr><td style="padding:6px 0;color:#666">Booking Reference</td>
                      <td style="padding:6px 0;font-weight:600;text-align:right">${d.bookingReference}</td></tr>
                  <tr><td style="padding:6px 0;color:#666">Tour</td>
                      <td style="padding:6px 0;font-weight:600;text-align:right">${d.tourName}</td></tr>
                  <tr><td style="padding:6px 0;color:#666">Date</td>
                      <td style="padding:6px 0;font-weight:600;text-align:right">${formatDate(d.bookingDate)}</td></tr>
                  <tr><td style="padding:6px 0;color:#666">Time</td>
                      <td style="padding:6px 0;font-weight:600;text-align:right">${d.bookingTime || "—"}</td></tr>
                  <tr><td style="padding:6px 0;color:#666">Guests</td>
                      <td style="padding:6px 0;font-weight:600;text-align:right">${d.guests}</td></tr>
                  <tr><td style="padding:6px 0;color:#666">Total</td>
                      <td style="padding:6px 0;font-weight:600;text-align:right">${d.totalPrice} ${d.currency}</td></tr>
                </table>
              </div>
              <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:16px;margin:20px 0">
                <p style="margin:0;font-size:14px;color:#c2410c">
                  <strong>Important:</strong> Please arrive 10 minutes early. Present this email or your booking reference on the day.
                </p>
              </div>
              <p style="font-size:14px;color:#666">Questions? Contact us at hello@citygo.com</p>
              <div style="border-top:1px solid #e5e7eb;margin-top:24px;padding-top:16px;font-size:12px;color:#aaa;text-align:center">
                CityGo Tours · Istanbul City Experiences
              </div>
            </div>
          </div>`;
        await sendEmail(
          d.to,
          `Booking Confirmed — ${d.bookingReference} | CityGo Tours`,
          html,
        );
        break;
      }

      case "booking-cancellation": {
        const html = `
          <div style="${baseStyle}">
            <div style="background:#ef4444;padding:24px 32px;border-radius:12px 12px 0 0">
              <h1 style="color:white;margin:0;font-size:22px">Booking Cancelled</h1>
              <p style="color:rgba(255,255,255,0.85);margin:4px 0 0">CityGo Tours</p>
            </div>
            <div style="background:white;padding:32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
              <p style="font-size:16px">Dear <strong>${d.userName}</strong>,</p>
              <p>Your booking has been cancelled.</p>
              <div style="background:#f9fafb;border-radius:8px;padding:20px;margin:20px 0">
                <table style="width:100%;border-collapse:collapse;font-size:14px">
                  <tr><td style="padding:6px 0;color:#666">Booking Reference</td>
                      <td style="padding:6px 0;font-weight:600;text-align:right">${d.bookingReference}</td></tr>
                  <tr><td style="padding:6px 0;color:#666">Tour</td>
                      <td style="padding:6px 0;font-weight:600;text-align:right">${d.tourName}</td></tr>
                  <tr><td style="padding:6px 0;color:#666">Original Date</td>
                      <td style="padding:6px 0;font-weight:600;text-align:right">${formatDate(d.bookingDate)}</td></tr>
                </table>
              </div>
              ${
                d.refundAmount > 0
                  ? `
              <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:20px 0">
                <p style="margin:0;font-size:14px;color:#166534">
                  <strong>Refund:</strong> €${Number(d.refundAmount).toFixed(2)} will be processed within 5-10 business days.
                </p>
              </div>`
                  : ""
              }
              <p style="font-size:14px;color:#666">We hope to welcome you on a future tour.</p>
              <div style="border-top:1px solid #e5e7eb;margin-top:24px;padding-top:16px;font-size:12px;color:#aaa;text-align:center">
                CityGo Tours · Istanbul City Experiences
              </div>
            </div>
          </div>`;
        await sendEmail(
          d.to,
          `Booking Cancelled — ${d.bookingReference} | CityGo Tours`,
          html,
        );
        break;
      }

      case "booking-reminder": {
        const html = `
          <div style="${baseStyle}">
            <div style="background:#3b82f6;padding:24px 32px;border-radius:12px 12px 0 0">
              <h1 style="color:white;margin:0;font-size:22px">Your Tour is Tomorrow! 🗺️</h1>
              <p style="color:rgba(255,255,255,0.85);margin:4px 0 0">CityGo Tours — Reminder</p>
            </div>
            <div style="background:white;padding:32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
              <p style="font-size:16px">Dear <strong>${d.userName}</strong>,</p>
              <p>Your tour is <strong>tomorrow</strong>. Here's everything you need:</p>
              <div style="background:#f9fafb;border-radius:8px;padding:20px;margin:20px 0">
                <table style="width:100%;border-collapse:collapse;font-size:14px">
                  <tr><td style="padding:6px 0;color:#666">Tour</td>
                      <td style="padding:6px 0;font-weight:600;text-align:right">${d.tourName}</td></tr>
                  <tr><td style="padding:6px 0;color:#666">Date</td>
                      <td style="padding:6px 0;font-weight:600;text-align:right">${formatDate(d.bookingDate)}</td></tr>
                  <tr><td style="padding:6px 0;color:#666">Start Time</td>
                      <td style="padding:6px 0;font-weight:600;text-align:right">${d.bookingTime || "—"}</td></tr>
                  ${
                    d.meetingPoint
                      ? `
                  <tr><td style="padding:6px 0;color:#666">Meeting Point</td>
                      <td style="padding:6px 0;font-weight:600;text-align:right">${d.meetingPoint}</td></tr>`
                      : ""
                  }
                </table>
              </div>
              <p style="font-size:14px;color:#666">See you tomorrow! — CityGo Tours Team</p>
              <div style="border-top:1px solid #e5e7eb;margin-top:24px;padding-top:16px;font-size:12px;color:#aaa;text-align:center">
                CityGo Tours · Ref: ${d.bookingReference}
              </div>
            </div>
          </div>`;
        await sendEmail(
          d.to,
          `Reminder: Your Tour Tomorrow — ${d.tourName} | CityGo`,
          html,
        );
        break;
      }

      case "welcome": {
        const html = `
          <div style="${baseStyle}">
            <div style="background:#1e556d;padding:24px 32px;border-radius:12px 12px 0 0">
              <h1 style="color:white;margin:0;font-size:22px">Welcome to CityGo 🌍</h1>
              <p style="color:rgba(255,255,255,0.85);margin:4px 0 0">Istanbul City Experiences</p>
            </div>
            <div style="background:white;padding:32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
              <p style="font-size:16px">Hi <strong>${d.name}</strong>,</p>
              <p>Welcome to CityGo — we're glad you're here.</p>
              <div style="background:#f9fafb;border-radius:8px;padding:20px;margin:24px 0">
                <p style="margin:0 0 12px;font-weight:600;font-size:15px">What you can do:</p>
                <p style="margin:4px 0;font-size:14px">🗺️ Browse curated city tours</p>
                <p style="margin:4px 0;font-size:14px">📅 Book and manage your experiences</p>
                <p style="margin:4px 0;font-size:14px">❤️ Save tours to your wishlist</p>
                <p style="margin:4px 0;font-size:14px">📖 Read our Istanbul travel guide</p>
              </div>
              <div style="text-align:center;margin:32px 0">
                <a href="${d.toursUrl}"
                   style="background:#9b1c1c;color:white;padding:14px 32px;border-radius:8px;
                          text-decoration:none;font-size:16px;font-weight:600;display:inline-block">
                  Explore Tours
                </a>
              </div>
              <p style="font-size:13px;color:#6b7280">Questions? hello@citygo.com</p>
              <div style="border-top:1px solid #e5e7eb;margin-top:24px;padding-top:16px;font-size:12px;color:#aaa;text-align:center">
                CityGo Tours · Istanbul City Experiences
              </div>
            </div>
          </div>`;
        await sendEmail(d.to, "Welcome to CityGo 🌍", html);
        break;
      }

      default:
        console.warn(`[Notifications] Unknown job type: ${job.name}`);
    }
  },
  {
    connection: redisConnection,
    concurrency: 5,
  },
);

worker.on("completed", (job: Job) => {
  console.log(`[Notifications] Job ${job.id} completed`);
});

worker.on("failed", (job: Job | undefined, err: Error) => {
  console.error(`[Notifications] Job ${job?.id} failed:`, err.message);
});

console.log("[Notifications] Worker started, listening for jobs...");
