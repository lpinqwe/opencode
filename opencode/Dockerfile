FROM oven/bun:1.3.14 AS base
WORKDIR /app

# Copy package files for better caching
COPY package.json bun.lock turbo.json ./
COPY packages/core/package.json packages/core/
COPY packages/app/package.json packages/app/
COPY packages/opencode/package.json packages/opencode/
COPY packages/schema/package.json packages/schema/
COPY packages/sdk/js/package.json packages/sdk/js/

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY packages/ packages/

# Build the app
RUN bun run build --filter=@opencode-ai/app

# Production stage
FROM nginx:alpine AS production

# Copy built app
COPY --from=base /app/packages/app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
