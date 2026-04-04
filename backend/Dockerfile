FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npx prisma generate
RUN npm run build

EXPOSE 10000

CMD sh -c "npx prisma db push && npm run seed && npm start"