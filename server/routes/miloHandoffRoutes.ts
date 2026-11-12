import express from "express";
import rateLimit from "express-rate-limit";
import { redact } from "../lib/redact.js";
import { notifyTelegram } from "../lib/telegram.js";
import { SESSION_ID, newToken, hashToken, cleanName, cleanEmail } from "../lib/handoff.js";
import { dbStore } from "../realtime/dbStore.js";
import { isAgentOnline } from "../realtime/presence.js";

const router = express.Router();

const DAILY_LIMIT = 30; // handoff requests per day, whole site
const agentName = () => process.env.MILO_AGENT_NAME || "Liu";

const handoffLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests." },
});

// Is the owner connected to the console right now? Public, returns two fields.
router.get("/availability", (_req, res) => {
  res.json({ online: isAgentOnline(), agentName: agentName() });
});

// A visitor asks to talk to a person. Public but tightly limited: 3 per IP per
// hour and 30 per day. Returns a random token the visitor needs to join the chat
// (it is a chat pass, not a login: it opens exactly one conversation).
router.post("/", handoffLimiter, async (req, res) => {
  const { session_id, name, email, message } = req.body ?? {};
  if (typeof session_id !== "string" || !SESSION_ID.test(session_id)) {
    return res.status(400).json({ error: "Invalid request." });
  }

  try {
    if ((await dbStore.countRecent(24)) >= DAILY_LIMIT) {
      return res.status(429).json({ error: "busy" });
    }

    const token = newToken();
    const visitorName = cleanName(name);
    const result = await dbStore.createOrReset({
      sessionId: session_id,
      tokenHash: hashToken(token),
      name: visitorName,
      email: cleanEmail(email),
    });
    if (result === "exists") return res.status(409).json({ error: "exists" });

    const first = typeof message === "string" ? redact(message, 500) : "";
    if (first) await dbStore.saveMessage(session_id, "visitor", first);

    const online = isAgentOnline();
    const consoleUrl = process.env.MILO_CONSOLE_URL;
    void notifyTelegram(
      `💬 New Milo chat request${visitorName ? ` from ${visitorName}` : ""}` +
        (first ? `\n“${first}”` : "") +
        (online ? "" : "\n(You are not connected to the console.)") +
        (consoleUrl ? `\nOpen: ${consoleUrl}` : ""),
    );

    return res.status(201).json({ token, agentName: agentName(), online });
  } catch (err) {
    console.error("[Milo] handoff failed:", (err as Error).message);
    return res.status(500).json({ error: "Could not start chat." });
  }
});

export default router;
