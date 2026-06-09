# Agent-009 — Combat HUD (Fix A5: HUD Último Turno)

## Status
Pendente

## Objetivo
Adicionar exibição do vento e força do último turno do jogador atual no HUD. Novo campo `lastShotText` em `CombatHud`, novo parâmetro `lastShotInfo` no método `update()`. Em `battle.scene.ts`, salvar estado do último tiro e passar para `refreshHud()`.

## Memory

### Objetivo
Fix A5: exibir info do último tiro (força + vento) no HUD, a partir do 2º turno de cada jogador.

### Contexto permitido
- `src/app/shared/game-core/combat-hud.ts`: adicionar lastShotText e novo parâmetro
- `src/app/shared/game-core/battle.scene.ts`: salvar lastPlayerShot e lastAiShot, passar para refreshHud

### Arquivos autorizados a alterar
- `src/app/shared/game-core/combat-hud.ts`
- `src/app/shared/game-core/battle.scene.ts`

### O que NÃO alterar
- Outros elementos do HUD (HP, turno, vento atual)
- Sistema de turno

### Dependências
- Após Fase 1 (Agents 001-004) para evitar conflitos em battle.scene.ts

### Critérios de aceite
- `CombatHud.update()` recebe `lastShotInfo?: { playerLabel: string; force: number; windStr: string }`
- Novo `lastShotText` aparece abaixo do windText com cor cinza-claro e tamanho menor
- Texto: `Último (Jogador): Força X  Vento →Y`
- Só aparece a partir do 2º turno de cada jogador (quando `lastShotInfo` não é null)
- `battle.scene.ts` salva `lastPlayerShot` e `lastAiShot` ao atirar
- TypeScript sem erros

### Instrução de execução
```
Implemente o Fix A5 do spec v1.4.0 (HUD Último Turno).
Em combat-hud.ts, adicionar propriedade lastShotText: Phaser.GameObjects.Text criada no constructor abaixo do windText.
Adicionar lastShotInfo? ao parâmetro de update(). Quando presente, mostrar o texto; quando null/undefined, esconder.
Em battle.scene.ts, adicionar propriedades lastPlayerShot e lastAiShot. Ao final do tiro (quando projétil aterrissa), salvar força e estado de vento. Passar a info correta no refreshHud() baseado em cujo turno é o próximo.
Atualizar .ai-orchestration/ após cada arquivo alterado.
```

## Riscos ou pendências
- Verificar posição Y do lastShotText para não sobrepor outros elementos do HUD
- A WindState pode ter estrutura diferente do esperado — verificar o tipo
