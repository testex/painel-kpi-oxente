# Dockerfile para Backend Node.js/Express
FROM node:18-alpine

# Define o diretório de trabalho
WORKDIR /app

# Copia os arquivos de dependências
COPY package*.json ./

# Instala as dependências
RUN npm ci --only=production

# Copia o código fonte
COPY . .

# Compila o TypeScript
RUN npm run build

# Expõe a porta
EXPOSE 3001

# Comando para iniciar a aplicação
CMD ["npm", "start"] 