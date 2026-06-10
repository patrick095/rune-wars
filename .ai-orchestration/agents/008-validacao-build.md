# Sub-spec — Agente 008: Validação e Build

## Objetivo exato
Garantir que toda a implementação compila sem erros TypeScript (`ng build`), verificar regressões, e validar que os critérios de aceite fundamentais foram atendidos antes da limpeza final.

## Contexto mínimo necessário

### Diretório do build
`system/frontend/` — é aqui que roda `ng build` ou `npx ng build`

### Critérios de aceite a validar
- CA-01: Todos os 5 mapas PVP têm JSON sem campo `grid`
- CA-05: Cada mapa JSON tem exatamente 12 spawn points
- CA-06: `ng build` passa sem erros TypeScript

### Verificações de regressão pós-build
1. `terrain-textures.ts` não existe mais
2. `map-castle.json` não existe mais; `map-mystic-castle.json` existe
3. `TerrainEngine` não tem referências a `GRID_COLS`, `GRID_ROWS` ou `grid[][]`
4. `TerrainRenderer` tem método `applyExplosion()` e não tem `updateCells()`
5. `SpawnPoint` em spawn-selector.ts tem `{x, y}` e não `{col, row}`
6. `battle.scene.ts` não importa `terrain-textures`
7. `battle.scene.ts` não tem string `'castle'` como MapName (deve ser `mystic_castle`)

### Se ng build falhar
1. Ler o erro completo
2. Identificar arquivo e linha
3. Classificar o bug:
   - CRÍTICO: impede build completamente → corrigir imediatamente
   - IMPORTANTE: warning ou erro de tipo isolado → corrigir
4. Aplicar correção mínima no arquivo afetado
5. Re-rodar ng build até passar
6. Registrar todos os bugs encontrados e corrigidos no resumo

## Arquivos que pode alterar
- Qualquer arquivo TypeScript que tenha erro de compilação pós-implementação

## Arquivos que deve consultar
- Todos os resumos em `.ai-orchestration/agents/` — para entender o que foi feito
- Arquivos com erros de compilação — para corrigir

## O que NÃO deve mexer
- Lógica de negócio que já está correta
- Arquivos sem erros de compilação
- Qualquer funcionalidade de dungeon/academy que não foi tocada

## Dependências obrigatórias
- Todos os agentes anteriores (001 a 007) devem ter concluído

## Critérios de aceite
- [ ] `ng build` passa sem erros
- [ ] `terrain-textures.ts` não existe
- [ ] `map-castle.json` não existe
- [ ] `map-mystic-castle.json` existe com 12 spawn points
- [ ] Nenhum arquivo TypeScript importa `terrain-textures`
- [ ] Nenhuma referência a `GRID_COLS`/`GRID_ROWS` no codebase

## Instrução exata para execução
```
Você é o Agente 008. Leia .ai-orchestration/agents/008-validacao-build.md para seu escopo completo.

Pré-requisitos: confirme que todos os agentes 001 a 007 concluíram (verificar -resumo.md de cada um).

Sua tarefa:
1. Rodar: cd system/frontend && ng build 2>&1 (ou npx ng build)
2. Se houver erros, corrigi-los até ng build passar
3. Rodar as verificações de regressão listadas no sub-spec
4. Criar .ai-orchestration/agents/008-validacao-build-resumo.md com status, bugs encontrados e resolvidos

Ao final, atualizar .ai-orchestration/ORCHESTRATION_STATE.md com status "Em validação" ou "Finalizado".
```

---

## Memory — Agente 008: Validação e Build

### Objetivo
Rodar ng build, corrigir erros TypeScript, verificar regressões e validar critérios de aceite.

### Contexto permitido
- system/frontend/ — para rodar ng build
- Todos os arquivos TypeScript e JSON modificados — para corrigir erros
- Todos os resumos de agentes anteriores

### Arquivos autorizados
- Qualquer arquivo com erro de compilação

### Dependências
- Todos os agentes 001–007 devem ter concluído

### Restrições
- NÃO alterar lógica de negócio
- NÃO tocar dungeon/academy
- Apenas corrigir erros de compilação

### Critérios de aceite
- ng build passa sem erros
- Todos os critérios de regressão verificados
