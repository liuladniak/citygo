import express from "express";
import { sendContactFormEmail } from "../services/emailService.js";

const router = express.Router();

router.post("/", async (req, res) => {
  let { first_name, last_name, email, phone, message } = req.body;

  first_name = first_name?.trim();
  last_name = last_name?.trim();
  email = email?.trim().toLowerCase();
  phone = phone?.trim() || null;
  message = message?.trim();

  if (!first_name || !last_name || !email || !message) {
    return res
      .status(400)
      .json({ error: "Please fill in all required fields." });
  }
  if (first_name.length > 100 || last_name.length > 100) {
    return res.status(400).json({ error: "Name is too long." });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res
      .status(400)
      .json({ error: "Please enter a valid email address." });
  }
  if (message.length < 10) {
    return res.status(400).json({ error: "Message is too short." });
  }
  if (message.length > 2000) {
    return res
      .status(400)
      .json({ error: "Message is too long (max 2000 characters)." });
  }

  res.status(200).json({ message: "Message sent successfully." });

  try {
    await sendContactFormEmail({
      name: `${first_name} ${last_name}`,
      email,
      phone,
      message,
    });
  } catch (err) {
    console.error("Contact form email failed:", err);
  }
});

export default router;
