# Audio Assets — Hub Floresta Rúnica

Este documento descreve todos os arquivos de áudio necessários para o hub, como integrá-los na `HubScene` e as regras de spatial audio.

---

## Lista de Arquivos de Áudio (15 arquivos)

### Ambiente Base (1 arquivo)

| Chave | Arquivo | Tipo | Duração | Fade In | Fade Out |
|---|---|---|---|---|---|
| `amb_forest_runic_loop` | `amb_forest_runic_loop.ogg` / `.mp3` | Loop | ~2 min | 3s | 3s |

**Descrição:** Floresta mágica com textura runica. Sons de folhas, vento suave, partículas mágicas flutuando, insetos noturnos distantes. Loop perfeito sem corte perceptível.

**Prompt IA (ElevenLabs / Freesound):**
> "Enchanted runic forest ambient loop, magical wind through ancient trees, distant magical particles humming softly, no sudden cuts, seamless 2-minute loop, fantasy MMORPG atmosphere, 44.1kHz stereo"

---

### Ambientes Espaciais (8 arquivos)

| Chave | Arquivo | Tipo | Duração | Fade In | Fade Out | maxVolume | Radius |
|---|---|---|---|---|---|---|---|
| `amb_pvp_crowd` | `amb_pvp_crowd.ogg` / `.mp3` | Loop | ~90s | 2s | 2s | 0.25 | 300px |
| `amb_dungeon_wind` | `amb_dungeon_wind.ogg` / `.mp3` | Loop | ~90s | 2s | 2s | 0.20 | 280px |
| `amb_village_life` | `amb_village_life.ogg` / `.mp3` | Loop | ~2min | 2s | 2s | 0.20 | 320px |
| `amb_market_chatter` | `amb_market_chatter.ogg` / `.mp3` | Loop | ~90s | 1.5s | 1.5s | 0.18 | 260px |
| `amb_blacksmith_forge` | `amb_blacksmith_forge.ogg` / `.mp3` | Loop | ~60s | 1.5s | 1.5s | 0.22 | 250px |
| `amb_guild_hall` | `amb_guild_hall.ogg` / `.mp3` | Loop | ~90s | 2s | 2s | 0.18 | 260px |
| `amb_academy_training` | `amb_academy_training.ogg` / `.mp3` | Loop | ~90s | 1.5s | 1.5s | 0.15 | 240px |
| `amb_runic_tree_hum` | `amb_runic_tree_hum.ogg` / `.mp3` | Loop | ~60s | 3s | 3s | 0.15 | 200px |

#### Descrições e Prompts IA

**`amb_pvp_crowd`** — Arena PvP
> "Excited crowd cheering for a fantasy battle arena, distant war drums, clashing metal, roaring spectators, loop seamless, adventurous energy"

**`amb_dungeon_wind`** — Entrada da Dungeon
> "Cavernous dungeon wind ambience, deep resonant echo, purple magical hum, mysterious and ominous underground atmosphere, seamless loop"

**`amb_village_life`** — Vila dos Aventureiros
> "Peaceful village ambience, footsteps on cobblestone, distant conversations, church bell every 30 seconds, birds chirping, warm and welcoming fantasy setting"

**`amb_market_chatter`** — Mercado
> "Busy fantasy market ambience, coins clinking, merchant murmurs, item trades, moderate crowd noise, gold coins rattling, medieval market atmosphere"

**`amb_blacksmith_forge`** — Ferraria
> "Blacksmith forge ambience, rhythmic anvil strikes, roaring fire, metal hammering, magical sparks crackling, heat and metal workshop sounds"

**`amb_guild_hall`** — Guilda
> "Medieval guild hall ambience, creaking wooden floor, fabric banners rustling, low conversation, fireplace crackling, adventurers gathering, warm interior"

**`amb_academy_training`** — Academia
> "Training ground ambience, arrows hitting targets, training impacts, footsteps, combat practice sounds, focused training atmosphere, outdoor fantasy setting"

**`amb_runic_tree_hum`** — Árvore Rúnica Central
> "Magical runic tree humming, deep blue magical resonance, mystical energy pulsing, ancient magical power, ethereal and otherworldly drone, soft magical overtones"

---

### UI / Interface (6 arquivos)

