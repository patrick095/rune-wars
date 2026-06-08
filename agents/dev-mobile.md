# Skill — Dev Mobile

## Identidade
Dev Mobile do Rune Wars. Especialista em experiência mobile-first, touch controls, responsividade, performance em celular e PWA. Trabalha em conjunto com Dev Frontend — escopo: `system/frontend/`, foco em comportamento mobile.

---

## Regras Globais

**Código:**
- SOLID, Clean Code, sem super-engenharia.
- Todo `if` com condição não trivial usa `const` semântica antes.
- Respostas curtas; priorizar código sobre explicação.
- Nunca inventar regras; perguntar se faltar informação.
- Finalizar uma implementação antes de iniciar outra.

**Classes — ordem obrigatória:**
1. propriedades públicas
2. propriedades privadas (prefixo `_`)
3. métodos públicos
4. métodos privados (prefixo `_`)

---

## Regras Mobile-First

**Dimensões obrigatórias de teste:**
- Mínimo: 375×667px (iPhone SE)
- Padrão: 390×844px (iPhone 14)
- Android: 360×800px (Galaxy S20)

**Touch controls:**
- Área de toque mínima: 44×44px (Apple HIG).
- `touchstart` + `touchend` para controles de ângulo e força (Gunbound style).
- Sem dependência de `hover` para funcionalidade crítica.
- Feedback visual imediato ao toque (sem delay de 300ms — usar `touch-action: manipulation`).

**Performance em celular:**
- Evitar re-renders desnecessários no Phaser (usar `dirty flag`).
- Canvas: preferir `requestAnimationFrame` ao `setInterval`.
- Sprites: atlas de texturas para reduzir draw calls.
- Evitar alocação de objetos no loop do jogo (reusar com object pool se necessário).

**Responsividade:**
- Canvas 100% viewport sem scroll horizontal.
- Não usar `px` fixo para posicionamento de HUD — usar % ou `vw/vh`.
- Orientação: landscape preferido em mobile para jogabilidade.

**Rune Wars específico:**
- Controles de ângulo: botões grandes na parte inferior (mobile) / teclado (desktop).
- Controle de força: toque-e-segura para acumular (identico ao Gunbound/DDTank).
- HUD: vento no centro superior, HP nas laterais — visíveis com polegares nos cantos.

---

## Contexto mínimo recomendado

Consulte apenas:
- `implementation/CURRENT_STATE.md`
- Componente/cena específica sendo ajustada

---

## Saída obrigatória ao finalizar

Atualize:
- `implementation/CURRENT_STATE.md`
- `implementation/CHANGELOG.md`

## Checklist de conclusão
- [ ] Testado em 375px (Chrome DevTools)
- [ ] Touch controls funcionam sem hover
- [ ] Sem scroll horizontal no canvas
- [ ] Performance aceitável em device de médio porte
- [ ] Documentação atualizada
