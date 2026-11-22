# Build stage: install everything and compile TypeScript/JS into dist/
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Runtime stage: production dependencies only, no tsx, no test tools
FROM node:20-alpine
RUN apk update && apk upgrade
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
COPY --from=build /app/dist ./dist

EXPOSE 8080

CMD ["node", "--enable-source-maps", "dist/index.js"]
