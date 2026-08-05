# syntax=docker/dockerfile:1

FROM node:24-alpine AS react-build
WORKDIR /app
COPY react/package.json react/package-lock.json ./
RUN npm ci
COPY react/ ./
RUN npm run build

FROM node:24-alpine AS vue-build
WORKDIR /app
COPY vue/package.json vue/package-lock.json ./
RUN npm ci
COPY vue/ ./
RUN npm run build

FROM node:24-alpine AS typescript-build
WORKDIR /app
COPY typescript/package.json typescript/package-lock.json ./
RUN npm ci
COPY typescript/ ./
RUN npm run build

FROM node:24-alpine AS ecma-build
WORKDIR /app
COPY ecma/package.json ecma/package-lock.json ./
RUN npm ci
COPY ecma/ ./
RUN npm run build

FROM node:24-alpine AS html-css-build
WORKDIR /app
COPY html-css/package.json html-css/package-lock.json ./
RUN npm ci
COPY html-css/ ./
RUN npm run build

FROM node:24-alpine AS postgre-build
WORKDIR /app
COPY postgre/package.json postgre/package-lock.json ./
RUN npm ci
COPY postgre/ ./
RUN npm run build

FROM node:24-alpine AS backend-build
WORKDIR /app
COPY backend/package.json backend/package-lock.json ./
RUN npm ci
COPY backend/ ./
RUN npm run build

FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY backend/package.json backend/package-lock.json ./
RUN npm ci --omit=dev
COPY --from=backend-build /app/dist ./dist
COPY --from=backend-build /app/drizzle ./drizzle
COPY backend/public/landing ./public/landing
COPY --from=react-build /app/dist ./public/react
COPY --from=vue-build /app/dist ./public/vue
COPY --from=typescript-build /app/dist ./public/typescript
COPY --from=ecma-build /app/dist ./public/ecma
COPY --from=html-css-build /app/dist ./public/html-css
COPY --from=postgre-build /app/dist ./public/postgre

EXPOSE 4000
CMD ["node", "dist/index.js"]
