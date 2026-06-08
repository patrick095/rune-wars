# Sub-spec — Agente 039: Hub QA

## Objetivo
Executar validação completa da Floresta Rúnica: build, navegação de cada POI, comportamento mobile/desktop, acessibilidade básica por teclado, confirmar ausência de sistemas novos de gameplay, validar critérios de aceite do v1.1.0.md e registrar todos os bugs encontrados.

## Contexto mínimo necessário
- `v1.1.0.md` seções 19, 20, 21 (critérios de aceite, QA visual, fora do escopo)
- `system/frontend/src/app/app.routes.ts`
- `system/frontend/src/app/hub/hub.component.ts`
- `system/frontend/src/game/scenes/hub.scene.ts`
- `.ai-orchestration/agents/037-resumo.md`
- `.ai-orchestration/agents/038-resumo.md`

## Arquivos autorizados a modificar
Nenhum (QA read-only + documentação). Caso encontre bug crítico: registrar em BUGS_AND_BLOCKERS.md e NO agente específico responsável.

## Dependências
- Agente 037 (obrigatório — estrutura deve existir)
- Agente 038 (obrigatório — art pass deve estar completo)

## Checklist de validação

### Build e compilação
- [ ] `npm run build` passa sem erros
- [ ] Sem imports quebrados
- [ ] Sem `any` não intencional
- [ ] Sem console.error durante inicialização normal

### Rota e navegação
- [ ] `/hub` existe em app.routes.ts com authGuard
- [ ] Login redireciona para `/hub`
- [ ] Cada POI navega para a rota existente correta:
  - pvp → `/pvp`
  - dungeon → `/dungeon`
  - village → `/character`
  - market → `/market`
  - blacksmith → `/craft`
  - guild → `/guild`
  - academy → `/academy`
- [ ] Nenhuma rota nova foi criada (além de `/hub`)
- [ ] Dock mobile navega corretamente para todas as rotas

### Comportamento desktop
- [ ] Hover mostra glow + label em cada POI
- [ ] Click navega corretamente
- [ ] Câmera segue player dentro dos bounds
- [ ] Câmera não sai de 2200x900
- [ ] Pan suave ao selecionar POI distante
- [ ] Atalhos desktop funcionam (recolhíveis)
- [ ] Tecla `Esc` abre painel rápido ou volta

### Comportamento mobile (simular por responsive)
- [ ] Dock inferior visível e funcional
- [ ] Áreas de toque ≥ 52px em todos os POIs
- [ ] Tap1 foca, tap2 navega
- [ ] Botão "voltar ao centro" visível
- [ ] Layout não quebra em 375x667 (iPhone SE)
- [ ] Layout não quebra em 414x896 (iPhone XR)

### Arte e visual
- [ ] Paleta correta por POI (vermelho PvP, roxo Dungeon, etc.)
- [ ] Labels legíveis em menos de 1 segundo
- [ ] Nenhuma animação visualmente conflitante com interação
- [ ] Personagem visível no hub
- [ ] Árvore Rúnica identificável como centro

### Fora do escopo — confirmar ausências
- [ ] Nenhum NPC com diálogo novo
- [ ] Nenhuma quest no hub
- [ ] Nenhum combate no hub
- [ ] Nenhuma coleta/craft no hub
- [ ] Nenhuma nova economia ou moeda
- [ ] Nenhum sistema de progressão novo
- [ ] Nenhuma regra multiplayer nova no hub

### Acessibilidade básica
- [ ] Tab navega por pontos de interesse
- [ ] Enter/Espaço confirma local focado
- [ ] Contraste de labels suficiente

## Cenários de QA Visual (do v1.1.0.md seção 20)
| Cenário | Resultado esperado | Status |
|---------|---------------------|--------|
| Login concluído | Abre Floresta Rúnica com personagem no centro | |
| Passar mouse na Arena | Arena ganha glow vermelho e label aparece | |
| Tocar Dungeon no mobile | Primeiro toque foca, segundo entra | |
| Usar dock mobile | Navega para tela existente | |
| Redimensionar desktop | Câmera mantém personagem dentro de bounds | |
| Voltar de Dungeon | Hub reaparece próximo à Entrada da Dungeon | |
| Sem assets finais | Placeholders ainda comunicam locais e função | |

## Critérios de aceite do v1.1.0.md — validação final
- [ ] Após login, jogador é levado à Floresta Rúnica
- [ ] Personagem é visível no hub
- [ ] Todos os 7 locais existem e são identificáveis
- [ ] Cada local navega para funcionalidade existente
- [ ] Hub funciona em desktop e mobile
- [ ] Hover/tap/foco visual existe em todos os POIs
- [ ] Dock/atalhos rápidos existem como fallback
- [ ] Câmera tem bounds, follow e pan suave
- [ ] Direção de arte cartoon fantasy premium 2D HD
- [ ] Build Angular passa

## Instrução de execução
```
Leia os arquivos listados. Valide cada item do checklist lendo o código — não assuma que funciona. Para cada falha, classifique como CRÍTICO/IMPORTANTE/BAIXO e registre em .ai-orchestration/BUGS_AND_BLOCKERS.md. Documente qual agente deve corrigir cada bug. Salve o resumo completo em .ai-orchestration/agents/039-resumo.md incluindo todos os critérios de aceite com status PASS/FAIL.
```

---

## Memory — Agente 039: Hub QA

### Objetivo
Validação completa da Floresta Rúnica contra todos os critérios de aceite do v1.1.0.md.

### Contexto permitido
v1.1.0.md seções 19/20/21, app.routes.ts, hub.component.ts, hub.scene.ts, resumos 037 e 038.

### Arquivos autorizados
Read-only + BUGS_AND_BLOCKERS.md (registro de bugs).

### Dependências
037 e 038 (ambos obrigatórios).

### Restrições
Não corrigir bugs — apenas registrar. Não modificar código.

### Critérios de aceite
Checklist completo com PASS/FAIL, bugs classificados por severidade.