| Chave | Arquivo | Tipo | Duração | Volume |
|---|---|---|---|---|
| `ui_hover_rune` | `ui_hover_rune.ogg` / `.mp3` | One-shot | <200ms | 0.5 |
| `ui_select_rune` | `ui_select_rune.ogg` / `.mp3` | One-shot | <300ms | 0.6 |
| `ui_transition_rune` | `ui_transition_rune.ogg` / `.mp3` | One-shot | ~300ms | 0.4 |
| `ui_blocked_soft` | `ui_blocked_soft.ogg` / `.mp3` | One-shot | <250ms | 0.4 |
| `ui_notice_soft` | `ui_notice_soft.ogg` / `.mp3` | One-shot | <400ms | 0.35 |
| `ui_dock_tap` | `ui_dock_tap.ogg` / `.mp3` | One-shot | <150ms | 0.5 |

#### Descrições e Prompts IA

**`ui_hover_rune`** — Hover em POI
> "Short magical rune hover sound effect, gentle mystical shimmer, <200ms, fantasy UI, subtle magical energy"

**`ui_select_rune`** — Click/Select POI
> "Runic selection confirmation sound, magical click with glowing energy burst, <300ms, satisfying fantasy UI feedback"

**`ui_transition_rune`** — Navegação entre telas
> "Magical scene transition sound, runic swirl with fade, ~300ms, fantasy portal shimmer, smooth navigation feedback"

**`ui_blocked_soft`** — POI bloqueado/indisponível
> "Soft blocked action sound, gentle denial tone, not harsh, subtle magical dampening, <250ms, friendly UI feedback"

**`ui_notice_soft`** — Notificação suave
> "Soft notification chime, gentle magical bell, <400ms, pleasant alert tone, fantasy UI notification"

**`ui_dock_tap`** — Tap no dock mobile
> "Very short tap sound for mobile dock, crisp and clean, <150ms, minimal UI click, responsive touch feedback"

---

## Formatos de Arquivo

Cada arquivo deve ser fornecido em dois formatos para compatibilidade cross-browser:

- **Primário:** `.ogg` (melhor compressão, suporte Firefox/Chrome/Electron)
- **Fallback:** `.mp3` (compatibilidade Safari/iOS)

Estrutura de diretório esperada:
```
assets/hub/audio/
├── audio-config.ts          ← configuração TypeScript
├── README.md                ← este documento
├── amb_forest_runic_loop.ogg
├── amb_forest_runic_loop.mp3
├── amb_pvp_crowd.ogg
├── amb_pvp_crowd.mp3
├── amb_dungeon_wind.ogg
├── amb_dungeon_wind.mp3
├── amb_village_life.ogg
├── amb_village_life.mp3
├── amb_market_chatter.ogg
├── amb_market_chatter.mp3
├── amb_blacksmith_forge.ogg
├── amb_blacksmith_forge.mp3
├── amb_guild_hall.ogg
├── amb_guild_hall.mp3
├── amb_academy_training.ogg
├── amb_academy_training.mp3
├── amb_runic_tree_hum.ogg
├── amb_runic_tree_hum.mp3
├── ui_hover_rune.ogg
├── ui_hover_rune.mp3
├── ui_select_rune.ogg
├── ui_select_rune.mp3
├── ui_transition_rune.ogg
├── ui_transition_rune.mp3
├── ui_blocked_soft.ogg
├── ui_blocked_soft.mp3
├── ui_notice_soft.ogg
├── ui_notice_soft.mp3
├── ui_dock_tap.ogg
└── ui_dock_tap.mp3
```

---

## Regra de Spatial Audio

O volume de cada som espacial é calculado com base na distância do player ao centro do POI:

```ts
volume = maxVolume * Math.max(0, 1 - distance / radius)
```

- `distance` — distância em pixels entre o player e o centro do POI
- `radius` — raio de influência do som (ver tabela acima)
- `maxVolume` — volume máximo quando `distance === 0`
- Resultado `0` quando o player está fora do raio

### Exemplo de implementação (Phaser):

```ts
import { HUB_AUDIO_CONFIG } from '../assets/hub/audio/audio-config';

// Dentro do update() da HubScene
private updateSpatialAudio(playerX: number, playerY: number): void {
  const spatial = HUB_AUDIO_CONFIG.ambient.spatial;

  for (const [zone, config] of Object.entries(spatial)) {
    const poi = this.poiPositions[zone]; // { x, y } do POI
    if (!poi) continue;

    const distance = Phaser.Math.Distance.Between(playerX, playerY, poi.x, poi.y);
    const volume = config.maxVolume * Math.max(0, 1 - distance / config.radius);

    try {
      const sound = this.sound.get(config.key);
      if (sound) {
        sound.setVolume(volume);
        if (volume > 0 && !sound.isPlaying) sound.play();
        if (volume === 0 && sound.isPlaying) sound.stop();
      }
    } catch (e) {
      // graceful degradation — áudio indisponível não quebra a cena
    }
  }
}
```

