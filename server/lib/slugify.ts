/** "Café Crawl İstanbul" becomes "cafe-crawl-istanbul": the tour's address on the site. */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/ı/g, "i")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
