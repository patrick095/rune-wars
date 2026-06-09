# Agente 010 — BattleScene: PowerBar Redesign

## Objetivo
Refatorar a barra de força na `BattleScene` para: (1) exibir régua interna com marcações a cada 1, 5 e 10 unidades de força, (2) mostrar ghost/sombra da posição do último tiro, (3) remover o valor numérico exibido externamente à barra.

## Contexto mínimo necessário
- Phaser 3 — a barra de força atual usa `Phaser.GameObjects.Graphics` ou similar
- Verificar implementação atual antes de refatorar
- A barra deve usar `setScrollFactor(0)` para ficar fixada na tela
- Tamanho típico esperado: ~300px de largura

## Especificação visual

```
┌──────────────────────────────────────────────────────────┐
│  10   20   30   40   50   60   70   80   90   100        │
│  |||||||||||||||||||||||||||||||||||||||||||||||||||||   │
│  ←————— fill atual ——————[ghost]————————————————————→  │
└──────────────────────────────────────────────────────────┘
```

### Marcações da régua (sobre o fill da barra)
- A cada 1 unidade: traço 4px altura, branco 30% alpha
- A cada 5 unidades: traço 8px altura, branco 50% alpha
- A cada 10 unidades: traço 12px altura, branco 80% alpha + número acima (10, 20... 100)

### Ghost do último tiro
- Linha vertical na posição `(lastPower / maxPower) * barWidth`
- Cor da barra com 40% alpha
- Permanece entre turnos (persistente até o próximo tiro)
- Atualizado via `recordShot(power: number)`

### Remoção do número externo
- Se existir um texto Phaser exibindo o valor numérico fora da barra, remover ou ocultá-lo
- Os números existem APENAS dentro da barra como parte da régua

## Implementação recomendada

Criar ou refatorar para uma classe auxiliar ou método privado `drawPowerBar(power: number, maxPower: number)`:

```typescript
private lastShotPower = 0;

private drawPowerBar(power: number, maxPower: number): void {
  // 1. Limpar Graphics
  // 2. Desenhar fundo da barra
  // 3. Desenhar fill (proporcional ao power)
  // 4. Desenhar régua (loops de 1, 5, 10)
  // 5. Desenhar ghost (linha na posição lastShotPower)
}

recordShot(power: number): void {
  this.lastShotPower = power;
  // redesenhar para atualizar ghost
}
```

## Arquivos que pode alterar
- `system/frontend/src/game/scenes/battle.scene.ts`

## Arquivos que deve apenas consultar
- Nenhum adicional (ler o estado atual do battle.scene.ts antes de editar)

## O que NÃO deve mexer
- Lógica de turno, dano, física
- Controles de ângulo (agente 009)
- Weapon angle limits (agente 011)
- Map drag (agente 008)

## Dependências obrigatórias
- **Agente 009** concluído: ler estado atual de `battle.scene.ts`

## Critérios de aceite
- [ ] Barra de força tem régua interna com marcações 1/5/10
- [ ] Números 10, 20... 100 visíveis dentro da barra
- [ ] Ghost do último tiro exibido com 40% alpha
- [ ] Ghost persiste entre turnos (não é resetado ao mudar a força atual)
- [ ] Valor numérico externo removido (se existia)
- [ ] `npx tsc --noEmit` sem erros

## Restrições
- **ATENÇÃO**: ler `battle.scene.ts` após agente 009 antes de editar
- Se a barra for muito estreita (< 200px), omitir os números da régua mas manter os traços
- Não quebrar a lógica de exibição/ocultação da barra (deve aparecer apenas no turno do jogador)

## Memory

### Objetivo
Refatorar PowerBar: régua interna, ghost do último tiro, sem número externo.

### Contexto permitido
- `system/frontend/src/game/scenes/battle.scene.ts` (editar — ler estado pós-009)

### Arquivos autorizados
- `system/frontend/src/game/scenes/battle.scene.ts`

### Dependências
- Agente 009 concluído

### Restrições
- Ghost persiste entre turnos
- Números APENAS dentro da barra
- Barra permanece visível apenas no turno do jogador (mesma lógica atual)

### Critérios de aceite
- Régua 1/5/10 implementada
- Ghost funcional
- `npx tsc --noEmit` sem erros

## Formato do resumo final
Criar `.ai-orchestration/agents/010-battlescene-powerbar-redesign-DONE.md` seguindo o formato padrão de resumo.
