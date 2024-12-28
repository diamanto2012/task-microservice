FROM node:18-alpine

# Устанавливаем зависимости для сборки
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Копируем файлы package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci

# Копируем исходный код
COPY . .

# Устанавливаем глобально TypeScript
RUN npm install -g typescript

# Устанавливаем типы для Express
RUN npm install --save-dev @types/express@latest

# Собираем приложение
RUN npm run build

EXPOSE 3000

# Запускаем приложение
CMD ["npm", "start"]