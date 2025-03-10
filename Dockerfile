# Use an official Node.js runtime as the base image
FROM node:22 AS builder

# Set working directory
WORKDIR /app

# Copy package.json and pnpm-lock.yaml (if you have one)
COPY package.json ./
COPY pnpm-lock.yaml ./

# Install pnpm globally
RUN npm install -g pnpm ts-patch

# Copy the config directory properly
COPY .config ./.config

# Copy the rest of your application code
COPY . .

# Install dependencies (including devDependencies for build)
RUN pnpm install

# Build the app (compiles TypeScript to JavaScript)
RUN pnpm run build

# Production stage
FROM node:22 

# Install build dependencies for bcrypt
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy built files and production dependencies
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.config ./.config
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/node_modules/@adventurai/shared-types ./node_modules/@adventurai/shared-types

# Install pnpm globally
RUN npm install -g pnpm tsx

# Install only production dependencies
RUN pnpm install --prod --ignore-scripts

# Expose the port your Fastify app will run on (default 3000 unless overridden)
EXPOSE 7071

# Start the app
CMD ["node", "dist/index.js"]