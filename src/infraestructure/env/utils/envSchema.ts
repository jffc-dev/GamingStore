import { z } from 'zod';

export const envSchema = z.object({
  PORT: z.coerce.number().min(1),
  PG_URL: z.string().url(),
  PG_PASSWORD: z.string(),
  PG_DBNAME: z.string(),
  JWT_SECRET: z.string(),
  RESET_PASSWORD_EXPIRATION_MS: z.coerce.number().min(1),
  STRIPE_API_KEY: z.string().min(1),
  STRIPE_WEBHOOK_KEY: z.string().min(1),
  CORS_ORIGINS: z.string().min(1),
  MAIL_HOST: z.string().min(1),
  MAIL_PORT: z.coerce.number().min(1),
  MAIL_USER: z.string().min(1),
  MAIL_PASS: z.string().min(1),
});

export type Env = z.infer<typeof envSchema>;
