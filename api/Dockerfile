# Use an official Node image as the base
FROM node:16

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json from the root folder
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the API code from the api folder
COPY api/ .

# Expose the port your API listens on
EXPOSE 3011

# Start the API (assuming index.js is your entry point)
CMD ["node", "index.js"]
