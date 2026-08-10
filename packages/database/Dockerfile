# syntax=docker/dockerfile:1
FROM node:22-alpine
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/database/package.json packages/database/package.json
RUN pnpm install --frozen-lockfile
COPY packages/database packages/database
CMD ["pnpm", "--filter", "@engagement-tools/database", "migrate:deploy"]
