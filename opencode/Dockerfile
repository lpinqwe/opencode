FROM oven/bun:1.3.14 AS build
WORKDIR /app

# Copy everything at once - dockerignore handles exclusions
COPY . .

# Install dependencies
RUN bun install

# Build the web app
RUN bun run --cwd packages/app build

# Production stage with nginx
FROM nginx:alpine
COPY --from=build /app/packages/app/dist /usr/share/nginx/html
COPY --from=build /app/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
