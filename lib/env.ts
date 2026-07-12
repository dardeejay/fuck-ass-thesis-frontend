import 'server-only'
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  AUTH_SECRET: z.string().min(1),
  DATABASE_URL: z.string().url(),
  POSTGRES_DB: z.string().min(1),
  POSTGRES_USER: z.string().min(1),
  POSTGRES_PASSWORD: z.string().min(1),
  POSTGRES_PORT: z.coerce.number().int().positive(),
  HANDA_API_URL: z.string().url(),
})

const parsedEnv = envSchema.safeParse({
  NODE_ENV: process.env.NODE_ENV,
  AUTH_SECRET: process.env.AUTH_SECRET,
  DATABASE_URL: process.env.DATABASE_URL,
  POSTGRES_DB: process.env.POSTGRES_DB,
  POSTGRES_USER: process.env.POSTGRES_USER,
  POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD,
  POSTGRES_PORT: process.env.POSTGRES_PORT,
  HANDA_API_URL: process.env.HANDA_API_URL,
})

if (!parsedEnv.success) {
  const formattedErrors = parsedEnv.error.issues
    .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
    .join('\n')

  throw new Error(`Invalid environment variables:\n${formattedErrors}`)
}

export const env = parsedEnv.data
