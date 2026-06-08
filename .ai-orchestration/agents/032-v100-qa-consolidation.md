# Agent 032 — v1.0.0 QA + Consolidação Final

## Objetivo
Validar todos os critérios de aceite da v1.0.0, verificar integração entre sistemas, executar/documentar cenários críticos de QA, e criar o resumo final permanente.

## Contexto mínimo necessário
Ler todos os resumos dos agentes 023–031 antes de executar.

### Cenários críticos a validar:
| Cenário | Resultado esperado |
|---------|-------------------|
| Criar conta, escolher raça, distribuir atributos | Personagem criado no banco |
| Vencer partida ranqueada | ELO atualizado, ranking atualizado |
| Completar Andar 5 Trilha Heróis | Drop épico/lendário gerado |
| Craft com Sorte alta vs. Sorte 0 | Sucesso mais frequente com Sorte alta |
| Upgrade +10 falho | Item mantido, pedras perdidas |
| Vender item vinculado após equipar | Sistema bloqueia |
| XP de guilda em dungeon | XP de guilda incrementado |
| Auditoria de mercado | Log de transações disponível |
| Anti-pay-to-win | Nenhum item de poder vendável por dinheiro real |

## Arquivos autorizados a criar/alterar
```
docs/implementations/
  2026-06-07-rune-wars-v010-v100.md
implementation/
  CURRENT_STATE.md
  CHANGELOG.md
  NEXT_STEPS.md
```

## Arquivos apenas para consulta
Todos os resumos `.ai-orchestration/agents/resumo-*.md`

## O que NÃO mexer
- Qualquer código de `system/` ou `devops/` (apenas documentação)

## Dependências obrigatórias
- Agente 031 concluído

## Ao finalizar:
1. Criar `docs/implementations/2026-06-07-rune-wars-v010-v100.md` com resumo completo
2. Atualizar `implementation/CURRENT_STATE.md` para v1.0.0
3. Atualizar `implementation/CHANGELOG.md` com todas as versões
4. Deletar `v1.0.0.md` da raiz
5. Deletar a pasta `.ai-orchestration/` inteira

## Validação de segurança antes da limpeza:
- [ ] Resumo final permanente criado em `docs/implementations/`?
- [ ] Todos os vX.Y.Z.md deletados da raiz?
- [ ] Zero bugs críticos pendentes?
- [ ] Todos os 32 agentes com status Concluído?

## Critérios de aceite
- Todos os cenários críticos validados e documentados
- `implementation/CURRENT_STATE.md` reflete v1.0.0
- Resumo final em `docs/implementations/` criado
- `.ai-orchestration/` deletado

## Memory

### Objetivo
QA final, consolidação e limpeza de orquestração.

### Contexto permitido
Resumos de todos os agentes anteriores.

### Arquivos autorizados
Os listados em "Arquivos autorizados".

### Dependências
031 concluído.

### Restrições
- Não alterar código de sistema.
- Não deletar `.ai-orchestration/` antes de criar resumo permanente.
- Deletar `v1.0.0.md` apenas após validação completa.

### Critérios de aceite
Ver seção acima.

## Formato do resumo final
Este agente cria o resumo final permanente em `docs/implementations/`.
