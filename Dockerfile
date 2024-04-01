FROM node:16.13

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npx prisma generate

EXPOSE 8080

CMD bash -c "npx prisma migrate dev && npm run dev"