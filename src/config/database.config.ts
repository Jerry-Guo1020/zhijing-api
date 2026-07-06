import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  host: process.env.DB_HOST ?? '127.0.0.1',
  port: Number(process.env.DB_PORT ?? 3306),
  username: process.env.DB_USERNAME ?? 'root',
  password: process.env.DB_PASSWORD ?? '123456',
  database: process.env.DB_NAME ?? 'zhijing_db',
  synchronize: (process.env.DB_SYNCHRONIZE ?? 'false') === 'true',
  logging: (process.env.DB_LOGGING ?? 'false') === 'true',
}));
