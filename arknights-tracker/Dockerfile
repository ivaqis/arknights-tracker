FROM node:22-slim AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build && find build -name "*.map" -delete

FROM node:22-slim

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

COPY --chown=node:node --from=build /app/build ./build
COPY --chown=node:node --from=build /app/package*.json ./
COPY --chown=node:node --from=build /app/entrypoint.sh /app/entrypoint.sh

RUN npm ci --omit=dev --ignore-scripts && chmod +x /app/entrypoint.sh

USER node

EXPOSE 3000

ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["node", "build"]
