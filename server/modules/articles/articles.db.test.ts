import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { startApp } from "../../test/app.js";
import { resetDb } from "../../test/db.js";
import { addArticleImage, makeArticle, makeAuthor } from "../../test/fixtures.js";
import { knex } from "../../db/knex.js";
import articles from "../../routes/articleRoutes.js";

let app: Awaited<ReturnType<typeof startApp>>;
beforeAll(async () => (app = await startApp(articles)));
afterAll(async () => {
  await app.close();
  await knex.destroy();
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
