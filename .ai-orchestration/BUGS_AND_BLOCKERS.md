# Bugs e Bloqueios

## Críticos
- (nenhum)

## Importantes
- (nenhum)

## Baixos
- (nenhum)

## Resolvidos
- (nenhum)

---

## Riscos monitorados (do spec)
- `sharp` pode ser incompatível no ambiente de deploy → verificar antes da Fase 6
- `TerrainEngine` pode divergir entre frontend/backend após port → Agent 006 deve criar teste de paridade
- IA pode travar event loop do NestJS → Agent 010 deve avaliar uso de `setImmediate` se cálculo > 50ms
- Memória: bitmap 6.3MB × N salas → Agent 006 deve garantir limpeza de estado ao finalizar partida
