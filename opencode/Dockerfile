FROM oven/bun:1.3.14 AS base
WORKDIR /app

# Copy all package.json files for workspace resolution
COPY package.json bun.lock ./
COPY packages/*/package.json packages/
COPY packages/sdk/js/package.json packages/sdk/js/
COPY packages/console/*/package.json packages/console/
COPY packages/stats/*/package.json packages/stats/

# Install dependencies
RUN bun install --frozen-lockfile || bun install

# Copy source code
COPY . .

# Build the app
RUN bun run --cwd packages/app build

# Production stage
FROM nginx:alpine AS production

# Copy built app
COPY --from=base /app/packages/app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
