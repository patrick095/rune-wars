# Agent 008 — v0.4.0 Weapon Visual + Phaser Integration

## Objetivo
Integrar as 6 armas ao Phaser: sprites/cores distintas por arma, conectar `excavationRadius` ao TerrainEngine, adicionar seletor de arma no debug, e garantir que a IA usa a arma selecionada.

## Contexto mínimo necessário
- Cada arma tem cor de projétil distinta: cannon=0xFFAA00, longbow=0x00FF88, tnt=0xFF4400, boomerang=0xFF88FF, ice-book=0x88CCFF, potion=0x00FFCC
- Ao impactar: `terrainEngine.explode(x, y, weapon.excavationRadius)`
- Debug: select de arma para jogador e IA, painel info com física da arma

## Arquivos autorizados a criar/alterar
```
system/frontend/src/
  game/
    scenes/
      battle.scene.ts (integrar WeaponSystem, usar excavationRadius)
    projectiles/
      projectile-renderer.ts
  app/
    playground/
      debug-overlay/
        debug-overlay.component.ts (adicionar seletor de arma)
        debug-overlay.component.html
```

## Arquivos apenas para consulta
```
system/frontend/src/app/shared/game-core/
  weapon-system.ts
  weapon-definition.ts
  terrain-engine.ts
  projectile-physics.ts
```

## O que NÃO mexer
- `weapon-system.ts`, `weapon-definition.ts` (do agente 007)
- `terrain-engine.ts` (do agente 005)

## Dependências obrigatórias
- Agente 007 concluído

## Critérios de aceite
- Cada arma tem trajetória visualmente distinta
- Canhão cai mais rápido que Arco
- TNT cria explosão maior no terreno
- Boomerang reverte direção visivelmente
- Livro de Gelo tem projétil azul/magenta
- Seletor de arma no debug funciona sem reiniciar cena
- IA usa a arma selecionada para ela

## Memory

### Objetivo
Visual das armas no Phaser + integração com TerrainEngine.

### Contexto permitido
APIs de WeaponSystem (007) + TerrainEngine (005) + BattleScene (004/006).

### Arquivos autorizados
Os listados acima.

### Dependências
007 concluído.

### Restrições
- Não duplicar a lógica de física (está em game-core).
- `projectile-renderer.ts` apenas renderiza o path retornado por `ProjectilePhysics`.

### Critérios de aceite
Ver seção acima.

## Formato do resumo final
Criar `.ai-orchestration/agents/resumo-008.md`.

## Limpeza pós-versão
Após v0.4.0 completa (007+008): deletar `v0.4.0.md` da raiz.

---

## Skills a Carregar

| Skill | Arquivo | Por quê |
|-------|---------|---------|
| **Dev Frontend** | `agents/dev-frontend.md` | Phaser rendering, integração WeaponSystem, debug overlay |
| **Analista Sonoro** | `agents/analista-sonoro.md` | Sons placeholder por arma: tabela de pitch e formatos recomendados |

**Instrução:** `dev-frontend` para código Phaser. `analista-sonoro` apenas para a tabela de SFX por arma (seção "Sons por arma") — não implementar áudio completo ainda, apenas sons placeholder.
