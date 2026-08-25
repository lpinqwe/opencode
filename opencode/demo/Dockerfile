FROM node:20-slim AS build
WORKDIR /app

# Copy package files
COPY demo/package.json demo/package-lock.json* ./

# Install dependencies
RUN npm install

# Copy source
COPY demo/ .

# Build
RUN npm run build

# Production
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
