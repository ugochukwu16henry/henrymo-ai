FROM node:18-alpine

WORKDIR /app

# Install pnpm then project deps
COPY package.json pnpm-lock.yaml ./
RUN npm i -g pnpm && pnpm install --frozen-lockfile

COPY . .

EXPOSE 4000

CMD ["node", "src/server.js"]
