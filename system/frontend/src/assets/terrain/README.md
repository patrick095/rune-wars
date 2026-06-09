# Terrain PNG Assets

This directory holds optional PNG files for terrain backgrounds and tile textures.
If these files are absent the game falls back to programmatic (canvas) generation automatically.

## Background images

| File | Dimensions | Key (Phaser) | Map(s) |
|------|-----------|--------------|--------|
| `plains_bg.png` | 3600 × 1280 | `terrain_plains_bg` | plains |
| `castle_bg.png` | 3600 × 1280 | `terrain_castle_bg` | castle |
| `deep_mines_bg.png` | 3600 × 1280 | `terrain_deep_mines_bg` | deep_mines |
| `arcane_ruins_bg.png` | 3600 × 1280 | `terrain_arcane_ruins_bg` | arcane_ruins |
| `runic_forest_bg.png` | 3600 × 1280 | `terrain_runic_forest_bg` | runic_forest |
| `dungeon_bg.png` | 3600 × 1280 | `terrain_dungeon_bg` | dungeon_cave_* |

## Tile textures

| File | Dimensions | Key (Phaser) | Usage |
|------|-----------|--------------|-------|
| `destructible.png` | 8 × 8 | `terrain_destructible` | Destructible tile (overrides all maps if present) |
| `indestructible.png` | 8 × 8 | `terrain_indestructible` | Indestructible tile (overrides all maps if present) |

## Notes

- Background images must exactly match the world size (GRID_COLS × CELL_SIZE by GRID_ROWS × CELL_SIZE).
  With current settings: `450 × 8 = 3600 px` wide, `160 × 8 = 1280 px` tall.
- Tile textures must match CELL_SIZE (currently 8 × 8 px).
- The game uses `scene.textures.exists(key)` to detect loaded PNGs before falling back to
  programmatic canvas generation, so missing files cause zero runtime errors.
- Phaser suppresses 404 errors for failed image loads in production builds; the fallback
  takes over transparently.
