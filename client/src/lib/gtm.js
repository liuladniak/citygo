import TagManager from "react-gtm-module";

export const initGTM = () => {
  TagManager.initialize({
    gtmId: import.meta.env.VITE_GTM_ID,
  });
};

export const trackEvent = (eventName, eventData = {}) => {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: eventName,
    ...eventData,
  });
};
