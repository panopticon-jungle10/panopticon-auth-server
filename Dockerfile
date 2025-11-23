# Build stage
FROM node:20-bullseye AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
# Ensure prisma schema is available and generate the client for Linux
COPY prisma ./prisma
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
COPY --from=builder /app/.prisma ./.prisma
ENV NODE_ENV=production
EXPOSE 8080
CMD [ "node", "dist/main.js" ]