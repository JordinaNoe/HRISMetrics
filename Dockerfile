# Multi-stage build producing a small runtime image. Works on any host that
# can run a container (Azure App Service/Container Apps, AWS ECS/App Runner,
# Fly.io, Render, a self-managed VM, etc) — not tied to a specific platform.

FROM node:22-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

FROM node:22-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:22-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000

# Run `npx prisma migrate deploy` against DATABASE_URL as a separate step
# before starting new containers (e.g. in CI/CD, or manually) — not done
# here, so that scaling to multiple replicas doesn't race migrations.
CMD ["node", "server.js"]
