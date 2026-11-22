// Profile data is shown back to the guest partly hidden, so a shared screen or an
// over-the-shoulder look does not reveal it. Applied on the server, never in the client.

const hidden = (value: string, keepStart: number, keepEnd: number) => {
  if (value.length <= keepStart + keepEnd) return "*".repeat(value.length);
  return value.slice(0, keepStart) + "*".repeat(value.length - keepStart - keepEnd) + (keepEnd ? value.slice(-keepEnd) : "");
};

export function maskEmail(email: string | null): string {
  if (!email) return "No email provided";
  const at = email.indexOf("@");
  return at < 1 ? hidden(email, 1, 0) : `${email[0]}****${email.slice(at)}`;
}

export function maskPhone(phone: string | null): string {
  return phone ? hidden(phone, 2, 4) : "No phone number provided";
}

export function maskEmergencyContact(contact: string | null): string {
  return contact ? hidden(contact, 2, 4) : "Not provided";
}
