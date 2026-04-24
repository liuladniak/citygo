import express from "express";
import initKnex from "knex";
import knexConfig from "../knexfile.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import passport from "passport";
const router = express.Router();
const knex = initKnex(knexConfig[process.env.NODE_ENV || "development"]);
import "dotenv/config";
import crypto from "crypto";
import {
  sendPasswordReset,
  sendWelcome,
  sendPasswordChanged,
} from "../services/emailService.js";

const DEMO_EMAILS = [
  "test@example.com",
  "demo.manager@citygo.com",
  "demo.associate@citygo.com",
];

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).send("Authorization token required.");
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).send("No token found.");
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send("Invalid or expired token.");
    }

    req.userId = decoded.id;
    next();
  });
};

const getClientUrl = (req) => {
  const origins = process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim());

  if (process.env.NODE_ENV === "production") {
    return origins.find(
      (o) => o.includes("citygo.") && !o.includes("dashboard")
    );
  }

  if (req.session?.clientOrigin) {
    return req.session.clientOrigin;
  }

  return origins.find(
    (o) => o.includes("localhost") && !o.includes("3000") && !o.includes("8080")
  );
};

router.post("/signup", async (req, res) => {
  let { first_name, last_name, email, password } = req.body;

  first_name = first_name?.trim();
  last_name = last_name?.trim();
  email = email?.trim().toLowerCase();

  if (!first_name || !last_name || !email || !password) {
    return res
      .status(400)
      .json({ error: "Please fill in all required fields." });
  }
  if (password.length < 8) {
    return res
      .status(400)
      .json({ error: "Password must be at least 8 characters." });
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

  const existing = await knex("users").where({ email }).first();
  if (existing) {
    return res.status(409).json({
      error: "An account with this email already exists.",
      hint: "login",
    });
  }

  const hashedPassword = bcrypt.hashSync(password);

  try {
    const [newUser] = await knex("users")
      .insert({
        first_name,
        last_name,
        phone_number: req.body.phone_number?.trim() || null,
        email,
        password: hashedPassword,
      })
      .returning("*");

    await knex("bookings")
      .where("primary_contact_email", email)
      .whereNull("user_id")
      .update({ user_id: newUser.id });

    sendWelcome({ to: email, name: first_name }).catch((err) =>
      console.error("Welcome email failed:", err)
    );

    res.status(201).json({ message: "Registered successfully" });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Registration failed. Please try again." });
  }
});

router.post("/login", async (req, res) => {
  let { email, password } = req.body;

  email = email?.trim().toLowerCase();

  if (!email || !password) {
    return res
      .status(400)
      .json({ error: "Please enter your email and password." });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res
      .status(400)
      .json({ error: "Please enter a valid email address." });
  }

  let user;
  try {
    user = await knex("users").where({ email }).first();
  } catch (err) {
    console.error("Login DB error:", err);
    return res
      .status(500)
      .json({ error: "Something went wrong. Please try again." });
  }

  if (!user) {
    return res.status(401).json({ error: "Incorrect email or password." });
  }

  if (!user.password) {
    return res.status(400).json({
      error:
        "This account was created with Google. Please sign in with Google instead.",
    });
  }

  const isPasswordCorrect = bcrypt.compareSync(password, user.password);
  if (!isPasswordCorrect) {
    return res.status(401).json({ error: "Incorrect email or password." });
  }

  const expiresIn = 7 * 24 * 60 * 60;
  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn }
  );

  res.json({ token, expiresIn });
});

router.get("/profile", async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res
      .status(401)
      .send("Please provide a JWT for authorization or please login");
  }

  const authToken = authHeader.split(" ")[1];

  let decodedToken;
  try {
    decodedToken = jwt.verify(authToken, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(401).send("Invalid auth token");
  }
  try {
    const userData = await knex("users")
      .select(
        "id",
        "first_name",
        "last_name",
        "preferred_name",
        "notification_preference",
        "gift_credit",
        knex.raw(`
      CASE 
        WHEN email IS NULL OR email = '' THEN 'No email provided'
        ELSE LEFT(email, 1) || '****' || SUBSTRING(email FROM POSITION('@' IN email)) 
      END AS email
    `),
        knex.raw(`
      CASE 
        WHEN phone_number IS NULL OR phone_number = '' THEN 'No phone number provided'
        ELSE 
          SUBSTRING(phone_number, 1, 2) || 
          REPEAT('*', GREATEST(LENGTH(phone_number) - 6, 0)) || 
          SUBSTRING(phone_number, LENGTH(phone_number) - 3, 4) 
      END AS phone_number
    `),
        knex.raw(`
      CASE 
        WHEN emergency_contact IS NULL OR emergency_contact = '' THEN 'Not provided'
        ELSE 
          SUBSTRING(emergency_contact, 1, 2) || 
          REPEAT('*', GREATEST(LENGTH(emergency_contact) - 6, 0)) || 
          SUBSTRING(emergency_contact, LENGTH(emergency_contact) - 3, 4) 
      END AS emergency_contact
    `)
      )

      .where({ id: decodedToken.id })
      .first();

    delete userData.password;

    if (!userData) {
      return res.status(404).send("User not found");
    }
    res.status(200).json(userData);
  } catch (err) {
    console.error("Error fetching user profile:", err);
    res.status(500).send("Internal Server Error");
  }
});
router.post("/test-login", async (req, res) => {
  try {
    const user = await knex("users")
      .where({ email: "test@example.com" })
      .first();

    if (!user) {
      return res.status(404).send("Test user not found in the database.");
    }

    const expiresIn = 60 * 1000;
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn }
    );

    res.status(200).json({
      message: "Test user logged in successfully",
      token: token,
      expiresIn: expiresIn,
    });
  } catch (err) {
    console.error("Error logging in test user:", err);
    res.status(500).send("Server error");
  }
});

