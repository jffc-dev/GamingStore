import { z } from 'zod';

export const envSchema = z.object({
  PORT: z.coerce.number().min(1),
  PG_URL: z.string().url(),
  PG_PASSWORD: z.string(),
  PG_DBNAME: z.string(),
  JWT_SECRET: z.string(),
  RESET_PASSWORD_EXPIRATION_MS: z.coerce.number().min(1),
  STRIPE_API_KEY: z.string().nonempty(),
  STRIPE_WEBHOOK_KEY: z.string().nonempty(),
  CORS_ORIGINS: z.string().nonempty(),
  MAIL_HOST: z.string().nonempty(),
  MAIL_PORT: z.coerce.number().min(1),
  MAIL_USER: z.string().nonempty(),
  MAIL_PASS: z.string().nonempty(),
  HOST_API: z.string().nonempty(),
  CLOUDINARY_CLOUD_NAME: z.string().nonempty(),
  CLOUDINARY_API_KEY: z.string().nonempty(),
  CLOUDINARY_API_SECRET: z.string().nonempty(),
});

export type Env = z.infer<typeof envSchema>;
