export const formatPrice = (price) => {
  const numericPrice = Number(price);
  return numericPrice % 1 === 0
    ? numericPrice.toFixed(0)
    : numericPrice.toFixed(2);
};
