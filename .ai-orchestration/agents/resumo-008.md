# Resumo Agente 008

**Status:** Concluído

**Arquivos criados/modificados:**
- `system/frontend/src/game/projectiles/projectile-renderer.ts` — criado
- `system/frontend/src/game/scenes/battle.scene.ts` — modificado
- `system/frontend/src/game/hud/combat-hud.ts` — modificado
- `system/frontend/src/app/playground/debug-overlay/debug-overlay.component.ts` — modificado

**Decisões:**
- Renomeado `physics` → `projectilePhysics` na BattleScene para evitar conflito com a propriedade `physics` da classe base `Phaser.Scene` (erro TS2416).
- O `projectile` Phaser.Arc original foi renomeado para `projectileArc` e sua criação delegada ao `ProjectileRenderer`; o método `animateAlongPath` do renderer é usado para mover o arco ao longo do path calculado.
- A detecção de colisão (terrain/target/ground) foi movida para antes da animação: o path é clipado no ponto de impacto, evitando lógica duplicada dentro do callback de cada frame. O `onComplete` do renderer recebe o ponto final e executa explosão + dano.
- O `excavationRadius` do WeaponDefinition é passado diretamente ao `terrainEngine.explode()`.
- O `baseDamage` de cada arma é lido do WeaponDefinition ao invés do campo local `baseDamage` da cena.
- O método `setBaseDamage` legado (debug panel v0.2) foi mantido mas agora mutaciona cópias shallow das armas ativas, preservando compatibilidade.
- `CombatHud.update` recebeu parâmetro opcional `weaponName` que popula um texto adicional abaixo do indicador de turno (y=58).
- O debug overlay exibe painel readonly com dano/impactRadius/excavationRadius da arma do jogador selecionada via getter `selectedWeaponInfo`.
- `window` cast feito via `as unknown as Record<string, unknown>` para satisfazer o compilador (o cast direto `as Record<string, unknown>` era inválido no strict mode).
