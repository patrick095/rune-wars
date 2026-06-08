# Checklist de Limpeza Final

Execute SOMENTE após Agent 009 (QA) passar sem erros críticos.

## Pré-condições obrigatórias
- [ ] Agent 009 executado: `tsc --noEmit` passou sem erros
- [ ] Todos os 9 agentes anteriores com status CONCLUÍDO
- [ ] Nenhum bug CRÍTICO pendente em BUGS_AND_BLOCKERS.md
- [ ] Nenhum agente BLOQUEADO em AGENTS_QUEUE.md

## Passos do Agent 010

1. Criar resumo permanente:
   `docs/implementations/2026-06-08-v1.2.0-gameplay-pvp.md`

2. Remover arquivo de spec:
   `v1.2.0.md` (na raiz do projeto)

3. Fazer git commit com todas as alterações do projeto

4. Remover pasta de orquestração:
   `.ai-orchestration/` (este diretório — último passo)

## Spec files para remover
- `/Users/patrickchaves/projetos/pessoal/rune-wars/v1.2.0.md`

## Mensagem de commit sugerida
```
feat: v1.2.0 — melhorias de gameplay PvP

- Mapas expandidos para 300×80 células (6000×1600px) com 12 spawn points
- Spawn aleatório via Fisher-Yates shuffle a cada partida
- Sistema de movimentação com orçamento por turno baseado em agilidade
- Colisão horizontal + step climbing suave (≤12px)
- Morte por queda em abismo
- Facing direction + flip de sprite + mira espelhada
- Câmera com follow suave e world bounds
- Renderização de terreno via RenderTexture (estilo DDTank/Gunbound)
- Explosões criam buracos visuais via ERASE blend mode
- Debug overlay com todos os mapas + slider de agilidade
```
