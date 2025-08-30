FROM node:20-alpine

WORKDIR /app

# Copy package.json and package-lock.json first for caching
COPY package*.json ./

RUN npm install

# Copy the rest of the source code
COPY . .

# Expose port
EXPOSE 5000

# Use npm run dev if in development
CMD ["npm", "start"]
