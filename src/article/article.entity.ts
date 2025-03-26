type ArticleTags = string[];

interface Article {
  id: string;
  name: string;
  content: string;
  tags: ArticleTags;
  isPublic: boolean;
}

interface IArticleRepository {
  addArticle(article: Article): Article;
  getArticles(tags?: ArticleTags): Article[];
  getArticleById(id: string): Article | null;
  changeArticle(id: string, article: Article): Article | null;
  deleteArticle(id: string): void | null;
}

export class ArticleEntity implements IArticleRepository {
  private articles: Article[] = [];

  addArticle(article: Omit<Article, 'id'>) {
    const newArticle: Article = { id: crypto.randomUUID(), ...article };

    this.articles.push(newArticle);

    return newArticle;
  }

  getArticles(tags: ArticleTags): Article[] {
    if (tags) {
      return this.articles.filter((item) =>
        tags.some((tag) => item.tags.includes(tag)),
      );
    }

    return this.articles;
  }

  getArticleById(id: string): Article | null {
    const article = this.articles.find((item) => item.id === id);

    if (!article) {
      return null;
    }

    return article;
  }

  changeArticle(
    id: string,
    changedArticle: Omit<Article, 'id'>,
  ): Article | null {
    const index = this.articles.findIndex((item) => item.id === id);

    if (index === -1) {
      return null;
    }

    this.articles[index] = { ...this.articles[index], ...changedArticle };

    return this.articles[index];
  }

  deleteArticle(id: string): string | null {
    const article = this.articles.find((item) => item.id === id);

    if (!article) {
      return null;
    }

    this.articles = this.articles.filter((item) => item.id !== article.id);

    return article.id;
  }
}
