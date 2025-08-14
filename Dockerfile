FROM oven/bun:latest

WORKDIR /app

# Copiar arquivos de dependências primeiro (para melhor cache)
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Copiar código fonte
COPY . .

# Build da aplicação
RUN bun run build

EXPOSE 3333

CMD ["bun", "run", "start"]