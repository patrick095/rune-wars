# Rune Wars Modular Assets

This folder is the modular 3x asset contract for characters, items, weapons, and projectile effects.

- Character frames are 192x192px.
- Weapon, equipment, secondary, and consumable icons/layers are 144x144px.
- Material icons are 96x96px.
- Character render order is: back, base, armor, face, hair, helmet, weapon, effect.
- Existing composed sprites are kept only as the initial base layer. Replace transparent layer placeholders with dedicated layer art as new assets are produced.

Regenerate with:

```bash
node tools/generate-modular-assets.mjs
```
