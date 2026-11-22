import { asyncHandler } from "../../lib/asyncHandler.js";
import { sendContactFormEmail } from "../../services/emailService.js";
import type { ContactBody } from "./contact.schemas.js";

export const send = asyncHandler(async (req, res) => {
  const { first_name, last_name, email, phone, message } = req.body as ContactBody;

  // The visitor gets their answer right away; a mail hiccup is ours to log, not theirs to see.
  res.status(200).json({ message: "Message sent successfully." });

  try {
    await sendContactFormEmail({ name: `${first_name} ${last_name}`, email, phone, message });
  } catch (err) {
    console.error("Contact form email failed:", err);
  }
});
