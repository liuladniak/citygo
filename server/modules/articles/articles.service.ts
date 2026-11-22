import { and, asc, count, desc, eq, inArray, ne, sql } from "drizzle-orm";
import { db } from "../../db/index.js";
import { articleImages, articles, authors } from "../../db/drizzle/schema.js";
import { toIsoTimestamp } from "../../lib/dates.js";
import { conflict, notFound } from "../../lib/errors.js";
import type { CreateBody, ListQuery, UpdateBody } from "./articles.schemas.js";

const RELATED_LIMIT = 3;

// The API speaks snake_case, so every select is aliased once here.
const card = {
  id: articles.id,
  title: articles.title,
  author_id: articles.authorId,
  category: articles.category,
  date_posted: articles.datePosted,
  read_time: articles.readTime,
  slug: articles.slug,
  description: articles.description,
};

const withIsoDate = <T extends { date_posted: string | null }>(row: T) => ({
  ...row,
  date_posted: row.date_posted === null ? null : toIsoTimestamp(row.date_posted),
});

const toImages = (rows: { url: string; caption: string | null }[]) =>
  rows.map(({ url, caption }) => ({ url, caption }));

const isUniqueViolation = (err: unknown) =>
  typeof err === "object" && err !== null && "cause" in err && (err.cause as { code?: string })?.code === "23505";

/** One page of articles, newest first. Cards carry no body text; the article page loads it. */
export async function listArticles({ page, limit, category }: ListQuery) {
  const filter = category && category !== "all" ? eq(articles.category, category) : undefined;

  const [[{ total }], rows] = await Promise.all([
    db.select({ total: count() }).from(articles).where(filter),
    db
      .select({ ...card, author_name: authors.name, author_avatar: authors.profileImage })
      .from(articles)
      .leftJoin(authors, eq(articles.authorId, authors.id))
      .where(filter)
      .orderBy(desc(articles.datePosted), desc(articles.id))
      .limit(limit)
      .offset((page - 1) * limit),
  ]);

  const images = rows.length
    ? await db
        .select({ articleId: articleImages.articleId, url: articleImages.imageUrl, caption: articleImages.caption })
        .from(articleImages)
        .where(inArray(articleImages.articleId, rows.map((r) => r.id)))
        .orderBy(asc(articleImages.id))
    : [];

  const byArticle = new Map<number | null, typeof images>();
  for (const img of images) byArticle.set(img.articleId, [...(byArticle.get(img.articleId) ?? []), img]);

  return {
    data: rows.map((row) => ({ ...withIsoDate(row), images: toImages(byArticle.get(row.id) ?? []) })),
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    total,
  };
}

/** One article with its author, ordered images and a few more from the same category. */
export async function getArticleBySlug(slug: string) {
  const [article] = await db
    .select({
      ...card,
      content: articles.content,
      author_name: authors.name,
      author_bio: authors.bio,
      author_avatar: authors.profileImage,
    })
    .from(articles)
    .leftJoin(authors, eq(articles.authorId, authors.id))
    .where(eq(articles.slug, slug))
    .limit(1);

  if (!article) throw notFound("Article not found");

  const [images, related] = await Promise.all([
    db
      .select({ url: articleImages.imageUrl, caption: articleImages.caption })
      .from(articleImages)
      .where(eq(articleImages.articleId, article.id))
      .orderBy(asc(articleImages.id)),
    db
      .select({
        id: articles.id,
        title: articles.title,
        slug: articles.slug,
        category: articles.category,
        date_posted: articles.datePosted,
        read_time: articles.readTime,
        description: articles.description,
        // One cover image per article; a plain join would repeat the article once per image.
        // Drizzle drops the table name from a lone-table column inside a subquery, which would
        // point at article_images.id, so the outer article is named explicitly.
        image_url: sql<string | null>`(
          select i.image_url from article_images i
          where i.article_id = "articles"."id"
          order by i.id limit 1
        )`,
      })
      .from(articles)
      .where(and(eq(articles.category, article.category), ne(articles.id, article.id)))
      .orderBy(desc(articles.datePosted), desc(articles.id))
      .limit(RELATED_LIMIT),
  ]);

  return { ...withIsoDate(article), images: toImages(images), related: related.map(withIsoDate) };
}

export async function createArticle({ images, author_id, title, content, category, description, slug }: CreateBody) {
  try {
    return await db.transaction(async (tx) => {
      const [article] = await tx
        .insert(articles)
        .values({ title, content, category, description: description ?? null, slug, authorId: author_id ?? null })
        .returning(card);

      if (images?.length) {
        await tx
          .insert(articleImages)
          .values(images.map((img) => ({ articleId: article.id, imageUrl: img.url, caption: img.caption })));
      }
      return withIsoDate(article);
    });
  } catch (err) {
    if (isUniqueViolation(err)) throw conflict("An article with this slug already exists");
    throw err;
  }
}

/** Updates the given fields. When images are sent they replace the old set, all or nothing. */
export async function updateArticle(id: number, { images, ...fields }: UpdateBody) {
  await db.transaction(async (tx) => {
    const changes = Object.fromEntries(Object.entries(fields).filter(([, v]) => v !== undefined));
    const [exists] = Object.keys(changes).length
      ? await tx.update(articles).set(changes).where(eq(articles.id, id)).returning({ id: articles.id })
      : await tx.select({ id: articles.id }).from(articles).where(eq(articles.id, id));
    if (!exists) throw notFound("Article not found");

    if (images) {
      await tx.delete(articleImages).where(eq(articleImages.articleId, id));
      if (images.length) {
        await tx
          .insert(articleImages)
          .values(images.map((img) => ({ articleId: id, imageUrl: img.url, caption: img.caption })));
      }
    }
  });
}
