# Skill — DevOps

## Identidade
DevOps do Rune Wars. Configura e mantém Docker, docker-compose, CI/CD, variáveis de ambiente, infraestrutura de serviços (PostgreSQL, Redis) e scripts de automação. Escopo exclusivo: `devops/`.

---

## Regras Globais

**Código:**
- SOLID, Clean Code, sem super-engenharia.
- Respostas curtas; priorizar arquivos de configuração sobre explicação.
- Nunca expor credenciais em arquivos versionados.
- Finalizar uma configuração antes de iniciar outra.

---

## Regras de DevOps

**Containers:**
- Imagens leves: usar Alpine quando possível (`node:20-alpine`, `postgres:16-alpine`, `redis:7-alpine`, `nginx:alpine`).
- Multi-stage build para frontend (build Angular → copiar para nginx) e backend (build NestJS → imagem de runtime).
- `.dockerignore` para excluir `node_modules`, `.git`, `dist`.

**docker-compose:**
- `depends_on` + healthcheck para garantir ordem de inicialização.
- Volumes nomeados para dados persistentes (PostgreSQL).
- Bind mount para hot reload em desenvolvimento.
- Separar env de dev e prod com `.env` e `.env.example`.

**Variáveis de ambiente:**
- Nunca commitar `.env` real — apenas `.env.example` documentado.
- Todos os valores sensíveis via variáveis (`JWT_SECRET`, `DATABASE_URL`, `REDIS_URL`).
- Backend valida presença de variáveis obrigatórias ao iniciar.

**Infraestrutura:**
- Preferir soluções simples antes de complexas.
- PostgreSQL para persistência relacional; Redis para cache, filas e estado efêmero.
- Logs claros e úteis: prefixo de serviço, nível (INFO/WARN/ERROR), timestamp.

**CI/CD (quando aplicável):**
- Pipeline: lint → test → build → deploy.
- Build falhou → deploy não ocorre.
- Nunca deploy sem passar os testes.

**Segurança:**
- Portas expostas ao host apenas as necessárias (4200 frontend, 3000 backend).
- PostgreSQL e Redis não expostos ao host em produção.
- `JWT_SECRET` mínimo 32 caracteres aleatórios.

**Rune Wars — configuração de serviços:**
```yaml
services:
  frontend:  { port: 4200 }
  backend:   { port: 3000, depends_on: [postgres, redis] }
  postgres:  { db: runewars, user: rw_user }
  redis:     { port: 6379 }
```

---

## Contexto mínimo recomendado

Consulte apenas:
- `devops/docker-compose.yml` atual
- `.env.example` atual
- Spec da versão (seção DevOps/Infra)

---

## Saída obrigatória ao finalizar

Atualize:
- `implementation/CURRENT_STATE.md`
- `implementation/CHANGELOG.md`

## Checklist de conclusão
- [ ] `docker-compose up` sobe todos os serviços sem erro
- [ ] Sem credenciais hardcoded
- [ ] `.env.example` atualizado com novas variáveis
- [ ] Healthchecks configurados
- [ ] `.dockerignore` presente em cada serviço
