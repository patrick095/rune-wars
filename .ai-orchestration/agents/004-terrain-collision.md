# Agent-004 — Terrain Collision (Fix A4: Movimentação em Desnível)

## Status
Pendente

## Objetivo
Corrigir movimentação em desnível. Aumentar `MAX_STEP_HEIGHT` de 12 para 24px (3 células) e adicionar `MAX_DROP_HEIGHT = 40` para descida suave. Quando a diferença de altura for maior que `MAX_DROP_HEIGHT`, deixar `CharacterFall` assumir.

## Memory

### Objetivo
Fix A4: aumentar step height e adicionar lógica de descida suave em terrain-collision.ts.

### Contexto permitido
- `terrain-collision.ts`: arquivo principal a modificar
- `character-fall.ts`: consultar apenas para entender a interface de queda

### Arquivos autorizados a alterar
- `src/app/shared/game-core/terrain-collision.ts`

### Arquivos apenas consulta
- `src/app/shared/game-core/character-fall.ts`

### O que NÃO alterar
- Qualquer outro arquivo

### Dependências
- Nenhuma (paralelo com Agent-001, 002, 003)

### Critérios de aceite
- `MAX_STEP_HEIGHT = 24` (era 12)
- `MAX_STEP_DOWN = 40` (novo — queda acima disso é delegada ao CharacterFall)
- Quando `heightDiff > MAX_STEP_DOWN`: retornar `{ canMove: true, newX: targetX, newY: currentY }` — CharacterFall vai cuidar da descida
- Player consegue subir/descer até 3 células (24px) sem travar
- Tentativa de subir parede > 3 células bloqueia corretamente
- TypeScript sem erros

### Instrução de execução
```
Implemente o Fix A4 do spec v1.4.0.
Em terrain-collision.ts, alterar MAX_STEP_HEIGHT de 12 para 24.
Adicionar constante MAX_STEP_DOWN = 40.
Na lógica de movimentação, quando heightDiff > MAX_STEP_DOWN, retornar { canMove: true, newX: targetX, newY: currentY } para que CharacterFall assuma a descida.
Verificar se a constante MAX_STEP_HEIGHT já existe como constante exportada ou inline — não quebrar outros lugares que a usam.
Atualizar .ai-orchestration/ após alterar o arquivo.
```

## Riscos ou pendências
- Verificar se `MAX_STEP_HEIGHT` é exportado e usado em outros lugares
- A lógica de heightDiff pode precisar de revisão da direção (positivo = subindo ou descendo?)
