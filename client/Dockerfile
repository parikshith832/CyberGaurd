FROM node:20-slim
WORKDIR /app
COPY package*.json ./
RUN npm ci --production=false || npm install --production=false
COPY . .
ENV port=9000
EXPOSE 9000
CMD ["npm","start"]
