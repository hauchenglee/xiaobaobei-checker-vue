FROM node:20.18.1-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

FROM node:20.18.1-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV STATIC_PORT=8080

COPY --from=build /app/dist ./dist
COPY server.mjs ./server.mjs

EXPOSE 8080

CMD ["node", "server.mjs"]
