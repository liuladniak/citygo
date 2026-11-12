// Decides how a markdown link in a Milo message may be rendered. AI text is
// untrusted, so only same-site paths and http(s) URLs become links.

export const linkKind = (url) => {
  const u = String(url).trim();
  if (u.startsWith("/") && !u.startsWith("//") && !u.includes("\\")) {
    return "internal";
  }
  if (/^https?:\/\//i.test(u)) return "external";
  return "none";
};
