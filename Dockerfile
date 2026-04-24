FROM node:20-slim AS build
WORKDIR /workspace

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-slim
WORKDIR /app

COPY --from=build /workspace/node_modules ./node_modules
COPY --from=build /workspace/dist ./dist
COPY --from=build /workspace/package.json ./package.json

EXPOSE 4173

CMD ["npm", "run", "preview"]
