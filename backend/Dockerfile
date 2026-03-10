FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Generate Prisma client first
RUN npx prisma generate

# Then build TypeScript
RUN npm run build

EXPOSE 10000

CMD ["npm", "start"]