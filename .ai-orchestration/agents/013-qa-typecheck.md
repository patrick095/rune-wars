# Sub-spec — Agent 013: QA + Typecheck Final

## Objetivo
Executar validação final: typecheck TypeScript, build Angular, verificar ausência de regressões críticas conhecidas, e documentar resultado.

## Contexto Mínimo Necessário
- Diretório de frontend: `system/frontend/`
- Comandos:
  - `npx tsc --noEmit` — typecheck sem build
  - `npm run build` — build Angular completo
- Regressões conhecidas a validar (do spec seção 20):
  - Explosão ocorre imediatamente ao contato com mapa
  - Sistema de dano por raio funciona (100% centro, 50% borda)
  - Spawn não inicia em queda
  - Movimentação em desnível continua funcionando
- Critérios de aceite da seção 25 do spec

## Arquivos Autorizados (pode criar/alterar)
- `.ai-orchestration/agents/013-summary.md` (criar resumo)
- Correções triviais de tipo TypeScript se necessário (registrar quais)

## Arquivos que Deve Apenas Consultar
- Qualquer arquivo necessário para entender erros de typecheck

## O que Não Deve Mexer
- Lógica de negócio
- Arquivos de configuração de build

## Dependências Obrigatórias
- Agents 011 e 012 devem estar concluídos

## Critérios de Aceite
- [ ] `npx tsc --noEmit` — zero erros (ou listar erros críticos)
- [ ] `npm run build` — build completo sem erro
- [ ] Resumo com lista de critérios de aceite: ✅ / ❌ / ⚠️ (não testável sem browser)
- [ ] Lista de bugs pendentes (se houver)

## Instrução de Execução
1. `cd system/frontend && npx tsc --noEmit 2>&1` — registrar output
2. `npm run build 2>&1` — registrar output
3. Corrigir apenas erros de tipo simples (import errado, tipo faltando)
4. Registrar erros que precisam de intervenção do desenvolvedor
5. Preencher checklist de critérios de aceite com base no que pode ser verificado estaticamente

## Formato do Resumo Final
Criar `.ai-orchestration/agents/013-summary.md` com o template padrão de resumo.
