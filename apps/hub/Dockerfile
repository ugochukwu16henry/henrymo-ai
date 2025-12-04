FROM node:18-alpine AS builder

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm i -g pnpm && pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

# ---- Production image ----
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/package.json .
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.mjs .
COPY --from=builder /app/tsconfig.json .
COPY --from=builder /app/tailwind.config.ts .
COPY --from=builder /app/postcss.config.mjs .

EXPOSE 3000
CMD ["node", "server.js"]
