FROM node:22-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM base AS migrator
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json ./
COPY scripts ./scripts
CMD ["sh", "-c", "node scripts/init-db.mjs && node scripts/seed-admin.mjs && node scripts/seed-whatsapp-config.mjs && node scripts/seed-site-content.mjs && node scripts/seed-promotions.mjs && if [ \"$SEED_CATALOG_DEMO\" = \"true\" ]; then node scripts/seed-catalog.mjs; fi"]

FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=deps /app/node_modules ./node_modules
COPY scripts ./scripts
COPY docker/entrypoint.sh ./entrypoint.sh
COPY package.json package-lock.json ./
RUN sed -i 's/\r$//' ./entrypoint.sh && chmod +x ./entrypoint.sh && chown -R nextjs:nodejs /app

USER nextjs
EXPOSE 3000
CMD ["sh", "./entrypoint.sh"]
