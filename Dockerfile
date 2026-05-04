FROM node:20-slim AS build
WORKDIR /workspace

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-slim
WORKDIR /app

COPY --from=build /workspace/public ./public
COPY --from=build /workspace/.next/standalone ./
COPY --from=build /workspace/.next/static ./.next/static

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
