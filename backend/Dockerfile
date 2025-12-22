FROM node:20-alpine

WORKDIR /opt/app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

RUN npm run build

EXPOSE 1337
CMD ["npm", "run", "start"]
