import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  name: process.env.APP_NAME ?? 'zhijing-api',
  port: Number(process.env.PORT ?? 3000),
  prefix: process.env.APP_PREFIX ?? 'api',
}));
