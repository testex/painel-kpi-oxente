# Painel KPI V3

Painel de indicadores (KPI) com frontend React + Vite e backend Node.js/Express + TypeScript.

## Estrutura do Projeto

- **backend/**: API Node.js/Express (TypeScript)
- **frontend/**: Aplicação React (Vite + TypeScript)

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
cd frontend
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

## Docker (em breve)

O projeto será preparado para rodar com Docker e docker-compose.

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