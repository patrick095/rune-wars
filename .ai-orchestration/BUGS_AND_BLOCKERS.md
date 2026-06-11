# Bugs e Bloqueios

## Críticos
- (nenhum)

## Importantes
- (nenhum)

## Baixos
- RISCO: item_base_id no banco pode não corresponder a nenhuma chave do ITEM_CATALOG (dados mock com ids diferentes). Mitigação: fallback visual "Item Desconhecido" no frontend.
- RISCO: Tokens JWT antigos não terão claim isAdmin — Admin Panel simplesmente não abrirá até re-login.
- RISCO: Estrutura atual da tabela pvp_room desconhecida — Agent 005 deve verificar antes de aplicar migration.

## Resolvidos
- (nenhum ainda)
