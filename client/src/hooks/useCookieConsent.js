import { useState, useEffect } from "react";

const STORAGE_KEY = "cookie_consent";
const CONSENT_VERSION = "1";

export const useCookieConsent = () => {
  const [consent, setConsent] = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.version === CONSENT_VERSION) {
          setConsent(parsed);
        }
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const saveConsent = (value) => {
    const data = {
      ...value,
      version: CONSENT_VERSION,
      date: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setConsent(data);
  };

  const acceptAll = () => saveConsent({ essential: true, analytics: true });
  const rejectAll = () => saveConsent({ essential: true, analytics: false });

  const resetConsent = () => {
    localStorage.removeItem(STORAGE_KEY);
    setConsent(null);
  };

  return {
    consent,
    hasDecided: consent !== null,
    acceptAll,
    rejectAll,
    resetConsent,
  };
};
