FROM node:20-alpine
RUN apk add --no-cache openssl
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build
ENV PORT=3000
# Aplica las migraciones pendientes y luego arranca. Si una migración falla, el servidor no inicia.
# `exec` deja a node como proceso principal para que reciba el SIGTERM de ECS.
CMD ["sh", "-c", "npx prisma migrate deploy && exec node dist/index.js"]
