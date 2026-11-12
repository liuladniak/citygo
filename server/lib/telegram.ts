// Sends a notification to the owner's Telegram chat. Does nothing unless
// TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID are set, and never throws.
// The bot token is never logged.

export const notifyTelegram = async (text: string): Promise<boolean> => {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return false;

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: text.slice(0, 3500),
        disable_web_page_preview: true,
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) console.error("[Telegram] send failed with status", res.status);
    return res.ok;
  } catch (err) {
    console.error("[Telegram] send failed:", (err as Error).name);
    return false;
  }
};
