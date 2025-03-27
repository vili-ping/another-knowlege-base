import { Pool } from 'pg';

type ArticleTags = string[];

interface Article {
  id: string;
  name: string;
  content: string;
  tags: ArticleTags;
  is_public: boolean;
}

interface IArticleRepository {
  addArticle(article: Article): Promise<Article>;
  getArticles(tags?: ArticleTags): Promise<Article[]>;
  getArticleById(id: string): Promise<Article | null>;
  changeArticle(id: string, article: Article): Promise<Article | null>;
  deleteArticle(id: string): Promise<string | null>;
}

export class ArticleEntity implements IArticleRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async addArticle(article: Omit<Article, 'id'>): Promise<Article> {
    const { name, content, tags, is_public } = article;
    const id = crypto.randomUUID();

    const result = await this.pool.query(
      'INSERT INTO articles (id, name, content, is_public) VALUES ($1, $2, $3, $4) RETURNING *',
      [id, name, content, is_public],
    );
    const newArticle = result.rows[0];

    for (const tag of tags) {
      let tagId = await this.getTagIdByName(tag);

      if (!tagId) {
        const newTagId = crypto.randomUUID();
        const tagResult = await this.pool.query(
          'INSERT INTO tags (id, name) VALUES ($1, $2) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id;',
          [newTagId, name],
        );
        tagId = tagResult.rows[0].id;
      }

      await this.pool.query(
        'INSERT INTO article_tags (article_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING;',
        [id, tagId],
      );
    }

    console.log(newArticle);

    return newArticle;
  }

  async getArticles(tags: string[]): Promise<Article[]> {
    if (tags.length) {
      return this.getArticlesByTags(tags);
    }

    const result = await this.pool.query('SELECT * FROM articles');
    return result.rows;
  }

  async getArticleById(id: string): Promise<Article | null> {
    const result = await this.pool.query(
      'SELECT * FROM articles WHERE id = $1',
      [id],
    );

    if (result.rows.length === 0) {
      return null;
    }

    const article = result.rows[0];

    const tagsResult = await this.pool.query(
      'SELECT t.name FROM tags t INNER JOIN article_tags at ON t.id = at.tag_id WHERE at.article_id = $1',
      [id],
    );

    article.tags = tagsResult.rows.map((row) => row.name);

    return article;
  }

  private async getTagIdByName(name: string): Promise<string | null> {
    const result = await this.pool.query(
      'SELECT id FROM tags WHERE name = $1',
      [name],
    );
    return result.rows.length > 0 ? result.rows[0].id : null;
  }

  async changeArticle(
    id: string,
    changedArticle: Omit<Article, 'id'>,
  ): Promise<Article | null> {
    const { name, content, tags, is_public } = changedArticle;

    const result = await this.pool.query(
      'UPDATE articles SET name = $1, content = $2, is_public = $3 WHERE id = $4 RETURNING *',
      [name, content, is_public, id],
    );

    if (result.rows.length === 0) {
      return null;
    }

    const updatedArticle = result.rows[0];

    await this.pool.query('DELETE FROM article_tags WHERE article_id = $1', [
      id,
    ]);

    for (const tag of tags) {
      let tagId = await this.getTagIdByName(tag);

      if (!tagId) {
        const tagResult = await this.pool.query(
          'INSERT INTO tags (name) VALUES ($1) RETURNING id',
          [tag],
        );
        tagId = tagResult.rows[0].id;
      }

      await this.pool.query(
        'INSERT INTO article_tags (article_id, tag_id) VALUES ($1, $2)',
        [id, tagId],
      );
    }

    return updatedArticle;
  }

  async deleteArticle(id: string): Promise<string | null> {
    const result = await this.pool.query(
      'DELETE FROM articles WHERE id = $1 RETURNING id',
      [id],
    );

    if (result.rows.length === 0) {
      return null;
    }

    await this.pool.query('DELETE FROM article_tags WHERE article_id = $1', [
      id,
    ]);

    return result.rows[0].id;
  }

  private async getArticlesByTags(tags: string[]): Promise<Article[]> {
    const result = await this.pool.query(
      'SELECT a.* FROM articles a INNER JOIN article_tags at ON a.id = at.article_id INNER JOIN tags t ON at.tag_id = t.id WHERE t.name = ANY($1)',
      [tags],
    );
    return result.rows;
  }
}
