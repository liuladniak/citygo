export function formatDateTime(dateString) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    // timeStyle: "short",
    timeZone: "UTC",
  }).format(date);
}
