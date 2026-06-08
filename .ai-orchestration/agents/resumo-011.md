# Resumo Agente 011

**Status:** Concluído

**Arquivos criados:**
- `system/frontend/src/app/shared/game-core/runic-effect-system.ts`
- `system/frontend/src/app/shared/game-core/status-effect-manager.ts`

**Decisões:**
- `WEAPON_RUNIC_EFFECTS` definido como `Record<string, RunicEffect>` privado no módulo, evitando exposição desnecessária; `getWeaponRunicEffect` retorna cópia via spread para evitar mutação acidental.
- `rollRunicEffect` implementa exatamente `Math.min(0.05 + luck * 0.003, 0.75)` conforme spec.
- Em `tick()`, o dano de BLEED é calculado antes do decremento de duration, para que o último turno de BLEED ainda cause dano antes de ser removido.
- RANDOM_TELEPORT nasce com `duration: 0`, portanto é removido imediatamente no primeiro `tick()` após ser aplicado — comportamento de efeito instantâneo conforme spec.
- `apply()` substitui efeito existente do mesmo tipo (não acumula), garantindo que reaplicar um efeito reinicia sua duração.
- Sem qualquer import de Phaser ou Angular — TypeScript puro.
