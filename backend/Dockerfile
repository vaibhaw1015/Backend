# Multi-stage Dockerfile for Node.js + TypeScript + Prisma Backend API

# ----------------------------
# Stage 1: Build & Prune
# ----------------------------
FROM node:18-alpine AS builder

WORKDIR /app

# Copy dependency definitions
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies (including devDependencies for tsc)
RUN npm ci

# Generate Prisma Client
RUN npx prisma generate

# Copy source code and configuration
COPY tsconfig.json ./
COPY src ./src/

# Compile TypeScript
RUN npm run build

# Prune devDependencies to keep container lean
RUN npm prune --production

# ----------------------------
# Stage 2: Runner Image
# ----------------------------
FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5002

# Copy production artifacts from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 5002

CMD ["node", "dist/index.js"]
