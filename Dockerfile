# Stage 1: Install dependencies
FROM node:22-alpine AS deps
RUN apk add --no-cache git
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --prefer-offline

# Stage 2: Build Next.js
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN npm run build

# Stage 3: Production
FROM node:22-alpine AS production
WORKDIR /app

RUN addgroup -g 1001 -S nodejs && adduser -S studio -u 1001

# Copy built assets, server, and Sentry configs
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/server ./server
COPY --from=builder /app/messages ./messages
COPY --from=builder /app/package.json ./
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/sentry.client.config.ts ./
COPY --from=builder /app/sentry.server.config.ts ./
COPY --from=builder /app/sentry.edge.config.ts ./
COPY --from=deps /app/node_modules ./node_modules

USER studio

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["node", "server/index.js"]
