#runtime
FROM node:20-alpine

#working directory
WORKDIR /usr/src/app

#dependencies
COPY package*.json ./

#production dependencies
RUN npm ci

#copy source code
COPY . . 

#expose backend API port
EXPOSE 5000

#start server
CMD ["node", "index.js"]