# Agente 013 — Orquestrador Final

## Objetivo
Ler todos os resumos dos agentes 001-012, validar critérios de aceite, identificar pendências, e criar o resumo final permanente da implementação.

## Passos obrigatórios

### 1. Leitura dos resumos
Ler cada arquivo `*-DONE.md` em `.ai-orchestration/agents/` e verificar:
- Status: todos devem estar "Concluído"
- Bugs críticos: nenhum pendente
- Impacto em outros agentes: verificar se algum registrou impacto não tratado

### 2. Validação de critérios de aceite (spec v1.3.0.md seção 25)
- [ ] Após login sem personagem ativo → redireciona para `/character-select`
- [ ] Criar personagem com nome único e raça → sucesso
- [ ] Nome em uso → mensagem de erro inline
- [ ] 5+ personagens → opção criar desabilitada
- [ ] Selecionar personagem → hub com dados corretos (inventário, stats)
- [ ] Reabrir jogo → mesmo personagem ativo (sem nova seleção)
- [ ] Deletar personagem ativo → redireciona para `/character-select`
- [ ] Sprite correto da raça na batalha

### 3. Validação de critérios de aceite (spec P2.9)
- [ ] Arrastar mapa (mouse + touch) move câmera dentro dos bounds
- [ ] Botões de ângulo APENAS em mobile
- [ ] Clique único = ±1°; hold = inicia após 400ms, 1° a cada 80ms
- [ ] Throttle teclado: máx 1°/100ms
- [ ] Barra de força com régua 1/5/10
- [ ] Ghost do último tiro persiste
- [ ] Trocar arma com ângulo fora do limite → clampado automaticamente

### 4. Verificação final de compilação
```bash
cd system/backend && npx tsc --noEmit
cd system/frontend && npx tsc --noEmit
```

### 5. Criar resumo final permanente
Criar `docs/implementations/2026-06-08-v1.3.0-character-select-battle-ux.md`

### 6. Limpar pasta de orquestração
Após criar o resumo permanente:
- Verificar: resumo criado? arquivos registrados? sem bugs críticos? sem agentes bloqueados?
- Remover `.ai-orchestration/`

## Arquivos que pode alterar/criar
- `docs/implementations/2026-06-08-v1.3.0-character-select-battle-ux.md` (criar)
- Remoção de `.ai-orchestration/` (após validação completa)

## Dependências obrigatórias
- **Agente 012** concluído sem erros críticos

## Formato do resumo final permanente

```md
# Resumo Final — v1.3.0: Character Select + Battle UX

## Objetivo
...

## O que foi implementado
...

## Arquivos alterados
...

## Decisões tomadas
...

## Bugs encontrados
...

## Bugs resolvidos
...

## Bugs pendentes
...

## Testes executados
...

## Critérios de aceite
...

## Observações para manutenção
...
```

## Memory

### Objetivo
Validar critérios de aceite, criar resumo permanente, limpar orquestração.

### Contexto permitido
- Todos os arquivos `.ai-orchestration/agents/*-DONE.md`
- `.ai-orchestration/BUGS_AND_BLOCKERS.md`
- `.ai-orchestration/FILES_CHANGED.md`
- `.ai-orchestration/DECISIONS_LOG.md`

### Arquivos autorizados
- `docs/implementations/2026-06-08-v1.3.0-character-select-battle-ux.md` (criar)
- `.ai-orchestration/` (remover após validação)

### Dependências
- Agente 012 concluído

### Restrições
- NUNCA remover `.ai-orchestration/` antes de criar o resumo permanente
- Verificar checklist de segurança antes de remover

### Critérios de aceite
- Resumo permanente criado em `docs/implementations/`
- Todos os critérios de aceite validados
- `.ai-orchestration/` removida
