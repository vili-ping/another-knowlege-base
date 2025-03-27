import { Pool } from 'pg';

interface User {
  id: string;
  email: string;
}

interface IArticleRepository {
  createUser(user: User): Promise<User>;
  getUser(email: string): Promise<User | null>;
}

export class UserEntity implements IArticleRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async createUser(user: Omit<User, 'id'>): Promise<User> {
    const { email } = user;
    const id = crypto.randomUUID();
    const userResult = await this.pool.query(
      'INSERT INTO users (id, email) VALUES ($1, $2) RETURNING *',
      [id, email],
    );

    return userResult.rows[0];
  }

  async getUser(email: string): Promise<User | null> {
    const userResult = await this.pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email],
    );

    return userResult.rows[0];
  }
}
