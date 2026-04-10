# Use a slim Node image to save space
FROM node:20-alpine
RUN apk update && apk upgrade

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 8080 

CMD ["node", "index.js"]