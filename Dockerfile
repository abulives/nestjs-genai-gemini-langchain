# Stage 1: Build the NestJS app
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source files
COPY . .

# Build the NestJS project
RUN npm run build

# Stage 2: Run the app
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install production dependencies
COPY package*.json ./
RUN npm install --only=production

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Set environment variables if needed
# ENV NODE_ENV=production

# Expose the port your app runs on
EXPOSE 3000

# Command to run the app
CMD ["node", "dist/main.js"]
