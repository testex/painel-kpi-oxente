# Painel KPI V3

Painel de indicadores (KPI) com frontend React + Vite e backend Node.js/Express + TypeScript.

## Estrutura do Projeto

- **backend/**: API Node.js/Express (TypeScript)
- **Frontend/**: Aplicação React (Vite + TypeScript)

---

## Como rodar localmente

### 1. Backend

```bash
cd backend
npm install
npm run dev
```

A API estará disponível em http://localhost:3001

### 2. Frontend

```bash
cd Frontend
npm install
npm run dev
```

O app estará disponível em http://localhost:5173

---

## Variáveis de ambiente

Crie um arquivo `.env` no backend com:

```
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:5173
```

---

## Docker

O projeto está preparado para rodar com Docker e docker-compose.

### Produção
```bash
# Build e start dos containers
docker-compose up --build

# Rodar em background
docker-compose up -d --build

# Parar containers
docker-compose down
```

### Desenvolvimento
```bash
# Build e start dos containers de desenvolvimento
docker-compose -f docker-compose.dev.yml up --build

# Rodar em background
docker-compose -f docker-compose.dev.yml up -d --build

# Parar containers
docker-compose -f docker-compose.dev.yml down
```

### URLs
- **Produção**: http://localhost (frontend) e http://localhost:3001 (backend)
- **Desenvolvimento**: http://localhost:5173 (frontend) e http://localhost:3001 (backend)

---

## Boas práticas

- Siga as diretrizes do guia de desenvolvimento incluído no repositório.
- Use sempre `data-testid` em elementos interativos.
- Adicione logs de debug em handlers principais.
- Comente handlers e lógicas importantes.

---

## Contribuição

1. Faça fork do projeto
2. Crie uma branch para sua feature/correção
3. Abra um Pull Request

---

## Licença

MIT 