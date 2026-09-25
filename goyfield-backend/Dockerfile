FROM node:22-slim

WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY --chown=node:node package*.json ./
COPY --chown=node:node tsconfig.json ./
COPY --chown=node:node prisma ./prisma

RUN npm ci && npm run prisma:v2:generate

COPY --chown=node:node src ./src
COPY --chown=node:node static ./static
COPY --chown=node:node entrypoint.sh ./entrypoint.sh
RUN chmod +x entrypoint.sh && npm run build

ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

USER node

ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["node", "dist/src/main.js"]
