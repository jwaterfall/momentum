# ============================================
# Stage 1: Dependencies Installation Stage
# ============================================

# IMPORTANT: Node.js Version Maintenance
# This Dockerfile uses Node.js 20-alpine, which was the latest LTS version at the time of writing.
# To ensure security and compatibility, regularly update the NODE_VERSION ARG to the latest LTS version.
ARG NODE_VERSION=20-alpine

FROM node:${NODE_VERSION} AS dependencies

# Set working directory
WORKDIR /app

# Copy package-related files first to leverage Docker's caching mechanism
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* .npmrc* ./

# Install project dependencies with frozen lockfile for reproducible builds
RUN --mount=type=cache,target=/root/.npm \
    --mount=type=cache,target=/usr/local/share/.cache/yarn \
    --mount=type=cache,target=/root/.local/share/pnpm/store \
  if [ -f package-lock.json ]; then \
    npm ci --no-audit --no-fund; \
  elif [ -f yarn.lock ]; then \
    corepack enable yarn && yarn install --frozen-lockfile --production=false; \
  elif [ -f pnpm-lock.yaml ]; then \
    corepack enable pnpm && pnpm install --frozen-lockfile; \
  else \
    echo "No lockfile found." && exit 1; \
  fi

# ============================================
# Stage 2: Build Next.js application in standalone mode
# ============================================

FROM node:${NODE_VERSION} AS builder

# Set working directory
WORKDIR /app

# Copy project dependencies from dependencies stage
COPY --from=dependencies /app/node_modules ./node_modules

# Copy application source code
COPY . .

ENV NODE_ENV=production

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
ENV NEXT_TELEMETRY_DISABLED=1

# Provide a dummy DATABASE_URL during build time
# Next.js won't actually connect to the database during build, but it needs
# the environment variable to exist to avoid errors when importing db modules
ENV DATABASE_URL="postgres://dummy:dummy@localhost:5432/dummy"

# Build Next.js application
# If you want to speed up Docker rebuilds, you can cache the build artifacts
# by adding: --mount=type=cache,target=/app/.next/cache
RUN if [ -f package-lock.json ]; then \
    npm run build; \
  elif [ -f yarn.lock ]; then \
    corepack enable yarn && yarn build; \
  elif [ -f pnpm-lock.yaml ]; then \
    corepack enable pnpm && pnpm build; \
  else \
    echo "No lockfile found." && exit 1; \
  fi

# ============================================
# Stage 3: Run Next.js application
# ============================================

FROM node:${NODE_VERSION} AS runner

# Set working directory
WORKDIR /app

# Install PostgreSQL client for pg_isready (needed for database health checks and migrations)
RUN apk add --no-cache postgresql-client

# Set production environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
ENV NEXT_TELEMETRY_DISABLED=1

# Copy production assets
COPY --from=builder --chown=node:node /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown node:node .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

# Copy files needed for database migrations
COPY --from=builder --chown=node:node /app/drizzle ./drizzle
COPY --from=builder --chown=node:node /app/drizzle.config.ts ./
COPY --from=builder --chown=node:node /app/package.json ./
COPY --from=builder --chown=node:node /app/pnpm-lock.yaml* ./
COPY --from=builder --chown=node:node /app/yarn.lock* ./
COPY --from=builder --chown=node:node /app/package-lock.json* ./
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/src ./src

# Switch to non-root user for security best practices
USER node

# Expose port 3000 to allow HTTP traffic
EXPOSE 3000

# Run migrations then start Next.js standalone server
# docker-compose handles database readiness via depends_on healthcheck
CMD sh -c "npx drizzle-kit migrate && node server.js"
