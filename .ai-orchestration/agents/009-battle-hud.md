# Sub-spec — Agent 009: BattleHud (HUD Unificado)

## Objetivo
Criar `game/hud/battle-hud.ts` — HUD completo unificado que compõe todos os componentes de HUD em um único ponto de entrada. Substitui `combat-hud.ts` e `power-meter-hud.ts` como HUD principal.

## Contexto Mínimo Necessário
- Stack: Phaser 3
- Zonas do HUD:
  ```
  ┌──────────────────────────────────────────────┐
  │ [PLAYER BAR]    [TIMER+WIND]    [ENEMY BAR]  │  ← Topo
  ├──────────────────────────────────────────────┤
  │              [CANVAS DO JOGO]                │
  ├──────────────────────────────────────────────┤
  │ [CONSUMÍVEIS]  [ÂNGULO+FORÇA+ATIRAR]  [MOD]  │  ← Base
  └──────────────────────────────────────────────┘
  ```
- Compõe: TurnTimer, WindDisplay, PlayerStatusBar (×2), ConsumableDock, ModifierDock, PowerBar
- Responsivo: reposiciona tudo no evento `scene.scale.on('resize', ...)`
- API simplificada: `update(gameState)` repassa dados para cada componente

## Arquivos Autorizados (pode criar/alterar)
- `system/frontend/src/game/hud/battle-hud.ts` (CRIAR)

## Arquivos que Deve Apenas Consultar
- `system/frontend/src/game/hud/turn-timer.ts` (importar classe)
- `system/frontend/src/game/hud/wind-display.ts` (importar classe)
- `system/frontend/src/game/hud/player-status-bar.ts` (importar classe)
- `system/frontend/src/game/hud/consumable-dock.ts` (importar classe)
- `system/frontend/src/game/hud/modifier-dock.ts` (importar classe)
- `system/frontend/src/game/hud/power-bar.ts` (importar classe)
- `system/frontend/src/game/hud/combat-hud.ts` (somente leitura — ver interface de dados)

## O que Não Deve Mexer
- `combat-hud.ts` (não alterar, não deletar — será substituído na integração pelo Agent 011)
- `power-meter-hud.ts` (não alterar, não deletar)
- Qualquer outro arquivo existente

## Dependências Obrigatórias
- Agents 002 (TurnTimer), 003 (WindDisplay), 004 (ConsumableDock), 005 (ModifierDock), 006 (PlayerStatusBar), 007 (PowerBar) devem estar concluídos

## Critérios de Aceite
- [ ] Classe `BattleHud` exportada
- [ ] `create(scene: Phaser.Scene): void` — cria todos os componentes
- [ ] `update(state: BattleHudState): void` — repassa dados para cada componente
- [ ] `destroy(): void` — destroi todos os componentes
- [ ] Interface `BattleHudState` exportada com todos os campos necessários
- [ ] Evento `scene.scale.on('resize')` reposiciona todos os componentes
- [ ] TypeScript sem erros

## Interface BattleHudState (mínima)
```typescript
interface BattleHudState {
  player: { hp: number; maxHp: number; stamina: number; maxStamina: number; name: string };
  enemy: { hp: number; maxHp: number; stamina: number; maxStamina: number; name: string };
  wind: { x: number; y: number };
  power: number;        // 0–100
  angle: number;        // graus
  isCharging: boolean;
  consumables: Array<{ iconKey: string; quantity?: number } | null>;
  modifiers: Array<{ iconKey: string } | null>;
}
```

## Instrução de Execução
Instanciar cada componente em `create()`. Chamar `update()` correspondente em cada `BattleHud.update()`. Registrar listener de resize. Manter referências para cada componente como propriedades privadas.

## Formato do Resumo Final
Criar `.ai-orchestration/agents/009-summary.md` com o template padrão de resumo.
