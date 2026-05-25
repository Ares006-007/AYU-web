FROM node:20-alpine

WORKDIR /app

# Install dependencies first (layer cache)
COPY package*.json ./
RUN npm ci --omit=dev

COPY src ./src

# Create logs directory
RUN mkdir -p logs

EXPOSE 3001

CMD ["node", "src/server.js"]
