# Resumo Agente 001
**Status:** Concluído
**Arquivos criados:**
- `devops/frontend/Dockerfile`
- `devops/docker-compose.yml`
- `devops/.env.example`

**Decisões:**
- O `Dockerfile` usa três stages: `builder` (node:20-alpine, compila o Angular), `dev` (node:20-alpine, executa `ng serve` para hot reload) e `runner` (nginx:alpine, serve o build estático).
- O `docker-compose.yml` expõe dois serviços: `frontend` (produção, porta 4200:80, target `runner`) e `frontend-dev` (desenvolvimento, porta 4200:4200, target `dev`, com volume bind mount em `../system/frontend:/app` e anonymous volume para `node_modules` para evitar conflito com o host).
- A variável `ANGULAR_ENV` é injetada via `.env` com fallback padrão (`production` em `frontend`, `development` em `frontend-dev`).
- `--poll 2000` no `ng serve` garante hot reload funcional dentro do container mesmo em sistemas de arquivos que não propagam inotify.
- Nenhum código Angular foi criado ou alterado; apenas infraestrutura Docker em `devops/`.
