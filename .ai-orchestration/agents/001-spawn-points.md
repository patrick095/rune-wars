# Sub-spec — Agente 001: Analisar e Gerar Spawn Points

## Objetivo exato
Criar o script `tools/analyze-spawns.mjs`, rodá-lo contra os 5 terrain PNGs dos mapas PVP, e registrar os 12 spawn points finais (coordenadas de pixel) para cada mapa. Os spawn points devem estar sobre superfície sólida com pelo menos 80px de espaço livre acima.

## Contexto mínimo necessário
- Assets em: `system/frontend/src/assets/maps/{slug}/terrain.png`
- Slugs de pasta: `plains`, `mystic-castle`, `deep-mines`, `arcane-ruins`, `runic-forest`
- Dimensão de todos os terrains: 1672×941 pixels (exceto runic-forest que tem background diferente, mas terrain é 1672×941)
- Threshold alpha para pixel sólido: > 127
- Critério de spawn válido: pixel sólido imediatamente abaixo, pelo menos 80px de clearance acima, run horizontal plana mínima de 40px
- Desejado: 12 spawn points bem distribuídos horizontalmente por mapa

## Arquivos que pode criar/alterar
- `tools/analyze-spawns.mjs` — criar do zero

## Arquivos que deve apenas consultar
- `system/frontend/src/assets/maps/*/terrain.png` — leitura via canvas
- `docs/implementations/2026-06-10-v1.6.0-spec.md` — Apêndice A para referência do script

## O que NÃO deve mexer
- Nenhum arquivo TypeScript
- Nenhum JSON de mapa (apenas registrar os spawn points; outro agente aplica nos JSONs)
- Nenhum arquivo de engine

## Dependências obrigatórias
- Nenhuma

## Critérios de aceite
- [ ] `tools/analyze-spawns.mjs` criado e funcional
- [ ] Script roda sem erro: `node tools/analyze-spawns.mjs`
- [ ] Output contém 12 spawn points por mapa (5 mapas = 60 spawn points total)
- [ ] Cada spawn point tem formato `{ "x": number, "y": number }`
- [ ] Spawn points estão distribuídos horizontalmente (não concentrados em uma área)

## Instrução exata para execução
```
Você é o Agente 001. Leia .ai-orchestration/agents/001-spawn-points.md para seu escopo completo.

Sua tarefa:
1. Ler docs/implementations/2026-06-10-v1.6.0-spec.md (Apêndice A) para referência do script
2. Criar tools/analyze-spawns.mjs (instalar canvas como peer via npm se necessário)
3. Rodar: node tools/analyze-spawns.mjs
4. Capturar o output e registrar os 12 spawn points de cada mapa no seu resumo
5. Criar .ai-orchestration/agents/001-spawn-points-resumo.md com status e resultados

IMPORTANTE: O script precisa do pacote `canvas`. Verifique se está disponível em package.json na raiz ou instale com: npm install canvas --save-dev (na raiz do projeto).
```

## Formato obrigatório do resumo final
Criar `.ai-orchestration/agents/001-spawn-points-resumo.md` contendo:
- Status: Concluído | Parcial | Bloqueado
- Output completo do script com os 12 spawn points por mapa
- Arquivos criados
- Decisões tomadas
- Bugs encontrados

---

## Memory — Agente 001: Analisar e Gerar Spawn Points

### Objetivo
Criar script Node.js que analisa terrain PNGs e extrai 12 spawn points pixel-perfect por mapa PVP.

### Contexto permitido
- `tools/` na raiz do projeto
- `system/frontend/src/assets/maps/*/terrain.png` (leitura apenas)
- Pacote `canvas` para leitura de PNG no Node.js

### Arquivos autorizados
- Criar: `tools/analyze-spawns.mjs`
- Ler: terrain PNGs dos 5 mapas, spec

### Dependências
- Nenhuma

### Restrições
- NÃO alterar nenhum JSON de mapa
- NÃO alterar nenhum TypeScript
- NÃO alterar arquivos de engine
- Apenas criar o script e registrar os resultados no resumo

### Critérios de aceite
- Script roda sem erro
- 12 spawn points por mapa, formato `{x, y}`, distribuídos horizontalmente
