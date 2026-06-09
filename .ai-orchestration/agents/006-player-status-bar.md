# Sub-spec — Agent 006: PlayerStatusBar

## Objetivo
Criar `game/hud/player-status-bar.ts` — barra de status do personagem (HP + estamina) com avatar, nome, barras graduais com gradiente. Versão player (esquerda) e inimigo (direita, espelhada).

## Contexto Mínimo Necessário
- Stack: Phaser 3
- Layout:
  - Fundo semitransparente arredondado
  - Avatar/ícone da raça (32×32px, bordado com cor do time)
  - Nome do personagem (14px bold)
  - Barra HP: gradiente verde→amarelo→vermelho conforme %
  - Barra Estamina: azul claro, abaixo da HP
  - Valores numéricos ao lado das barras (ex: `450/500`)
  - Dimensões: largura = `W * 0.25`, altura = `H * 0.07`
  - Margem do canto: 12px
- Player: canto superior esquerdo
- Inimigo: canto superior direito (espelhado)
- Responsivo: tudo relativo a `scene.scale.width/height`

## Arquivos Autorizados (pode criar/alterar)
- `system/frontend/src/game/hud/player-status-bar.ts` (CRIAR)

## Arquivos que Deve Apenas Consultar
- `system/frontend/src/game/hud/combat-hud.ts` (ver como HP é exibido hoje)
- `system/frontend/src/game/hud/movement-budget-hud.ts` (ver estamina)

## O que Não Deve Mexer
- Nenhum arquivo existente

## Dependências Obrigatórias
- Nenhuma (pode executar imediatamente)

## Critérios de Aceite
- [ ] Classe `PlayerStatusBar` exportada
- [ ] `create(scene: Phaser.Scene, side: 'left' | 'right'): void`
- [ ] `update(hp: number, maxHp: number, stamina: number, maxStamina: number): void`
- [ ] `setName(name: string): void`
- [ ] `setRaceIcon(textureKey: string): void`
- [ ] Barra HP muda de cor conforme percentual (verde→amarelo→vermelho)
- [ ] Responsivo: posição e tamanho relativos ao canvas
- [ ] TypeScript sem erros

## Instrução de Execução
Usar `Graphics` para fundos e barras. `Text` para nome e valores. `Image` para avatar (com fallback para placeholder se texture não existir — não crashar). Barra HP: cor determinada por `hp/maxHp`: >0.5 verde, 0.25–0.5 amarelo, <0.25 vermelho. Usar `Phaser.Display.Color.Interpolate.ColorWithColor` para gradiente suave. Container por componente.

## Formato do Resumo Final
Criar `.ai-orchestration/agents/006-summary.md` com o template padrão de resumo.
