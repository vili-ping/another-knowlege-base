import http from 'http';
import { URL } from 'url';
import { ArticleEntity } from './article/article.entity';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import { UserEntity } from './users/user.entity';

dotenv.config();

export const pool = new Pool({
  connectionString: `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:5432/${process.env.POSTGRES_DB}`,
});

const articles = new ArticleEntity(pool);
const users = new UserEntity(pool);

http
  .createServer(async (req, res) => {
    if (!req.url) return;

    const url = new URL(req.url, `http://${req.headers.host}`);
    const method = req.method;

    if (url.pathname.startsWith('/users/') && method === 'GET') {
      const id = url.pathname.split('/')[2];
      const user = await users.getUser(id);

      if (!user) {
        res.writeHead(404);
        res.end();
        return;
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(user));

      return;
    }

    if (url.pathname === '/users' && method === 'POST') {
      let body = '';
      req.on('data', (chunk) => (body += chunk));
      req.on('end', async () => {
        const user = await users.createUser(JSON.parse(body));
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(user));
      });

      return;
    }

    if (url.pathname === '/articles' && method === 'GET') {
      const userEmail = req.headers.authorization;
      const tags = url.searchParams.getAll('tag');

      if (userEmail) {
        const user = await users.getUser(userEmail);
        if (!user) {
          const arts = (await articles.getArticles(tags)).filter(
            (art) => art.is_public,
          );
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(arts));

          return;
        }
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(await articles.getArticles(tags)));

      return;
    }

    if (url.pathname.startsWith('/articles/') && method === 'GET') {
      const id = url.pathname.split('/')[2];
      const article = await articles.getArticleById(id);

      if (!article) {
        res.writeHead(404);
        res.end();
        return;
      }

      const userEmail = req.headers.authorization;

      if (userEmail) {
        const user = await users.getUser(userEmail);
        if (!user && !article.is_public) {
          res.writeHead(403);
          res.end();
          return;
        }
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(article));

      return;
    }

    if (url.pathname === '/articles' && method === 'POST') {
      const userEmail = req.headers.authorization;

      if (userEmail) {
        const user = await users.getUser(userEmail);
        if (!user) {
          res.writeHead(403);
          res.end();
          return;
        }
      }

      let body = '';
      req.on('data', (chunk) => (body += chunk));
      req.on('end', async () => {
        const article = await articles.addArticle(JSON.parse(body));
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(article));
      });

      return;
    }

    if (url.pathname.startsWith('/articles/') && method === 'PATCH') {
      const userEmail = req.headers.authorization;

      if (userEmail) {
        const user = await users.getUser(userEmail);
        if (!user) {
          res.writeHead(403);
          res.end();
          return;
        }
      }

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

      const userEmail = req.headers.authorization;

      if (userEmail) {
        const user = await users.getUser(userEmail);
        if (!user) {
          res.writeHead(403);
          res.end();
          return;
        }
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
