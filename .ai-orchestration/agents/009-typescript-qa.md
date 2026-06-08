# Agent 009 — TypeScript QA

## Objetivo
Executar verificação de tipos TypeScript em todo o frontend, corrigir todos os erros encontrados, e validar que o projeto compila sem erros. Este é o portão de qualidade antes do commit.

## Contexto
Projeto: Rune Wars — Angular 17 + Phaser 3.
Raiz do frontend: `/Users/patrickchaves/projetos/pessoal/rune-wars/system/frontend`
Todos os agentes anteriores (001–008) já concluídos.

## Arquivos autorizados para alterar
- QUALQUER arquivo com erro de tipo TypeScript identificado pelo compilador
- Preferência por alterações mínimas que resolvam o erro sem mudar comportamento

## Arquivos para consultar
- Todos os arquivos alterados pelos agentes anteriores

## O que NÃO fazer
- Não refatorar código que está funcionando
- Não adicionar features não previstas no spec
- Não mudar lógica de negócio para resolver erros — apenas ajustar tipos

## Tarefas

### 1. Executar verificação de tipos

```bash
cd /Users/patrickchaves/projetos/pessoal/rune-wars/system/frontend
npx tsc --noEmit 2>&1 | head -100
```

Se houver erros, executar novamente sem o `head` para ver todos:
```bash
npx tsc --noEmit 2>&1
```

### 2. Categorizar erros encontrados

Para cada erro, determinar:
- Qual arquivo/linha
- Qual é o erro (tipo incompatível, propriedade não existe, etc.)
- Qual agente o causou
- Como corrigir com impacto mínimo

### 3. Erros esperados (prováveis) e suas soluções

#### a) CharacterFall type mismatch
**Erro:** `Argument of type 'Image' is not assignable to parameter of type 'Rectangle'`
**Solução:** Verificar se Agent 001 atualizou o tipo do parâmetro `sprite` para union type. Se não:
```typescript
// Em character-fall.ts, mudar o tipo do parâmetro sprite:
update(
  sprite: Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle,
  engine: TerrainEngine,
  dt: number
): 'alive' | 'dead'
```

#### b) JSON import sem tipo meta
**Erro:** `Property 'meta' does not exist on type '{ grid: number[][] }'`
**Solução:** Usar type assertion:
```typescript
const mapData = mapPlains as unknown as { meta?: MapMeta; grid: number[][] };
```
Ou adicionar `meta` ao type declaration dos JSONs via `.d.ts` ou `as unknown as`.

#### c) switchMap recebe tipo antigo
**Erro:** `Argument of type '"deep_mines"' is not assignable to parameter of type '"plains" | "castle"'`
**Solução:** Verificar se Agent 007 atualizou o tipo de `MapName`. Se não, atualizar:
```typescript
type MapName = 'plains' | 'castle' | 'deep_mines' | 'arcane_ruins' | 'runic_forest';
```

#### d) setPlayerAgility não existe
**Erro:** `Property 'setPlayerAgility' does not exist on type 'BattleScene'`
**Solução:** Verificar se Agent 007 adicionou o método. Se não, adicionar:
```typescript
setPlayerAgility(agility: number): void {
  this.playerAgility = Math.max(0, Math.min(500, agility));
  this.moveBudgetTotal = moveBudget(this.playerAgility);
  this.moveBudgetUsed = 0;
  this.movementBudgetHUD?.update(0, this.moveBudgetTotal);
}
```

#### e) RenderTexture.erase API
**Erro:** `Expected N arguments, but got M` ou `Property 'erase' does not exist`
**Solução:** Verificar API correta do Phaser. Alternativa robusta:
```typescript
// Se rt.erase() não funcionar, usar abordagem de redraw:
updateCells(destroyed: TerrainCell[]): void {
  if (destroyed.length === 0) return;
  // Marcar células como vazias no engine (já feito) e redesenhar área afetada
  // Apagar região e redesenhar apenas células vizinhas não-destruídas
  for (const cell of destroyed) {
    this.rt.fill(0x000000, 0, cell.x * CELL_SIZE, cell.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
  }
}
```

#### f) Imports de novos arquivos não encontrados
**Erro:** `Cannot find module '../terrain/terrain-collision'`
**Solução:** Verificar se os arquivos foram criados pelo Agent 002. Se não, registrar como bug crítico.

#### g) Grid JSON com property 'meta' em strict mode
Se TypeScript reclama do import do JSON com campo 'meta', adicionar em `tsconfig.json`:
```json
"resolveJsonModule": true
```
(Provavelmente já existe — verificar.)

### 4. Após corrigir todos os erros

```bash
cd /Users/patrickchaves/projetos/pessoal/rune-wars/system/frontend
npx tsc --noEmit
```

Deve retornar sem output (zero erros).

### 5. Se erros persistirem

Registrar cada erro persistente em `.ai-orchestration/BUGS_AND_BLOCKERS.md` com categoria:
- CRÍTICO se bloqueia o build completamente
- IMPORTANTE se é erro de tipo mas não impede execução

### 6. Verificação adicional — lint rápido

```bash
cd /Users/patrickchaves/projetos/pessoal/rune-wars/system/frontend
npx ng build --configuration=development 2>&1 | tail -20
```

Se o build Angular falhar por razões não-TypeScript (ex: template errors), registrar e resolver.

## Critérios de aceite
- [ ] `npx tsc --noEmit` passa sem erros
- [ ] Todos os erros de tipo corrigidos
- [ ] Nenhuma lógica de negócio alterada (apenas types)
- [ ] Bugs encontrados categorizados em BUGS_AND_BLOCKERS.md

## Resumo final obrigatório
Criar `.ai-orchestration/agents/009-typescript-qa-DONE.md` com:
- Lista de todos os erros encontrados
- Como cada um foi resolvido
- Erros que não puderam ser resolvidos (com categoria)
