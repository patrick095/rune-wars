# Sub-spec — Agent 006: Terrain Engine + Terrain Loader

## Objetivo
Portar `terrain-engine.ts` do frontend para o backend (adaptando para `Uint8Array` sem Phaser), e criar `terrain-loader.ts` que carrega PNGs usando `sharp`. Este é o agente mais crítico de física — o TerrainEngine no backend deve ser bit-a-bit idêntico ao do frontend para evitar dessincronização.

## Arquivos que pode criar/alterar
- `system/backend/src/game-engine/physics/terrain-engine.ts` (CRIAR)
- `system/backend/src/game-engine/physics/terrain-loader.ts` (CRIAR)
- `system/backend/package.json` (MODIFICAR — adicionar dependência `sharp`)

## Arquivos que deve apenas consultar
- `system/frontend/src/app/shared/game-core/terrain-engine.ts`
- `system/frontend/src/app/shared/game-core/terrain-types.ts`
- `system/backend/package.json` — versão atual para adicionar sharp
- `system/backend/src/game-engine/game-state.interface.ts`

## O que NÃO deve mexer
- Frontend terrain-engine.ts (NUNCA modificar)
- Qualquer outro arquivo além dos listados

## Dependências obrigatórias
- Agent 001, Agent 002

## Critérios de aceite
- [ ] `TerrainEngine` no backend usa `Uint8Array` como bitmap (sem Phaser)
- [ ] Método `excavate(cx, cy, radius)` modifica o array in-place
- [ ] Método `isPassable(x, y): boolean` para colisão de projétil
- [ ] `TerrainLoader.load(mapName): Promise<TerrainEngine>` usa `sharp` para ler PNG
- [ ] `sharp` adicionado ao package.json do backend
- [ ] Fallback quando PNG não encontrado (mapa vazio + log de erro crítico)
- [ ] Output de `excavate()` idêntico ao frontend para mesmos inputs (CRÍTICO para sync)

## Riscos importantes
- Se TerrainEngine divergir do frontend, terreno ficará dessincronizado entre cliente e servidor
- Recomenda-se criar um comentário de alerta no arquivo: "DEVE ser bit-a-bit idêntico ao frontend terrain-engine.ts"

## Instrução para execução

```
Você é um desenvolvedor TypeScript sênior no projeto Rune Wars.

Sua tarefa é portar o TerrainEngine do frontend para o backend, adaptando para Node.js (sem Phaser), e criar um TerrainLoader com `sharp`.

ATENÇÃO CRÍTICA: O TerrainEngine do backend DEVE produzir output idêntico ao frontend para os mesmos inputs. Qualquer divergência causará dessincronização de terreno entre cliente e servidor.

1. Leia COMPLETAMENTE:
   - system/frontend/src/app/shared/game-core/terrain-engine.ts
   - system/frontend/src/app/shared/game-core/terrain-types.ts
   - system/backend/src/game-engine/game-state.interface.ts
   - system/backend/package.json

2. Crie system/backend/src/game-engine/physics/terrain-engine.ts
   - Substitua Phaser.GameObjects por Uint8Array puro
   - Substitua Phaser.Math por Math nativo
   - Mantenha TODA a lógica de excavate() e colisão idêntica
   - Adicione comentário: // CRÍTICO: lógica deve ser idêntica a frontend/terrain-engine.ts

3. Crie system/backend/src/game-engine/physics/terrain-loader.ts
   - Use `sharp` para ler PNG do mapa
   - Converter RGBA → TerrainMaterial (use mesma lógica do frontend para identificar materiais)
   - Exportar: async function loadTerrainBitmap(mapName: string): Promise<TerrainEngine>
   - Fallback: se PNG não encontrado, log crítico + retornar TerrainEngine vazio

4. Adicione `sharp` ao system/backend/package.json nas dependencies.

REGRAS:
- ZERO imports de Phaser
- Mesma lógica de excavate() que o frontend
- Tratar fallback de PNG ausente
- Não modificar frontend

Resumo final:
# Resumo — Agent 006: Terrain Engine + Loader
## Status
## O que foi feito
## Arquivos alterados
## Decisões tomadas
## Bugs encontrados
## Riscos ou pendências (especialmente: divergência de lógica com frontend?)
## Impacto em outros agentes
```

## Memory — Agent 006

### Objetivo
Portar terrain-engine.ts (Uint8Array sem Phaser) e criar terrain-loader.ts com sharp.

### Arquivos autorizados
- CRIAR: physics/terrain-engine.ts, physics/terrain-loader.ts
- MODIFICAR: system/backend/package.json (adicionar sharp)

### Dependências
- Agent 001, Agent 002

### Restrições
- CRÍTICO: lógica deve ser bit-a-bit idêntica ao frontend
- Sem Phaser
- Fallback obrigatório para PNG ausente
