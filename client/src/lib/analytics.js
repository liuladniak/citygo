// Sends a custom event to Google Analytics 4. The gtag snippet lives in
// index.html; if it is blocked (ad blockers) this quietly does nothing.
export const trackEvent = (eventName, eventData = {}) => {
  if (typeof window.gtag !== "function") return;
  window.gtag("event", eventName, eventData);
};
