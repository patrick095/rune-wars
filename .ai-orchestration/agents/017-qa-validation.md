# Agent-017 — QA Validation (Validação Final)

## Status
Pendente

## Objetivo
Executar validação final: typecheck TypeScript, build Angular, verificar todos os critérios de aceite do spec, documentar resultados e criar resumo final permanente em `docs/implementations/`.

## Memory

### Objetivo
Validação final da implementação v1.4.0: build + critérios de aceite + documentação permanente.

### Contexto permitido
- Acesso a todo o projeto para verificação
- `.ai-orchestration/` para ler estado acumulado

### Arquivos autorizados a alterar
- `docs/implementations/2026-06-09-v1.4.0-implementacao.md` (criar)
- Correções mínimas de TypeScript se encontradas (registrar como bug)

### O que NÃO alterar
- Nenhuma feature — apenas verificar e documentar

### Dependências
- Todos os agentes anteriores (001-016) devem estar concluídos

### Critérios de aceite (do spec)
1. Explosão < 50ms do impacto visual até destruição
2. Morte por queda: sprite.y > worldHeight * 1.05 → derrota em < 1 frame
3. Tiro durante queda: sem resposta ao botão ATIRAR
4. Spawn: 0 mortes em spawn em 20 carregamentos
5. Desnível: subir/descer até 3 células sem travar
6. HUD: info do turno anterior visível a partir do 2º turno
7. Grid expandido: 450×160 carrega sem crash
8. +1: segundo tiro em 700ms ± 50ms
9. x3: 3 projéteis com física independente
10. +Dano/+Escavar: valores corretos
11. Docks: sem debug panel para usar consumíveis e modificadores
12. Game frame: proporção 16:9 em qualquer resolução
13. Single-screen: URL permanece /game
14. Modal blocking: 0 cliques atravessam modal
15. Debug: tecla O funciona + hint 🛠
16. PvP Lobby: criação e listagem de salas + modo CPU

### Instrução de execução
```
Execute a validação final da implementação v1.4.0.
1. Rodar npm run build (ou equivalente) — registrar resultado
2. Verificar TypeScript: npx tsc --noEmit — registrar erros encontrados
3. Ler FILES_CHANGED.md para confirmar que todos os arquivos planejados foram alterados
4. Para cada critério de aceite da seção 25 do spec, verificar no código se a implementação está correta
5. Verificar regressão: dungeon mode, playground, ghost trace, consumíveis, efeitos rúnicos
6. Criar docs/implementations/2026-06-09-v1.4.0-implementacao.md com resumo completo
7. Atualizar ORCHESTRATION_STATE.md com status "Finalizado"
8. Confirmar que todos os critérios foram atendidos antes de sinalizar conclusão
9. NÃO remover .ai-orchestration/ — o orquestrador principal fará isso após confirmar com o usuário
```

## Riscos ou pendências
- Se build falhar, classificar erros como CRÍTICO ou IMPORTANTE e notificar orquestrador
- Se critério de aceite não puder ser verificado estaticamente (ex: timing de 50ms), documentar como "requer teste manual"
