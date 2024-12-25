import { z } from 'zod';

export const envSchema = z.object({
  PORT: z.coerce.number().min(1),
  PG_URL: z.string().url(),
  PG_PASSWORD: z.string(),
  PG_DBNAME: z.string(),
  JWT_SECRET: z.string(),
});

export type Env = z.infer<typeof envSchema>;
