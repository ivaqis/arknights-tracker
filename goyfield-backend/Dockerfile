FROM node:20-slim

WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY tsconfig.json ./
COPY prisma ./prisma

RUN npm ci && npm run prisma:v2:generate

COPY src ./src
COPY static ./static
COPY entrypoint.sh ./entrypoint.sh
RUN npm run build

ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

RUN chmod +x entrypoint.sh && chown -R node:node /app

USER node

ENTRYPOINT ["/app/entrypoint.sh"]
