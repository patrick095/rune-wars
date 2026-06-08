# Resumo — Agente 033: Hub Spec Validator

## Status
Concluído

## Mapeamento POI → Rota Validado
| POI | Feature key | Rota real |
|-----|-------------|-----------|
| Arena PvP | pvp | /pvp |
| Dungeon | dungeon | /dungeon |
| Vila | village | /character |
| Mercado | market | /market |
| Ferreiro | blacksmith | /craft |
| Guilda | guild | /guild |
| Academia | academy | /academy |

## Redirecionamento pós-login atual
`login.component.ts` linha 86: `this.router.navigate(['/playground'])` — deve ser alterado para `/hub`.

## Estrutura de arquivos a criar
```
system/frontend/src/app/hub/
  hub.component.ts
  hub.component.html
  hub.component.scss
system/frontend/src/game/scenes/
  hub.scene.ts
system/frontend/src/game/hub/
  hub-poi.ts
  hub-camera.ts
  hub-interactions.ts
system/frontend/src/assets/hub/
  icons/          (Agente 034)
  ui/             (Agente 034)
  backgrounds/    (Agente 035)
  poi/            (Agente 035)
  player/         (Agente 035)
  fx/             (Agente 035)
  audio/          (Agente 036)
```

## Assets placeholder necessários
- 8 ícones POI SVG (Agente 034)
- 2 frames UI SVG (Agente 034)
- 4 backgrounds SVG (Agente 035)
- 8 POIs SVG (Agente 035)
- 2 player SVG (Agente 035)
- 5 FX SVG (Agente 035)
- audio-config.ts + README.md (Agente 036)

## Observações
- Rota `/hub` não existe ainda — Agente 037 deve criá-la em app.routes.ts com authGuard
- Rotas existentes validadas: todas presentes em app.routes.ts
- Ferreiro → `/craft` (correto; `/upgrade` é rota separada de upgrade)
- Rota `rankings` não tem POI no hub (fora do escopo v1.1.0)
- Phaser scenes existentes: academy, battle, boot, dungeon, playground
- Pasta `assets` não existe — Agentes 034/035/036 devem criar os diretórios
- authGuard já existe em `system/frontend/src/app/shared/guards/auth.guard.ts`
