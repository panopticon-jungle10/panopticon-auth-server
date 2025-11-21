# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
RUN npm run build
RUN npm prune --production

# Production stage
FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
# Removed runtime installation of build tools (python3/make/g++)
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
ENV NODE_ENV=production
EXPOSE 8080
CMD [ "node", "dist/main.js" ]