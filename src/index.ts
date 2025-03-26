import http from 'http';
import { URL } from 'url';
import { ArticleEntity } from './article/article.entity.js';

const articles = new ArticleEntity();

http
  .createServer((req, res) => {
    if (!req.url) return;

    const url = new URL(req.url, `http://${req.headers.host}`);
    const method = req.method;

    if (url.pathname === '/articles' && method === 'GET') {
      const tags = url.searchParams.getAll('tag');

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(articles.getArticles(tags)));

      return;
    }

    if (url.pathname.startsWith('/articles/') && method === 'GET') {
      const id = url.pathname.split('/')[2];
      const article = articles.getArticleById(id);

      if (!article) {
        res.writeHead(404);
        res.end();
        return;
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(articles.getArticleById(id)));

      return;
    }

    if (url.pathname === '/articles' && method === 'POST') {
      let body = '';
      req.on('data', (chunk) => (body += chunk));
      req.on('end', () => {
        const article = articles.addArticle(JSON.parse(body));
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(article));
      });

      return;
    }

    if (url.pathname.startsWith('/articles/') && method === 'PATCH') {
      let body = '';
      req.on('data', (chunk) => (body += chunk));
      req.on('end', () => {
        const id = url.pathname.split('/')[2];
        const updated = articles.changeArticle(id, JSON.parse(body));

        if (!updated) {
          res.writeHead(404);
          res.end();
          return;
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(updated));
      });

      return;
    }

    if (url.pathname.startsWith('/articles/') && method === 'DELETE') {
      const id = url.pathname.split('/')[2];
      const deleted = articles.deleteArticle(id);

      if (!deleted) {
        res.writeHead(404);
        res.end();
        return;
      }

      res.writeHead(204);
      res.end();

      return;
    }

    res.writeHead(404);
    res.end('Not Found');
  })
  .listen(3000, () => {
    console.log('Server running at http://localhost:3000');
  });
