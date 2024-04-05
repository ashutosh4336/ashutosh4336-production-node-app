FROM node:20.11.1

WORKDIR /app/dct-app

COPY package*.json .

RUN npm install 
# --omit=dev

COPY . .

EXPOSE 80

CMD [ "npm", "run", "dev"]