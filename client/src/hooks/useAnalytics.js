import { trackEvent } from "../lib/gtm.js";

export const useAnalytics = () => {
  const trackTourView = (tour) => {
    trackEvent("tour_view", {
      tour_id: tour.id,
      tour_name: tour.tour_name,
      tour_category: tour.category,
      tour_price: tour.price,
    });
  };

  const trackBookingStarted = (tour) => {
    trackEvent("booking_started", {
      tour_id: tour.id,
      tour_name: tour.tour_name,
      tour_price: tour.price,
    });
  };

  const trackBookingCompleted = (booking) => {
    trackEvent("purchase", {
      transaction_id: booking.booking_reference,
      value: booking.total_price,
      currency: "USD",
      items: [
        {
          item_id: booking.tour_id,
          item_name: booking.tour_name,
          price: booking.total_price,
          quantity: 1,
        },
      ],
    });
  };

  const trackFilterUsed = (filterType, filterValue) => {
    trackEvent("filter_used", {
      filter_type: filterType,
      filter_value: filterValue,
    });
  };

  const trackSearchUsed = (searchTerm) => {
    trackEvent("search", {
      search_term: searchTerm,
    });
  };

  const trackWishlistAdd = (tour) => {
    trackEvent("add_to_wishlist", {
      tour_id: tour.id,
      tour_name: tour.tour_name,
      tour_price: tour.price,
    });
  };

  const trackContactFormSubmit = () => {
    trackEvent("contact_form_submit");
  };

  const trackMiloOpen = () => {
    trackEvent("milo_chat_opened");
  };

  const trackMiloMessage = () => {
    trackEvent("milo_message_sent");
  };

  return {
    trackTourView,
    trackBookingStarted,
    trackBookingCompleted,
    trackFilterUsed,
    trackSearchUsed,
    trackWishlistAdd,
    trackContactFormSubmit,
    trackMiloOpen,
    trackMiloMessage,
  };
};
