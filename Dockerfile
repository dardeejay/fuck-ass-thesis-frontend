FROM node:22-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Dummy build-time values so lib/env.ts (zod-validated) and `prisma generate`
# don't fail during `next build` — pages that need the real values are all
# `force-dynamic`, so nothing here is baked into the build output. The
# runtime container gets the real values via docker-compose `environment`.
ENV NODE_ENV=production
ENV AUTH_SECRET=build-time-placeholder
ENV DATABASE_URL=postgresql://postgres:postgres@localhost:5432/project_handa
ENV POSTGRES_DB=project_handa
ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=postgres
ENV POSTGRES_PORT=5432
ENV HANDA_API_URL=http://localhost:8000

RUN npx prisma generate
RUN npm run build

FROM node:22-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
