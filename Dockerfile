# Step 1: Build the React application
# Use a smaller base image
FROM node:alpine as build
WORKDIR /app
COPY package.json /app
# Install only production dependencies
RUN npm install --only=production
COPY . /app
RUN npm run build

# Step 2: Serve the app using a web server
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]