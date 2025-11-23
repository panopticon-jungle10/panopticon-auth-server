# Build stage
FROM node:20-bullseye AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
# Generate prisma client BEFORE pruning (prisma CLI needed)
RUN npx prisma generate --schema=./prisma/schema.prisma
RUN npm run build
RUN npm prune --production

# Production stage
FROM node:20-bullseye
WORKDIR /app
COPY package.json package-lock.json* ./
# Removed runtime installation of build tools (python3/make/g++)
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
# Copy prisma schema and migrations for runtime migration execution
COPY prisma ./prisma
ENV NODE_ENV=production
EXPOSE 8080
# Run migrations and then start the app
CMD [ "sh", "-c", "npx prisma db push --skip-generate --accept-data-loss && node dist/main.js" ]