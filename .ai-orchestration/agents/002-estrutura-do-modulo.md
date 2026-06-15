# Sub-spec — Agent 002: Estrutura do Módulo game-engine

## Objetivo
Criar a estrutura de pastas e o módulo NestJS `game-engine` com barrel exports. Não implementa lógica — apenas scaffolding para que os outros agentes saibam onde criar seus arquivos.

## Arquivos que pode criar/alterar
- `system/backend/src/game-engine/game-engine.module.ts` (CRIAR)
- `system/backend/src/app.module.ts` (MODIFICAR — importar GameEngineModule)
- Criar pastas vazias: `physics/`, `items/`, `ai/`, `validation/` dentro de `game-engine/`

## Arquivos que deve apenas consultar
- `system/backend/src/app.module.ts` — ver como importar módulos existentes
- `system/backend/src/battle/battle.module.ts` — padrão de módulo existente

## O que NÃO deve mexer
- Qualquer arquivo de implementação existente além do app.module.ts

## Dependências obrigatórias
- Nenhuma

## Critérios de aceite
- [ ] `game-engine.module.ts` criado com decorador `@Module({})`
- [ ] `GameEngineModule` importado no `AppModule`
- [ ] Pastas `physics/`, `items/`, `ai/`, `validation/` existem dentro de `game-engine/`
- [ ] Arquivo `.gitkeep` em cada pasta vazia para garantir que o git rastreie

## Instrução para execução

```
Você é um desenvolvedor NestJS sênior trabalhando no projeto Rune Wars.

Sua tarefa é criar a estrutura de pastas e o módulo NestJS `game-engine`. NÃO implemente lógica.

1. Leia system/backend/src/app.module.ts e system/backend/src/battle/battle.module.ts para entender o padrão.

2. Crie system/backend/src/game-engine/game-engine.module.ts com:
@Module({ imports: [], providers: [], exports: [] })
export class GameEngineModule {}

3. Crie as pastas (com .gitkeep):
- system/backend/src/game-engine/physics/.gitkeep
- system/backend/src/game-engine/items/.gitkeep
- system/backend/src/game-engine/ai/.gitkeep
- system/backend/src/game-engine/validation/.gitkeep

4. Importe GameEngineModule no AppModule (system/backend/src/app.module.ts).

Ao terminar, crie um resumo no formato:
# Resumo — Agent 002: Estrutura do Módulo
## Status: Concluído | Parcial | Bloqueado
## O que foi feito
## Arquivos criados/alterados
## Decisões tomadas
## Bugs encontrados
## Impacto em outros agentes
```

## Memory — Agent 002

### Objetivo
Criar estrutura de pastas e módulo NestJS `game-engine`.

### Arquivos autorizados
- CRIAR: game-engine.module.ts, pastas physics/items/ai/validation com .gitkeep
- MODIFICAR: app.module.ts (apenas importar GameEngineModule)

### Restrições
- Sem lógica de implementação
- Sem modificar battle.module.ts ou outros módulos

### Critérios de aceite
- Módulo criado e registrado no AppModule
- Pastas de submodule existem
