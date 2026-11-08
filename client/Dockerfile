#build
FROM node:20-alpine AS build

#working directory
WORKDIR /app

#install dependencies
COPY package*.json ./
RUN npm ci

#copy source code
COPY . .
RUN npm run build
 
FROM nginx:alpine

#copy config
COPY nginx.conf /etc/nginx/conf.d/default.conf

#copy artifacts
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]