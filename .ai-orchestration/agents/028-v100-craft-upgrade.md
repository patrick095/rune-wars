# Agent 028 — v1.0.0 Craft + Upgrade

## Objetivo
Implementar `CraftModule` com receitas e lógica de chance baseada em Sorte, e `UpgradeModule` com tabela de pedras e chances de +1 a +10.

## Contexto mínimo necessário

### Craft:
```ts
interface CraftRecipe { id, resultItemBaseId, resultRarity, materials:[{itemBaseId,quantity}], baseCraftChance, luckScaling }
// chance final = Math.min(baseCraftChance + luck * luckScaling, 0.95)
```

### Upgrade (chances base):
+1=80%, +2=75%, +3=70%, +4=60%, +5=50%, +6=40%, +7=30%, +8=20%, +9=15%, +10=10%
- Sorte aumenta chance: +`luck * 0.001` por ponto (cap: +20%)
- Falha: item mantido, pedras usadas perdidas (não quebra item)

### Desmontagem:
Comum=50%, Raro=65%, Épico=80% de gerar pedra

## Arquivos autorizados a criar/alterar
```
system/backend/src/
  craft/
    craft.module.ts
    craft.service.ts
    craft.controller.ts
    entities/craft-recipe.entity.ts
    recipes/
      initial-recipes.ts (mínimo 10 receitas)
  upgrade/
    upgrade.module.ts
    upgrade.service.ts
    upgrade.controller.ts
    upgrade-table.ts
  migrations/ (migrations para craft_recipe)
```

## Arquivos apenas para consulta
```
system/backend/src/
  inventory/inventory.service.ts
  character/character.service.ts
```

## O que NÃO mexer
- AuthModule, BattleGateway, RankingModule

## Dependências obrigatórias
- Agentes 019+024 concluídos

## Critérios de aceite
- `POST /craft` consome materiais do inventário e cria item com chance baseada em Sorte
- `POST /upgrade/item/:id` aplica upgrade com chance da tabela
- Falha de upgrade não quebra item; pedras são consumidas
- Desmontagem retorna pedra com a probabilidade correta por raridade
- Anão tem +5% em todas as chances de craft/upgrade

## Memory

### Objetivo
CraftModule + UpgradeModule com receitas e chance por Sorte.

### Contexto permitido
Tabela de upgrade + fórmula de craft + spec de desmontagem.

### Arquivos autorizados
Os listados.

### Dependências
019+024 concluídos.

### Restrições
- Craft e upgrade são transações atômicas (consumir materiais + criar item em uma transação).
- Sem receitas infinitas: verificar materiais disponíveis antes de iniciar.

### Critérios de aceite
Ver seção acima.

## Formato do resumo final
Criar `.ai-orchestration/agents/resumo-028.md`.

## Limpeza pós-versão
Após v1.0.0 completa: deletar `v1.0.0.md` da raiz.
