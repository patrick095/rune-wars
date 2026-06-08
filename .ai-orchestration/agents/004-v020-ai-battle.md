# Agent 004 — v0.2.0 BattleScene + HUD + Debug

## Objetivo
Criar a BattleScene Phaser com PvP jogável: animação de projétil, HUD de combate, controles mobile-first de ângulo/força, indicador de trajetória, telas de vitória/derrota, e painel de debug expandido.

## Contexto mínimo necessário
- BattleScene usa os módulos TS puros de `game-core/` (agente 003)
- HUD: HP esquerda (jogador), HP direita (IA), vento centro-topo, turno atual
- Controles: botão + / - para ângulo; toque-e-segura para força (Gunbound style)
- Indicador de trajetória: linha pontilhada estimada
- Ao terminar o turno do jogador: chama `AiLocal.calculateShot()`, anima o tiro da IA

## Arquivos autorizados a criar/alterar
```
system/frontend/src/
  app/
    playground/
      playground.component.ts (atualizar rota para BattleScene)
      debug-overlay/
        debug-overlay.component.ts (expandir com controles v0.2.0)
        debug-overlay.component.html
  game/
    scenes/
      battle.scene.ts
    hud/
      combat-hud.ts
    ui/
      trajectory-indicator.ts
      result-overlay.ts
```

## Arquivos apenas para consulta
```
system/frontend/src/app/shared/game-core/
  turn-manager.ts
  wind-system.ts
  damage-calculator.ts
  projectile-physics.ts
  ai-local.ts
  player-stats.ts
```

## O que NÃO mexer
- Arquivos de `game-core/` (esses são do agente 003)
- `devops/`

## Dependências obrigatórias
- Agentes 001 + 002 + 003 concluídos

## Critérios de aceite
- Turno alterna jogador ↔ IA
- Projétil animado seguindo path de `ProjectilePhysics`
- Vento muda a cada turno e afeta trajetória visualmente
- HP diminui corretamente ao tomar dano
- Overlay vitória/derrota aparece ao chegar a 0 HP
- Painel de debug: sliders de vento/HP, select de dificuldade, reset
- Controles funcionam no mobile (375px)

## Memory

### Objetivo
BattleScene Phaser jogável com HUD, controles mobile e debug.

### Contexto permitido
APIs dos módulos game-core listados na consulta.

### Arquivos autorizados
Os listados na seção acima.

### Dependências
003 concluído (game-core TS puro disponível).

### Restrições
- Não duplicar lógica que já está em game-core.
- Chamar game-core via instâncias, não reescrever física.
- BattleScene é a única cena principal nesta versão.

### Critérios de aceite
Ver seção acima.

## Formato do resumo final
Criar `.ai-orchestration/agents/resumo-004.md`.

## Limpeza pós-versão
Após v0.2.0 completa (003+004): deletar `v0.2.0.md` da raiz.

---

## Skills a Carregar

| Skill | Arquivo | Por quê |
|-------|---------|---------|
| **Dev Frontend** | `agents/dev-frontend.md` | BattleScene Phaser, componentes Angular, signals/RxJS |
| **Dev Mobile** | `agents/dev-mobile.md` | Controles de toque (toque-e-segura para força), HUD mobile |
| **UI/UX** | `agents/ui-ux.md` | Layout do HUD (HP, vento, turno), posição dos controles de ângulo/força |

**Instrução:** Carregar as 3 skills. `dev-frontend` para o código. `dev-mobile` para garantir controles funcionais em 375px. `ui-ux` consultar apenas a seção de HUD de combate para posicionamento dos elementos.
