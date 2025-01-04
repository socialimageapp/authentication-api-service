# Use an official Node.js runtime as the base image
FROM node:22

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and pnpm-lock.yaml to the working directory
COPY package.json pnpm-lock.yaml ./

# Install pnpm globally
RUN corepack enable && corepack prepare pnpm@9.12.0 --activate

# Install dependencies
RUN pnpm install

# Copy the entire project (excluding files in .dockerignore)
COPY . .

# Clone and update submodules
RUN git submodule update --init --recursive

# Run the build script (includes building submodules and TypeScript)
RUN pnpm run build

# Expose the application's port
EXPOSE 7071

# Command to start the application
CMD ["pnpm", "start"]
