# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN apk add --no-cache python3 make g++ || true
# Copy node_modules from the builder to ensure all runtime dependencies (like class-validator)
# are present in the final image. This avoids issues where `npm ci --production` may
# not install a package due to lockfile/platform mismatch.
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
EXPOSE 8080
CMD [ "node", "dist/main.js" ]
