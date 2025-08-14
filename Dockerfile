# Build stage
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Set environment variables for build
ARG REACT_APP_STRAVA_CLIENT_ID
ARG REACT_APP_STRAVA_CLIENT_SECRET
ARG REACT_APP_STRAVA_REDIRECT_URI

ENV REACT_APP_STRAVA_CLIENT_ID=$REACT_APP_STRAVA_CLIENT_ID
ENV REACT_APP_STRAVA_CLIENT_SECRET=$REACT_APP_STRAVA_CLIENT_SECRET
ENV REACT_APP_STRAVA_REDIRECT_URI=$REACT_APP_STRAVA_REDIRECT_URI

# Build the app
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built app to nginx
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

