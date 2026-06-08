# Agent 010 — v0.5.0 Character UI + localStorage

## Objetivo
Criar a rota `/character` Angular com painel de customização de atributos, persistência em localStorage, 5 presets de build, e integrar PlayerStats com DamageCalculator na batalha.

## Contexto mínimo necessário
- 4 sliders (Força, Agilidade, Vitalidade, Sorte) com +/- botões
- Exibir em tempo real: HP, Dano, Defesa, Mobilidade, Chance Rúnica
- Exibir pontos gastos vs. disponíveis
- Lista de armas com ícone de cadeado para bloqueadas
- Botão "Salvar Build", Dropdown de Presets
- localStorage key: `'runewars_build'`

### 5 presets (nível 50 = 196 pts):
| Preset | STR | AGI | VIT | LCK |
|--------|-----|-----|-----|-----|
| DPS | 80 | 40 | 40 | 36 |
| Tank | 20 | 60 | 100 | 16 |
| Sorte | 20 | 40 | 60 | 76 |
| Escavador | 60 | 50 | 56 | 30 |
| Engenheiro | 20 | 80 | 40 | 56 |

## Arquivos autorizados a criar/alterar
```
system/frontend/src/app/
  character/
    character.component.ts
    character.component.html
    character.component.scss
    character-presets.ts
  app.routes.ts (adicionar rota /character)
  shared/
    services/
      character-storage.service.ts
```

## Arquivos apenas para consulta
```
system/frontend/src/app/shared/game-core/
  player-stats.ts
  attribute-calculator.ts
  weapon-requirements.ts
  weapon-system.ts
```

## O que NÃO mexer
- `player-stats.ts`, `attribute-calculator.ts`, `weapon-requirements.ts` (agente 009)
- Qualquer arquivo da BattleScene

## Dependências obrigatórias
- Agente 009 concluído

## Critérios de aceite
- Rota `/character` abre sem erro
- Sliders atualizam derivados em tempo real
- Armas com requisito não atendido aparecem com ícone de cadeado
- Presets carregam atributos corretos
- Build salva em localStorage e carrega ao reabrir o navegador
- Pontos não ultrapassam limite do nível

## Memory

### Objetivo
Tela Angular de customização de personagem com localStorage e presets.

### Contexto permitido
APIs de PlayerStats, AttributeCalculator, WeaponSystem + tabela de presets.

### Arquivos autorizados
Os listados.

### Dependências
009 concluído.

### Restrições
- Mobile-first: sliders grandes (min 44px de altura de toque).
- `CharacterStorageService` encapsula todo acesso ao localStorage.
- Não usar localStorage diretamente nos componentes.

### Critérios de aceite
Ver seção acima.

## Formato do resumo final
Criar `.ai-orchestration/agents/resumo-010.md`.

## Limpeza pós-versão
Após v0.5.0 completa (009+010): deletar `v0.5.0.md` da raiz.

---

## Skills a Carregar

| Skill | Arquivo | Por quê |
|-------|---------|---------|
| **Dev Frontend** | `agents/dev-frontend.md` | Angular standalone, estrutura features/pages, services para localStorage |
| **UI/UX** | `agents/ui-ux.md` | Layout mobile: sliders grandes, legibilidade, fluxo /character |
| **Dev Mobile** | `agents/dev-mobile.md` | Sliders com toque ≥ 44px, teste em 375px |

**Instrução:** `dev-frontend` para o código Angular. `ui-ux` para o layout do painel (seção de layout de telas). `dev-mobile` para garantir que sliders são usáveis por toque.