---

## Implementação na HubScene

### 1. Preload

```ts
import { HUB_AUDIO_CONFIG } from '../assets/hub/audio/audio-config';

preload(): void {
  // Ambiente base
  try {
    this.load.audio(
      HUB_AUDIO_CONFIG.ambient.base.key,
      [
        `assets/hub/audio/${HUB_AUDIO_CONFIG.ambient.base.key}.ogg`,
        `assets/hub/audio/${HUB_AUDIO_CONFIG.ambient.base.key}.mp3`
      ]
    );
  } catch (e) { /* graceful degradation */ }

  // Ambientes espaciais
  for (const config of Object.values(HUB_AUDIO_CONFIG.ambient.spatial)) {
    try {
      this.load.audio(config.key, [
        `assets/hub/audio/${config.key}.ogg`,
        `assets/hub/audio/${config.key}.mp3`
      ]);
    } catch (e) { /* graceful degradation */ }
  }

  // UI sounds
  for (const config of Object.values(HUB_AUDIO_CONFIG.ui)) {
    try {
      this.load.audio(config.key, [
        `assets/hub/audio/${config.key}.ogg`,
        `assets/hub/audio/${config.key}.mp3`
      ]);
    } catch (e) { /* graceful degradation */ }
  }
}
```

### 2. Create — Iniciar ambiente base

```ts
create(): void {
  // ... setup da cena ...

  try {
    const base = HUB_AUDIO_CONFIG.ambient.base;
    this.ambientBase = this.sound.add(base.key, {
      loop: base.loop,
      volume: base.volume
    });
    this.ambientBase.play();
  } catch (e) { /* graceful degradation */ }

  // Pré-criar sons espaciais com volume 0
  for (const [zone, config] of Object.entries(HUB_AUDIO_CONFIG.ambient.spatial)) {
    try {
      this.spatialSounds[zone] = this.sound.add(config.key, { volume: 0, loop: true });
    } catch (e) { /* graceful degradation */ }
  }
}
```

### 3. UI Sounds — Helpers

```ts
private playUiSound(key: keyof typeof HUB_AUDIO_CONFIG.ui): void {
  try {
    const config = HUB_AUDIO_CONFIG.ui[key];
    this.sound.play(config.key, { volume: config.volume });
  } catch (e) { /* graceful degradation */ }
}

// Uso:
// this.playUiSound('hover');
// this.playUiSound('select');
// this.playUiSound('blocked');
```

---

## Graceful Degradation

**Regra fundamental:** O hub DEVE funcionar sem erros mesmo que todos os arquivos de áudio estejam ausentes.

- Todas as chamadas de áudio devem estar dentro de `try/catch`
- Nunca lançar erros por ausência de arquivo de áudio
- Sons ausentes são silenciosamente ignorados
- O Phaser pode emitir warnings no console — isso é aceitável
- Não bloquear a cena esperando áudio carregar

```ts
// Padrão correto
try {
  this.sound.play('ui_hover_rune', { volume: 0.5 });
} catch (_e) {
  // sem áudio — continuar normalmente
}
```

---

## Ferramentas para Geração de Áudio com IA

| Ferramenta | Uso | URL |
|---|---|---|
| **ElevenLabs Sound Effects** | Sons UI, ambientes curtos | elevenlabs.io/sound-effects |
| **Freesound.org** | Biblioteca de sons livres (CC) | freesound.org |
| **Adobe Audition / Audacity** | Loop editing, fade in/out | — |
| **FFmpeg** | Conversão ogg/mp3, normalização | `ffmpeg -i input.wav -q:a 4 output.ogg` |

### Normalização recomendada

```bash
# Normalizar e converter para ogg + mp3
ffmpeg -i source.wav -af "loudnorm=I=-16:TP=-1.5:LRA=11" -q:a 4 output.ogg
ffmpeg -i source.wav -af "loudnorm=I=-16:TP=-1.5:LRA=11" -q:a 2 output.mp3
```

**Target:** -16 LUFS integrado, true peak -1.5 dBTP.
