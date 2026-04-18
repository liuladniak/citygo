export const calculateTotal = () => {
  const exchangeRate =
    selectedCurrency === "USD"
      ? 1
      : exchangeRates[selectedCurrency.toLowerCase()] || 1;

  return bookings.reduce((total, booking) => {
    const { price, guests, featured } = booking;
    let totalPrice = guests.adults * price * exchangeRate;
    totalPrice += guests.children * (price * 0.5 * exchangeRate);
    if (featured) totalPrice *= 0.9;
    return total + totalPrice;
  }, 0);
};
