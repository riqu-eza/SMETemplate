# ----------------------------
# Stage 1: Build the client
# ----------------------------
    FROM node:18 as build

    WORKDIR /app
    COPY package*.json ./
    RUN npm install --network-timeout=600000
    COPY . .
    RUN npm run build
    # This produces a 'dist' folder (for Vite-based projects).
    
    # ----------------------------
    # Stage 2: Serve with Nginx
    # ----------------------------
    FROM nginx:alpine
    
    # Remove the default Nginx config
    RUN rm /etc/nginx/conf.d/default.conf
    
    # Copy your custom Nginx configuration file into the container
    COPY nginx.conf /etc/nginx/conf.d/default.conf
    
    # Copy the built files from the previous stage
    COPY --from=build /app/dist /usr/share/nginx/html
    
    # Expose port 80 (default Nginx port)
    EXPOSE 80
    
    # Start Nginx in the foreground
    CMD ["nginx", "-g", "daemon off;"]
    