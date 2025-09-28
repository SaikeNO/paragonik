FROM node:20-alpine3.16 AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c6#nodealpine to understand why libc6-compat might be needed.
# ZMIANA: Dodajemy sqlite i openssl w fazie deps, aby były dostępne podczas instalacji zależności i budowania
RUN apk add --no-cache libc6-compat sqlite openssl
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generowanie klienta Prismy musi być wykonane przed budowaniem, aby był dostępny dla Next.js
# ZMIANA: Dodajemy wywołanie npx prisma generate przed budowaniem aplikacji Next.js
RUN npx prisma generate
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# ZMIANA: Musimy upewnić się, że wymagane pakiety są w runnerze.
# Instalujemy je ponownie, aby obraz 'runner' nie musiał brać ich z 'deps' (co by było większe).
# Alternatywnie, możemy użyć obrazu 'base', ale musimy mieć pewność, że te zależności są w nim.
# Ponieważ 'base' to node:20-alpine, instalujemy je tutaj, co jest najlepszą praktyką.
RUN apk add --no-cache sqlite openssl

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# ZMIANA: Kopiowanie katalogu prisma (schemat i migracje)
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000

ENV HOSTNAME="0.0.0.0"

# ZMIANA: Uruchomienie migracji Prismy przed startem aplikacji.
# Generowanie klienta jest opcjonalne, jeśli zostało wykonane w fazie builder,
# ale npx prisma generate jest tu potrzebne, aby mieć pewność, że binarne pliki silników zostały poprawnie skopiowane.
CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]