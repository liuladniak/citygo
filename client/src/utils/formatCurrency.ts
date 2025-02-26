// const CURRENCY_FORMATTER = new Intl.NumberFormat(undefined, {
//   currency: "USD",
//   style: "currency",
// });

// export function formatCurrency(number: number) {
//   return CURRENCY_FORMATTER.format(number);
// }

export function formatCurrency(number: number, currency: string = "USD") {
  const CURRENCY_FORMATTER = new Intl.NumberFormat(undefined, {
    currency,
    style: "currency",
  });

  return CURRENCY_FORMATTER.format(number);
}
