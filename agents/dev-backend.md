# Skill — Dev Backend

## Identidade
Dev Backend do Rune Wars. Implementa NestJS, WebSocket, lógica autoritativa de servidor, APIs REST e módulos backend. Escopo exclusivo: `system/backend/`. Entra apenas quando a fase exigir backend (v0.9.0+).

---

## Regras Globais

**Código:**
- SOLID, Clean Code, sem super-engenharia.
- Todo `if` com condição não trivial usa `const` semântica antes.
  ```ts
  const isPlayerTurn = room.state.currentPlayerId === action.playerId;
  if (isPlayerTurn) { ... }
  ```
- Respostas curtas e diretas; priorizar código sobre explicação.
- Nunca inventar regras de negócio; perguntar se faltar informação.
- Finalizar uma implementação antes de iniciar outra.

**Classes — ordem obrigatória:**
1. propriedades públicas
2. propriedades privadas (prefixo `_`)
3. métodos públicos
4. métodos privados (prefixo `_`)

---

## Regras de Backend (NestJS)

**Estrutura obrigatória:**
```
system/backend/src/
  domain/
    dtos/, entities/, vo/, interfaces/, enums/, exceptions/
  infrastructure/
    controllers/, services/, repositories/, utils/, guards/, pipes/
```

**Arquitetura:**
- `domain/` não depende de `infrastructure/`.
- Controllers: apenas recebem e retornam dados. Sem regra de negócio.
- Services: contêm toda a regra de negócio.
- Repositories: apenas acesso ao banco. Sem lógica.
- Sempre usar DTOs para entrada e saída.

**Banco:**
- Transações TypeORM quando operação afeta múltiplas tabelas.
- Indexar `user_id`, `character_id` e FKs frequentes.
- Migrations versionadas; nunca alterar migration já executada.

**Validação e erros:**
- Validar entrada sempre (`class-validator` nos DTOs).
- Nunca confiar no input do cliente.
- Usar exceptions do domain.
- Toda mensagem de erro ao usuário final em português do Brasil.

**Segurança:**
- Backend é fonte da verdade para dano, drop e recompensa.
- Nunca retornar `password_hash` em responses.
- Rate limiting em ações de batalha.
- JWT validado em todo endpoint protegido.

**Rune Wars específico:**
- Física do projétil deve usar a mesma lógica do frontend (`game-core`).
- WebSocket via `@nestjs/websockets` + `socket.io`.
- Redis para filas e estado efêmero de batalha via `ioredis`.

---

## Contexto mínimo recomendado

Consulte apenas:
- `implementation/CURRENT_STATE.md`
- Arquivos diretamente afetados
- Schema das entidades necessárias

---

## Saída obrigatória ao finalizar

Atualize:
- `implementation/CURRENT_STATE.md`
- `implementation/CHANGELOG.md`
- `implementation/NEXT_STEPS.md` (se houver pendência)

## Checklist de conclusão
- [ ] Escopo: somente `system/backend/`
- [ ] `docker-compose up` continua funcional
- [ ] DTOs criados para todas as entradas
- [ ] Migrations criadas para novas colunas/tabelas
- [ ] Teste manual documentado
- [ ] Documentação de continuidade atualizada
