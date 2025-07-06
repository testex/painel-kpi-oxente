# INSTRUÇÕES PARA USO DO DOCKER/DOCKER COMPOSE NO PROJETO PAINEL KPI

## Comandos principais

# Subir toda a stack (backend, frontend, ngrok backend e frontend)
docker compose up

# Parar todos os containers
docker compose down

# Ver logs de um serviço específico (exemplo: frontend ngrok)
docker compose logs -f painel-ngrok-frontend

# Fazer rebuild das imagens (quando alterar o código fonte)
docker compose up --build

## Endereços para acessar os serviços

- Frontend local:   http://localhost:8080
- Backend local:    http://localhost:3001/api/health
- Frontend público (externo):  (ver log do container painel-ngrok-frontend)
- Backend público (externo):   (ver log do container painel-ngrok)

## Observações importantes

- **NÃO use comandos docker run manualmente** para backend, frontend ou ngrok.
- Deixe o docker compose gerenciar todos os serviços, portas e redes automaticamente.
- Se mudar o código fonte, use `docker compose up --build` para rebuildar.
- Se der erro de porta ocupada, pare tudo com `docker compose down` antes de subir novamente.

## Dica
Salve este arquivo na raiz do seu projeto para sempre ter o guia de uso à mão.