router.put("/profile", verifyToken, async (req, res) => {
  const {
    first_name,
    last_name,
    preferred_name,
    email,
    phone_number,
    emergency_contact,
    notification_preference,
    gift_credit,
  } = req.body;

  const updatedUser = {};

  if (first_name) updatedUser.first_name = first_name;
  if (last_name) updatedUser.last_name = last_name;
  if (preferred_name) updatedUser.preferred_name = preferred_name;
  if (email) updatedUser.email = email;
  if (phone_number) updatedUser.phone_number = phone_number;
  if (emergency_contact) updatedUser.emergency_contact = emergency_contact;
  if (notification_preference !== undefined)
    updatedUser.notification_preference = notification_preference;
  if (gift_credit !== undefined) updatedUser.gift_credit = gift_credit;

  if (Object.keys(updatedUser).length === 0) {
    return res.status(400).send("At least one field must be updated");
  }

  try {
    if (!req.userId) {
      return res.status(401).send("User not authenticated");
    }

    await knex("users").where({ id: req.userId }).update(updatedUser);

    res.status(200).send("User profile updated successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error while updating user profile");
  }
});

router.get("/google", (req, res, next) => {
  const origin = req.headers.referer || req.headers.origin;
  if (origin) {
    const matchedOrigin = process.env.ALLOWED_ORIGINS.split(",")
      .map((o) => o.trim())
      .find((o) => origin.startsWith(o));
    if (matchedOrigin) req.session.clientOrigin = matchedOrigin;
  }
  passport.authenticate("google", { scope: ["profile", "email"] })(
    req,
    res,
    next
  );
});

router.get("/google/callback", (req, res, next) => {
  passport.authenticate("google", { session: false }, (err, user) => {
    const clientUrl = getClientUrl(req);
    console.log("Client URL:", clientUrl);

    if (err) {
      console.error("Google auth error:", err.code, err.message);
      if (err.code === "invalid_grant") {
        return res.redirect(`${clientUrl}/login?error=try_again`);
      }
      return res.redirect(`${clientUrl}/login?error=google_failed`);
    }

    if (!user) {
      return res.redirect(`${clientUrl}/login?error=google_failed`);
    }

    try {
      const expiresIn = 7 * 24 * 60 * 60;
      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn }
      );
      const expirationTime = Date.now() + expiresIn * 1000;
      const redirectUrl = `${clientUrl}/auth/callback?token=${token}&expires=${expirationTime}`;
      console.log("Redirecting to:", redirectUrl);
      return res.redirect(redirectUrl);
    } catch (jwtErr) {
      console.error("JWT error:", jwtErr);
      return res.redirect(`${clientUrl}/login?error=google_failed`);
    }
  })(req, res, next);
});

const isDemoAccount = (email) =>
  DEMO_EMAILS.includes(email.trim().toLowerCase());

router.post("/forgot-password", async (req, res) => {
  let { email } = req.body;
  email = email?.trim().toLowerCase();

  if (!email) {
    return res.status(400).json({ error: "Please provide an email address." });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res
      .status(400)
      .json({ error: "Please enter a valid email address." });
  }

  if (isDemoAccount(email)) {
    return res.status(200).json({
      message:
        "If an account exists with this email, a reset link has been sent.",
    });
  }

  const clientUrl = getClientUrl(req);

  res.status(200).json({
    message:
      "If an account exists with this email, a reset link has been sent.",
  });

  try {
    console.log("Starting async reset for:", email);
    const user = await knex("users").where({ email }).first();
    console.log("User found:", !!user);
    if (!user) return;

    if (!user.password && user.google_id) {
      await sendPasswordReset({
        to: email,
        name: user.first_name,
        resetUrl: null,
        isGoogleAccount: true,
      });
      return;
    }

    await knex("password_reset_tokens")
      .where({ user_id: user.id })
      .whereNull("used_at")
      .delete();
    console.log("Old tokens cleared");

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await knex("password_reset_tokens").insert({
      user_id: user.id,
      token,
      expires_at: expiresAt,
    });
    console.log("Token inserted");

    const resetUrl = `${clientUrl}/reset-password?token=${token}`;
    console.log("Reset URL:", resetUrl);

    await sendPasswordReset({ to: email, name: user.first_name, resetUrl });
    console.log("Email sent");
  } catch (err) {
    console.error("Forgot password async error:", err);
  }
});

router.post("/reset-password", async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ error: "Token and password are required." });
  }

  if (password.length < 8) {
    return res.status(400).json({
      error: "Password must be at least 8 characters.",
    });
  }

  try {
    const resetRecord = await knex("password_reset_tokens")
      .where({ token })
      .whereNull("used_at")
      .where("expires_at", ">", new Date())
      .first();

    if (!resetRecord) {
      return res.status(400).json({
        error:
          "This reset link is invalid or has expired. Please request a new one.",
      });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    await knex("users")
      .where({ id: resetRecord.user_id })
      .update({ password: hashedPassword });

    await knex("password_reset_tokens")
      .where({ id: resetRecord.id })
      .update({ used_at: new Date() });

    const user = await knex("users")
      .where({ id: resetRecord.user_id })
      .select("first_name", "email")
      .first();

    sendPasswordChanged({ to: user.email, name: user.first_name }).catch(
      (err) => console.error("Password changed email failed:", err)
    );

    res.json({ message: "Password updated successfully." });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

export default router;
