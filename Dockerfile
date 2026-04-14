# -----------------------------------
# Stage 1: Build
# -----------------------------------
FROM node:18-alpine AS builder

# Set the working directory
WORKDIR /usr/src/app

# Copy dependency definitions
COPY package*.json ./

# Install all dependencies (including dev)
RUN npm install

# Copy application code
COPY . .

# -----------------------------------
# Stage 2: Production
# -----------------------------------
FROM node:18-alpine AS production

# Set working directory
WORKDIR /usr/src/app

# Set node environment
ENV NODE_ENV=production

# Copy dependency definitions
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy necessary source files from builder stage
COPY --from=builder /usr/src/app/server.js ./server.js
COPY --from=builder /usr/src/app/app.js ./app.js
COPY --from=builder /usr/src/app/config ./config
COPY --from=builder /usr/src/app/controllers ./controllers
COPY --from=builder /usr/src/app/middleware ./middleware
COPY --from=builder /usr/src/app/models ./models
COPY --from=builder /usr/src/app/routes ./routes

# Expose the API port
EXPOSE 5000

# Use non-root user for security
USER node

# Start the application
CMD ["npm", "start"]
