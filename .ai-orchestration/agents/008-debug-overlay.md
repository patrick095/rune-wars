# Agent 008 — Debug Overlay Update

## Objetivo
Atualizar o debug overlay do playground para incluir: todos os 5 mapas PvP + flag de dungeon no select de mapa, slider de agilidade do jogador (0-500), e expor `setPlayerAgility()` para o debug.

## Contexto
Projeto: Rune Wars — Angular 17 + Phaser 3.
Arquivo: `system/frontend/src/app/playground/debug-overlay/debug-overlay.component.ts`

Atualmente o select de mapa tem apenas 'plains' e 'castle'. Precisamos adicionar todos os mapas.
O Agent 007 adicionou `setPlayerAgility()` na BattleScene — este agente usa essa API.

## Arquivos autorizados para alterar
- `src/app/playground/debug-overlay/debug-overlay.component.ts` APENAS

## Arquivos para consultar (somente leitura)
- `src/game/scenes/battle.scene.ts` (ver API pública — setPlayerAgility)

## O que NÃO alterar
- Nenhum outro arquivo

## Dependências
- Agent 005 concluído (confirmar nomes dos mapas PvP)
- Agent 006 concluído (confirmar nomes dos mapas dungeon)
- Agent 007 concluído (confirmar que setPlayerAgility existe)

## Tarefas

### 1. Adicionar todos os mapas PvP ao select
Localizar a seção de Terreno no template e substituir o select:

```html
<!-- ANTES (apenas plains e castle) -->
<select [(ngModel)]="selectedMap" (ngModelChange)="onMapChange($event)" class="debug-select">
  <option value="plains">Planícies</option>
  <option value="castle">Castelo</option>
</select>

<!-- DEPOIS -->
<select [(ngModel)]="selectedMap" (ngModelChange)="onMapChange($event)" class="debug-select">
  <optgroup label="── PvP ──">
    <option value="plains">Planícies</option>
    <option value="castle">Castelo</option>
    <option value="deep_mines">Minas Profundas</option>
    <option value="arcane_ruins">Ruínas Arcanas</option>
    <option value="runic_forest">Floresta Rúnica</option>
  </optgroup>
</select>
```

### 2. Atualizar o tipo de selectedMap

```typescript
// ANTES
selectedMap: 'plains' | 'castle' = 'plains';

// DEPOIS
selectedMap: 'plains' | 'castle' | 'deep_mines' | 'arcane_ruins' | 'runic_forest' = 'plains';
```

### 3. Adicionar slider de agilidade na seção Combate

No template, dentro da section-body de 'combat', adicionar APÓS a label de dificuldade:

```html
<label class="debug-label">Agilidade Jogador (0-500)</label>
<input type="range" min="0" max="500" step="10"
  [(ngModel)]="playerAgility" (ngModelChange)="onPlayerAgilityChange($event)" class="debug-range" />
<span class="debug-value">{{ playerAgility }}</span>
```

### 4. Adicionar campo playerAgility e handler no componente

```typescript
// Adicionar ao estado do componente:
playerAgility = 50; // default playground

// Adicionar método:
onPlayerAgilityChange(v: number): void { this._scene()?.setPlayerAgility(v); }
```

### 5. Atualizar onReset()

```typescript
onReset(): void {
  this._scene()?.resetBattle();
  this.windValue = 0;
  this.playerHp = 100;
  this.aiHp = 100;
  this.baseDamage = 40;
  this.difficulty = 'medium';
  this.playerAgility = 50; // resetar também
}
```

### 6. Atualizar onMapChange() se necessário

O método atual é:
```typescript
onMapChange(m: 'plains'|'castle'): void { this._scene()?.switchMap(m); }
```

Atualizar o tipo do parâmetro para incluir os novos mapas:
```typescript
onMapChange(m: 'plains'|'castle'|'deep_mines'|'arcane_ruins'|'runic_forest'): void {
  this._scene()?.switchMap(m);
}
```

## Critérios de aceite
- [ ] Select de mapa lista todos os 5 mapas PvP
- [ ] Trocar para qualquer mapa no debug muda o mapa corretamente
- [ ] Slider de agilidade 0-500 visível na seção Combate
- [ ] Mover o slider chama `setPlayerAgility()` na BattleScene
- [ ] Resetar partida também reseta o slider para 50
- [ ] Sem erros de TypeScript

## Resumo final obrigatório
Criar `.ai-orchestration/agents/008-debug-overlay-DONE.md`
