# STAGE 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install

ARG VITE_API_URL
ARG VITE_STRIPE_PUBLIC_KEY
ARG VITE_TEST_EMAIL
ARG VITE_TEST_PASSWORD

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_STRIPE_PUBLIC_KEY=$VITE_STRIPE_PUBLIC_KEY
ENV VITE_TEST_EMAIL=$VITE_TEST_EMAIL
ENV VITE_TEST_PASSWORD=$VITE_TEST_PASSWORD

COPY . .
RUN npm run build

FROM nginx:stable-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]