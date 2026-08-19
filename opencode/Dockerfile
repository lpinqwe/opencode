FROM oven/bun:1.3.14 AS base
WORKDIR /app

# Copy everything first so bun can resolve all workspaces
COPY package.json bun.lock turbo.json tsconfig.json ./
COPY packages/ packages/

# Install dependencies
RUN bun install || true

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
