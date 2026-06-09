# Decisões da Implementação

| Data       | Decisão                                                                       | Motivo                                                        | Impacto                                     |
| ---------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------- |
| 2026-06-09 | Assets de personagem usam fallback (placeholders)                             | Assets IA ainda não gerados, não bloquear implementação       | CharacterSprite funcional sem crash          |
| 2026-06-09 | `combat-hud.ts` e `power-meter-hud.ts` mantidos intactos                     | Segurança para rollback até validação final                   | Leve redundância temporária                 |
| 2026-06-09 | MapModifier usa círculos Graphics como placeholder visual                     | Assets de modificadores não gerados nesta fase                | Visual provisório — funcional                |
| 2026-06-09 | Agent 011 usa marcador `// [v1.5.0]` em cada alteração                        | Facilitar revisão cirúrgica e rollback                        | Rastreabilidade de cada change               |
| 2026-06-09 | Agents 001–008, 010 podem rodar em paralelo                                   | Sem dependências entre si                                     | Reduz tempo total de implementação           |
| 2026-06-09 | `ProjectileState` definida como interface local no Agent 008                  | Evitar acoplamento antes de ver assinatura real em battle.scene | Agent 011 reconcilia na integração         |
| 2026-06-09 | Assets físicos (Midjourney/IA) ficam fora do escopo de código desta versão   | Pipeline de arte é processo manual separado                   | Sprites ficam com placeholder até arte pronta|
