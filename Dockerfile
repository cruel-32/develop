# syntax=docker/dockerfile:1

FROM node:24-alpine AS react-build
WORKDIR /app
COPY frontend-react/package.json frontend-react/package-lock.json ./
RUN npm ci
COPY frontend-react/ ./
RUN npm run build

FROM node:24-alpine AS vue-build
WORKDIR /app
COPY frontend-vue/package.json frontend-vue/package-lock.json ./
RUN npm ci
COPY frontend-vue/ ./
RUN npm run build

FROM node:24-alpine AS typescript-build
WORKDIR /app
COPY frontend-typescript/package.json frontend-typescript/package-lock.json ./
RUN npm ci
COPY frontend-typescript/ ./
RUN npm run build

FROM node:24-alpine AS ecma-build
WORKDIR /app
COPY frontend-ecma/package.json frontend-ecma/package-lock.json ./
RUN npm ci
COPY frontend-ecma/ ./
RUN npm run build

FROM node:24-alpine AS html-css-build
WORKDIR /app
COPY frontend-html-css/package.json frontend-html-css/package-lock.json ./
RUN npm ci
COPY frontend-html-css/ ./
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

EXPOSE 4000
CMD ["node", "dist/index.js"]
