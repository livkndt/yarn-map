// Load dotenv for local development
// In Netlify, environment variables are already available in process.env
import 'dotenv/config';

export default {
  schema: './prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL || '',
  },
};
