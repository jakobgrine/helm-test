FROM node:20-alpine AS base

FROM base AS builder

RUN corepack enable
RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY package*.json tsconfig.json src ./

RUN pnpm install && pnpm build && pnpm prune --prod

FROM base AS runner

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs
USER nodejs

WORKDIR /app

COPY --from=builder --chown=nodejs:nodejs /app/package.json /app/package.json
COPY --from=builder --chown=nodejs:nodejs /app/node_modules /app/node_modules
COPY --from=builder --chown=nodejs:nodejs /app/dist /app/dist

EXPOSE 3000

CMD ["node", "/app/dist/index.js"]
