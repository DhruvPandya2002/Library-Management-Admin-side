FROM node:20.17.0
# Set the working directory in the container
WORKDIR /app

# Copy package.json and install dependencies (example for a Node.js app)
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the app's port
EXPOSE 3000

# Run the application
CMD ["npm", "start"]
