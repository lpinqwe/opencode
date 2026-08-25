FROM node:20-slim AS build
WORKDIR /app

# Copy demo package files
COPY demo/package.json ./

# Install dependencies
RUN npm install --include=dev --legacy-peer-deps

# Copy demo source
COPY demo/ .

# Build with local vite (not npx which downloads v8 requiring Node 20+)
RUN ./node_modules/.bin/vite build

# Production
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
