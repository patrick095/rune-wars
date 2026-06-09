# Agente 009 — BattleScene: Controles de Ângulo Refinados (Mobile)

## Objetivo
Implementar na `BattleScene`: (1) detecção de dispositivo mobile via `matchMedia`, (2) botões de ângulo visíveis APENAS em mobile com layout ergonômico na zona inferior, (3) hold-to-repeat para os botões de ângulo (400ms delay + 80ms interval), (4) throttle de 100ms para teclas de ângulo no teclado.

## Contexto mínimo necessário
- Phaser 3 — botões são `Phaser.GameObjects` com `setScrollFactor(0)` e `depth` alto
- Detecção mobile: `window.matchMedia('(pointer: coarse)').matches`
- Botões de ângulo já existem possivelmente — verificar estado atual do arquivo e adaptar
- `changeAngle(delta: number)` deve ser o método central de mudança de ângulo
- Teclas de ângulo: `←`/`→` ou `Q`/`E` — verificar o mapeamento atual no arquivo

## Implementação exigida

### Detecção mobile
```typescript
private isMobile = window.matchMedia('(pointer: coarse)').matches;
```

### Hold-to-repeat
```typescript
private holdTimer: ReturnType<typeof setTimeout> | null = null;
private holdInterval: ReturnType<typeof setInterval> | null = null;

onAngleButtonDown(delta: 1 | -1): void {
  this.changeAngle(delta);
  this.holdTimer = setTimeout(() => {
    this.holdInterval = setInterval(() => this.changeAngle(delta), 80);
  }, 400);
}

onAngleButtonUp(): void {
  if (this.holdTimer) { clearTimeout(this.holdTimer); this.holdTimer = null; }
  if (this.holdInterval) { clearInterval(this.holdInterval); this.holdInterval = null; }
}
```

### Throttle de teclado
```typescript
private lastAngleKeyTime = 0;

handleAngleKey(delta: 1 | -1): void {
  const now = Date.now();
  if (now - this.lastAngleKeyTime < 100) return;
  this.lastAngleKeyTime = now;
  this.changeAngle(delta);
}
```

### Layout mobile dos botões
- Posição: zona inferior da tela, `setScrollFactor(0)`, `depth 20`
- Tamanho mínimo: 72×72px por botão
- Feedback visual: alpha 0.7 ao pressionar, 1.0 ao soltar
- Botões: ◀ (ângulo -1°), ▶ (ângulo +1°)
- Se `isMobile = false`: NÃO criar os botões
- Limpar `holdTimer` e `holdInterval` em `endTurn()` ou equivalente

## Arquivos que pode alterar
- `system/frontend/src/game/scenes/battle.scene.ts`

## Arquivos que deve apenas consultar
- Nenhum adicional (ler o estado atual do battle.scene.ts antes de editar)

## O que NÃO deve mexer
- Lógica de turno, dano, física
- PowerBar (agente 010)
- Weapon angle limits (agente 011)
- Map drag (agente 008)

## Dependências obrigatórias
- **Agente 008** concluído: ler estado atual de `battle.scene.ts`

## Critérios de aceite
- [ ] `isMobile` detectado corretamente via matchMedia
- [ ] Botões de ângulo só existem quando `isMobile = true`
- [ ] Hold-to-repeat: primeiro disparo imediato, depois delay 400ms, depois a cada 80ms
- [ ] Throttle de teclado: no máximo 1 disparo a cada 100ms por tecla de ângulo
- [ ] Botões têm `setScrollFactor(0)` e depth alto (≥ 20)
- [ ] `holdTimer/holdInterval` limpos ao fim do turno ou ao destruir a cena
- [ ] `npx tsc --noEmit` sem erros

## Restrições
- **ATENÇÃO**: ler `battle.scene.ts` após agente 008 antes de editar
- Não remover botões/controles existentes de forma incompatível
- Não criar botões de força (escopo não incluído neste agente — verificar se já existem)

## Memory

### Objetivo
Detecção mobile, botões de ângulo mobile-only, hold-to-repeat, throttle teclado.

### Contexto permitido
- `system/frontend/src/game/scenes/battle.scene.ts` (editar — ler estado pós-008)

### Arquivos autorizados
- `system/frontend/src/game/scenes/battle.scene.ts`

### Dependências
- Agente 008 concluído

### Restrições
- Botões APENAS em mobile (matchMedia pointer: coarse)
- Hold: 400ms delay, 80ms interval
- Throttle teclado: 100ms
- Limpar timers no endTurn

### Critérios de aceite
- Botões mobile criados e funcionais
- Hold-to-repeat funcionando
- Throttle de teclado implementado
- `npx tsc --noEmit` sem erros

## Formato do resumo final
Criar `.ai-orchestration/agents/009-battlescene-angle-controls-DONE.md` seguindo o formato padrão de resumo.
