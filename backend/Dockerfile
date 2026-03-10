FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Generate Prisma client
RUN npx prisma generate

# Create database tables
RUN npx prisma db push

# Build TypeScript
RUN npm run build

EXPOSE 10000

CMD ["npm", "start"]