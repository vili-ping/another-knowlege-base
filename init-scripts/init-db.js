/* eslint-disable @typescript-eslint/no-require-imports */
const pg = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const client = new pg.Client({
  user: process.env.POSTGRES_USER,
  host: 'db',
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: 5432,
});

client
  .connect()
  .then(() => {
    return client.query(`
      CREATE TABLE IF NOT EXISTS articles (
        id UUID PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        is_public BOOLEAN DEFAULT TRUE
      );

      CREATE TABLE IF NOT EXISTS tags (
        id UUID PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL
      );

      CREATE TABLE IF NOT EXISTS article_tags (
        article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
        tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
        PRIMARY KEY (article_id, tag_id)
      );

      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL
      );
    `);
  })
  .then(() => {
    console.log('Tables created or already exist');
  })
  .catch((error) => {
    console.error('Error during database initialization:', error);
  })
  .finally(() => {
    client.end();
  });
