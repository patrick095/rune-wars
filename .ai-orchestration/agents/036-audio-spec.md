# Sub-spec — Agente 036: Audio Spec & Placeholders

## Objetivo
Definir o sistema de áudio completo da Floresta Rúnica, criar a documentação técnica de implementação de áudio para o Agente 037 (Angular/Phaser), e criar arquivos de placeholder de áudio (JSON de configuração + mocks) para que o sistema funcione sem assets reais.

## Contexto mínimo necessário
- `v1.1.0.md` seção 13 (Sons ambientes e regras de áudio)
- `system/frontend/src/game/scenes/battle.scene.ts` (como áudio é usado atualmente em cenas Phaser)
- `agents/analista-sonoro.md` (se disponível)

## Arquivos autorizados a criar
```
system/frontend/src/assets/hub/audio/README.md       (spec técnico de todos os sons)
system/frontend/src/assets/hub/audio/audio-config.ts (configuração exportável para HubScene)
```

## O que não deve mexer
- Nenhum componente existente
- Nenhuma cena Phaser existente
- Nenhuma rota

## Dependências
- Agente 033 (leve)
- Pode rodar em paralelo com 034 e 035

## Sons a documentar e configurar

### Camada ambiente base
```
amb_forest_runic_loop  — floresta leve, vento, pássaros/fadas, tons mágicos baixos, loop sem corte
```

### Sons de ambiente por local (spatial audio — volume por distância)
| Som | Local | Características |
|-----|-------|----------------|
| amb_pvp_crowd | Arena PvP | multidão distante, metal leve, tambor baixo |
| amb_dungeon_wind | Dungeon | vento cavernoso, eco roxo, pedra |
| amb_village_life | Vila | passos, vozes distantes, sino leve |
| amb_market_chatter | Mercado | moedas, tecido, murmúrio |
| amb_blacksmith_forge | Ferreiro | bigorna, fogo, magia |
| amb_guild_hall | Guilda | madeira, bandeiras, vozes baixas |
| amb_academy_training | Academia | alvos, flechas, pequenos impactos |
| amb_runic_tree_hum | Árvore Rúnica | hum mágico azul |

### Sons de interação UI
| Som | Evento | Características |
|-----|--------|----------------|
| ui_hover_rune | Hover/foco em POI | curto, rúnico, neutro |
| ui_select_rune | Click/tap em POI | pulso seleção, satisfatório |
| ui_transition_rune | Início de navegação | fade rúnico, 300ms |
| ui_blocked_soft | POI bloqueado | suave, não frustrante |
| ui_notice_soft | Notificação em POI | discreto, informativo |
| ui_dock_tap | Tap no dock mobile | leve, rápido |

## Formato do audio-config.ts
```ts
export const HUB_AUDIO_CONFIG = {
  ambient: {
    base: { key: 'amb_forest_runic_loop', loop: true, volume: 0.3 },
    spatial: {
      pvp:        { key: 'amb_pvp_crowd',       maxVolume: 0.25, radius: 300 },
      dungeon:    { key: 'amb_dungeon_wind',     maxVolume: 0.20, radius: 280 },
      village:    { key: 'amb_village_life',     maxVolume: 0.20, radius: 320 },
      market:     { key: 'amb_market_chatter',   maxVolume: 0.18, radius: 260 },
      blacksmith: { key: 'amb_blacksmith_forge', maxVolume: 0.22, radius: 250 },
      guild:      { key: 'amb_guild_hall',       maxVolume: 0.18, radius: 260 },
      academy:    { key: 'amb_academy_training', maxVolume: 0.15, radius: 240 },
      runicTree:  { key: 'amb_runic_tree_hum',   maxVolume: 0.15, radius: 200 }
    }
  },
  ui: {
    hover:      { key: 'ui_hover_rune',      volume: 0.5 },
    select:     { key: 'ui_select_rune',     volume: 0.6 },
    transition: { key: 'ui_transition_rune', volume: 0.4 },
    blocked:    { key: 'ui_blocked_soft',    volume: 0.4 },
    notice:     { key: 'ui_notice_soft',     volume: 0.35 },
    dockTap:    { key: 'ui_dock_tap',        volume: 0.5 }
  }
} as const;
```

## README.md de áudio deve conter
1. Lista de todos os arquivos de áudio necessários
2. Formato recomendado: `.ogg` + `.mp3` (fallback)
3. Características técnicas por arquivo (BPM quando aplicável, duração, fade in/out)
4. Instruções de implementação para Agente 037 (como usar HUB_AUDIO_CONFIG na HubScene)
5. Regras de volume spatial audio (distância/volume linear)
6. Prompts/descrições para geração de áudio com IA (ElevenLabs, Freesound, etc.)
7. Instrução para graceful degradation: hub deve funcionar sem áudio sem erros

## Critérios de aceite
- [ ] `audio-config.ts` criado com tipagem TypeScript correta
- [ ] `README.md` com spec completo de todos os 15 sons
- [ ] Regra de spatial audio documentada com fórmula de distância
- [ ] Graceful degradation documentada (hub sem áudio não quebra)
- [ ] Prompts/descrições para geração dos áudios
- [ ] Volume padrão baixo (ambiente base ≤ 0.3)
- [ ] Sons de UI curtos (<500ms documentado)

## Instrução de execução
```
Leia v1.1.0.md seção 13 e battle.scene.ts para entender o padrão Phaser de áudio já usado. Crie audio-config.ts com tipagem completa e README.md com spec técnico. O Agente 037 usará este arquivo para implementar áudio na HubScene. Documente graceful degradation. Salve resumo em .ai-orchestration/agents/036-resumo.md.
```

---

## Memory — Agente 036: Audio Spec

### Objetivo
Criar audio-config.ts e README.md como spec técnico completo para o sistema de áudio da Floresta Rúnica.

### Contexto permitido
v1.1.0.md seção 13, battle.scene.ts.

### Arquivos autorizados
Criar apenas em `system/frontend/src/assets/hub/audio/`.

### Dependências
Pode rodar em paralelo com 034 e 035.

### Restrições
Não criar arquivos de áudio binários. Apenas TypeScript de configuração e documentação.

### Critérios de aceite
audio-config.ts tipado + README.md completo com 15 sons documentados.
