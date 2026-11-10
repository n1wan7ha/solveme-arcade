# Why this exists: a production image of the API.
# Stage 1 compiles TypeScript; stage 2 keeps only what is needed to run and
# runs as the unprivileged "node" user. Drafted with an LLM (Claude Code).

FROM node:22-alpine AS build
WORKDIR /app
RUN apk add --no-cache openssl
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npx prisma generate \
 && npm run build \
 && npm prune --omit=dev --legacy-peer-deps

FROM node:22-alpine
WORKDIR /app
RUN apk add --no-cache openssl
ENV NODE_ENV=production
COPY --from=build --chown=node:node /app/package.json ./
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/prisma ./prisma
COPY --from=build --chown=node:node /app/dist ./dist
USER node
EXPOSE 3000
HEALTHCHECK --interval=15s --timeout=5s --start-period=20s \
  CMD wget -qO- http://localhost:3000/health > /dev/null || exit 1
# Apply any pending migrations, then start the API.
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
