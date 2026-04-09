# We need an OS with package manager (bullseye) to install Docker CLI easily
FROM node:20-bullseye

# Install Docker CLI so the node app can spawn Docker containers for user code execution
RUN apt-get update && \
    apt-get install -y docker.io && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install dependencies first for layer caching
COPY package*.json ./
RUN npm install

# Copy rest of the code
COPY . .

# Build the TypeScript backend
RUN npm run build

# Expose backend port
EXPOSE 3001

# Start the application
CMD ["npm", "start"]
