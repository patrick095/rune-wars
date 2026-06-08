# Agent 014 — v0.7.0 Academia

## Objetivo
Criar a rota `/academy` Angular com `AcademyScene` Phaser, alvos fixos e móveis, painel de configuração, tutorial visual e contador de acertos.

## Contexto mínimo necessário
- Rota Angular: `/academy`
- 4 modos: Campo Livre, Alvos Fixos, Alvos Móveis, Treino Rúnico
- Alvos fixos: 5 estáticos. Alvos móveis: 3 se movendo horizontalmente com bounce
- Tutorial visual: seta de ângulo, barra de força com gradiente, ícone de vento animado, tooltip no primeiro uso
- Sem HP do jogador (modo treino = sem derrota)
- Flag no localStorage para mostrar tutorial apenas no primeiro acesso

## Arquivos autorizados a criar/alterar
```
system/frontend/src/
  app/
    academy/
      academy.component.ts
      academy.component.html
      academy.component.scss
      academy-hud/
        academy-hud.component.ts
        academy-hud.component.html
    app.routes.ts (adicionar /academy)
  game/
    scenes/
      academy.scene.ts
    targets/
      academy-targets.ts
    tutorial/
      tutorial-visual.ts
```

## Arquivos apenas para consulta
```
system/frontend/src/app/shared/game-core/
  weapon-system.ts
  wind-system.ts
  projectile-physics.ts
  runic-effect-system.ts
```

## O que NÃO mexer
- Qualquer arquivo game-core
- BattleScene

## Dependências obrigatórias
- Agentes 013 concluído (ou pode rodar em paralelo com 013, sem dependência real)

## Interface de alvo:
```ts
export interface AcademyTarget {
  x: number; y: number; width: number; height: number; hp: number;
  moving: boolean; moveSpeed?: number; moveRange?: number;
}
```

## Critérios de aceite
- `/academy` abre sem erro
- Alvos fixos aparecem e são destruídos ao ser acertados
- Alvos móveis se movem horizontalmente com bounce nas bordas
- Painel lateral permite trocar arma, vento, consumíveis
- Modo treino não exibe tela de derrota
- Contador de acertos funciona
- Tutorial aparece apenas no primeiro acesso

## Memory

### Objetivo
AcademyScene com alvos, tutorial visual, painel de configuração.

### Contexto permitido
APIs de WeaponSystem, WindSystem, ProjectilePhysics, RunicEffectSystem.

### Arquivos autorizados
Os listados.

### Dependências
013 pode rodar em paralelo (academyscene não usa TerrainConstruction diretamente).

### Restrições
- Sem HP do jogador na Academia.
- Tutorial só aparece na primeira visita (localStorage `'academy_tutorial_seen'`).

### Critérios de aceite
Ver seção acima.

## Formato do resumo final
Criar `.ai-orchestration/agents/resumo-014.md`.

## Limpeza pós-versão
Após v0.7.0 completa (013+014): deletar `v0.7.0.md` da raiz.

---

## Skills a Carregar

| Skill | Arquivo | Por quê |
|-------|---------|---------|
| **Dev Frontend** | `agents/dev-frontend.md` | Nova rota Angular, AcademyScene Phaser, componentes standalone |
| **UI/UX** | `agents/ui-ux.md` | Layout do painel lateral da Academia, fluxos de tela |
| **Dev Mobile** | `agents/dev-mobile.md` | Alvos móveis visíveis em 375px, painel configurável por toque |

**Instrução:** `dev-frontend` para código. `ui-ux` para o painel lateral (seção "Fluxos de tela"). `dev-mobile` para garantir que alvos e controles funcionam em mobile.
