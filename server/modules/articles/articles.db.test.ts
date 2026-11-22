import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { vi } from "vitest";
import { startApp } from "../../test/app.js";
import { resetDb } from "../../test/db.js";
import { db } from "../../test/db.js";
import { articleImages } from "../../db/drizzle/schema.js";
import { eq } from "drizzle-orm";
import { addArticleImage, makeArticle, makeAuthor } from "../../test/fixtures.js";
import articles from "./articles.routes.js";

vi.mock("../../middleware/auth.js", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../middleware/auth.js")>()),
  requireAuth: (_req: unknown, _res: unknown, next: () => void) => next(),
}));

let app: Awaited<ReturnType<typeof startApp>>;
let staff: typeof app;
let visitor: typeof app;
beforeAll(async () => {
  app = await startApp(articles);
  staff = await startApp(articles, { role: "manager" });
  visitor = await startApp(articles, { role: "guide" });
});
afterAll(async () => {
  await Promise.all([app.close(), staff.close(), visitor.close()]);
});
beforeEach(resetDb);

describe("GET /", () => {
  it("lists newest first with author, images and page counts", async () => {
    const author = await makeAuthor();
    const old = await makeArticle({ authorId: author.id, datePosted: "2026-01-01 09:00:00", slug: "old" });
    const recent = await makeArticle({ authorId: author.id, datePosted: "2026-06-01 09:00:00", slug: "recent" });
    await addArticleImage(recent.id, "/img/a.jpg", "First");
    await addArticleImage(recent.id, "/img/b.jpg");

    const res = await app.get("/?limit=1");
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ currentPage: 1, totalPages: 2, total: 2 });
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0]).toMatchObject({
      id: recent.id,
      slug: "recent",
      author_name: "Mehmet Kaya",
      author_avatar: "/authors/mehmet.jpg",
      date_posted: "2026-06-01T09:00:00.000Z",
      images: [{ url: "/img/a.jpg", caption: "First" }, { url: "/img/b.jpg", caption: null }],
    });

    const page2 = await app.get("/?limit=1&page=2");
    expect(page2.body.data[0].id).toBe(old.id);
    expect(page2.body.currentPage).toBe(2);
  });

  it("filters by category, and 'all' means everything", async () => {
    await makeArticle({ category: "food" });
    await makeArticle({ category: "history" });
    expect((await app.get("/?category=food")).body.total).toBe(1);
    expect((await app.get("/?category=all")).body.total).toBe(2);
  });

  it("returns an empty page for an empty site", async () => {
    const res = await app.get("/");
    expect(res.body).toEqual({ data: [], currentPage: 1, totalPages: 0, total: 0 });
  });
});

describe("GET /:slug", () => {
  it("returns the article with author details, ordered images and related articles", async () => {
    const author = await makeAuthor();
    const main = await makeArticle({ authorId: author.id, category: "food", slug: "main", title: "Main" });
    await addArticleImage(main.id, "/img/1.jpg", "One");
    await addArticleImage(main.id, "/img/2.jpg");
    const sibling = await makeArticle({ category: "food", slug: "sibling", title: "Sibling" });
    await addArticleImage(sibling.id, "/img/s.jpg");
    await makeArticle({ category: "history", slug: "other" });

    const res = await app.get("/main");
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: main.id, title: "Main", content: "<p>Body</p>", author_name: "Mehmet Kaya", author_bio: "Istanbul local",
      images: [{ url: "/img/1.jpg", caption: "One" }, { url: "/img/2.jpg", caption: null }],
    });
    expect(res.body.related).toHaveLength(1);
    expect(res.body.related[0]).toMatchObject({ id: sibling.id, slug: "sibling", image_url: "/img/s.jpg" });
  });

  it("answers 404 for an unknown slug", async () => {
    const res = await app.get("/nope");
    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Article not found");
  });
});

describe("writing articles", () => {
  const body = { title: "New", content: "<p>Hi</p>", category: "food", slug: "new-one" };

  it("only lets admins and managers write", async () => {
    expect((await app.post("/", body)).status).toBe(403);
    expect((await visitor.post("/", body)).status).toBe(403);
    expect((await visitor.put("/1", { title: "x" })).status).toBe(403);
    expect((await staff.post("/", body)).status).toBe(201);
  });

  it("creates an article with its images, and rejects a taken slug", async () => {
    const created = await staff.post("/", { ...body, images: [{ url: "/a.jpg", caption: " Cover " }, { url: "/b.jpg" }] });
    expect(created.body).toMatchObject({ title: "New", slug: "new-one", category: "food" });
    const read = await app.get("/new-one");
    expect(read.body.images).toEqual([{ url: "/a.jpg", caption: "Cover" }, { url: "/b.jpg", caption: null }]);

    const again = await staff.post("/", body);
    expect(again.status).toBe(409);
  });

  it("validates input", async () => {
    expect((await staff.post("/", { ...body, slug: "Not A Slug" })).status).toBe(400);
    expect((await staff.post("/", { title: "x" })).status).toBe(400);
  });

  it("replaces images on update, leaves them alone when none are sent, and 404s for unknown ids", async () => {
    const article = await makeArticle();
    await addArticleImage(article.id, "/old.jpg");

    await staff.put(`/${article.id}`, { title: "Renamed" });
    expect((await db.select().from(articleImages).where(eq(articleImages.articleId, article.id)))).toHaveLength(1);

    const res = await staff.put(`/${article.id}`, { images: [{ url: "/new1.jpg" }, { url: "/new2.jpg" }] });
    expect(res.status).toBe(200);
    const urls = (await db.select().from(articleImages).where(eq(articleImages.articleId, article.id))).map((i) => i.imageUrl);
    expect(urls).toEqual(["/new1.jpg", "/new2.jpg"]);

    expect((await staff.put("/999999", { title: "x" })).status).toBe(404);
  });
});

describe("GET /:slug related", () => {
  it("shows each related article once even when it has several images", async () => {
    const main = await makeArticle({ category: "food", slug: "m" });
    const other = await makeArticle({ category: "food", slug: "o" });
    await addArticleImage(other.id, "/1.jpg");
    await addArticleImage(other.id, "/2.jpg");
    const res = await app.get(`/${main.slug}`);
    expect(res.body.related).toHaveLength(1);
    expect(res.body.related[0].image_url).toBe("/1.jpg");
  });
});
