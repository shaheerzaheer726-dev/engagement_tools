# syntax=docker/dockerfile:1
FROM node:22-alpine AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable
WORKDIR /app

FROM base AS builder
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json turbo.json ./
COPY apps/worker apps/worker
COPY packages/database packages/database
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @engagement-tools/worker... build
RUN pnpm deploy --filter @engagement-tools/worker --prod /prod/worker

FROM node:22-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 worker
COPY --from=builder --chown=worker:nodejs /prod/worker ./
USER worker
EXPOSE 3001
CMD ["node", "--enable-source-maps", "dist/index.js"]
