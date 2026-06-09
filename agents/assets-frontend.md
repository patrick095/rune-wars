# Skill: Rune Wars Frontend Asset Integrator

## Objetivo

Implementar no frontend do Rune Wars os assets criados pela skill de geração visual, garantindo que personagens, itens equipados, animações e camadas funcionem corretamente no jogo.

## Quando usar

Use esta skill quando precisar:

* Organizar assets no projeto
* Criar sistema de personagem modular
* Implementar equipamentos visuais
* Renderizar camadas no personagem
* Implementar animações 2D
* Criar spritesheets ou atlas
* Criar sistema de troca de item equipado
* Integrar armas, projéteis e efeitos
* Validar se os assets funcionam no combate

## Conceito principal

O personagem deve ser renderizado por camadas, não como uma imagem única.

Estrutura visual:

```txt
base_body
hair
face
armor
helmet
weapon
back_item
effects
```

Ordem recomendada de render:

```txt
back_item
base_body
armor
face
hair
helmet
weapon
effects
```

## Estrutura de dados

```ts
export type AnimationState =
  | 'idle'
  | 'walk'
  | 'aim'
  | 'shoot'
  | 'hit'
  | 'death'
  | 'victory';

export type EquipmentSlot =
  | 'helmet'
  | 'armor'
  | 'gloves'
  | 'boots'
  | 'weapon'
  | 'back'
  | 'ring'
  | 'necklace';

export type CharacterLayer =
  | 'back'
  | 'base'
  | 'armor'
  | 'face'
  | 'hair'
  | 'helmet'
  | 'weapon'
  | 'effect';

export interface CharacterAssetDefinition {
  characterId: string;
  defaultScale: number;
  availableStates: AnimationState[];
  layers: CharacterLayer[];
}

export interface EquippedItem {
  id: string;
  slot: EquipmentSlot;
  visualLayer?: CharacterLayer;
  animationStates?: Partial<Record<AnimationState, string[]>>;
  icon: string;
}

export interface CharacterRenderState {
  characterId: string;
  state: AnimationState;
  frame: number;
  equippedItems: Partial<Record<EquipmentSlot, EquippedItem>>;
}
```

## Manifest obrigatório

Cada personagem deve ter um manifest:

```json
{
  "characterId": "mage_01",
  "scale": 1,
  "states": {
    "idle": {
      "fps": 6,
      "frames": 4
    },
    "walk": {
      "fps": 8,
      "frames": 6
    },
    "aim": {
      "fps": 6,
      "frames": 3
    },
    "shoot": {
      "fps": 10,
      "frames": 5
    },
    "hit": {
      "fps": 8,
      "frames": 3
    },
    "death": {
      "fps": 8,
      "frames": 6
    },
    "victory": {
      "fps": 6,
      "frames": 4
    }
  },
  "layers": [
    "back",
    "base",
    "armor",
    "face",
    "hair",
    "helmet",
    "weapon",
    "effect"
  ]
}
```

## Convenção de arquivos

```txt
assets/rune-wars/characters/{characterId}/{layer}/{state}_{frame}.png
assets/rune-wars/items/{slot}/{itemId}/{state}_{frame}.png
assets/rune-wars/items/{slot}/{itemId}/icon.png
assets/rune-wars/projectiles/{weaponId}/projectile.png
assets/rune-wars/projectiles/{weaponId}/trail.png
assets/rune-wars/projectiles/{weaponId}/impact.png
```

## Regra de fallback

Se um item não tiver asset para uma animação específica:

1. Usar asset do estado `idle`
2. Se não existir, ocultar visualmente o item
3. Nunca quebrar a renderização do personagem

Exemplo:

```ts
function getItemFrame(
  item: EquippedItem,
  state: AnimationState,
  frame: number
): string | null {
  const stateFrames = item.animationStates?.[state];
  const idleFrames = item.animationStates?.idle;

  const frames = stateFrames ?? idleFrames;

  if (!frames || frames.length === 0) {
    return null;
  }

  return frames[frame % frames.length];
}
```

## Renderização modular

```ts
const RENDER_ORDER: CharacterLayer[] = [
  'back',
  'base',
  'armor',
  'face',
  'hair',
  'helmet',
  'weapon',
  'effect',
];
```

Cada frame deve renderizar todas as camadas disponíveis nessa ordem.

## Regras para equipamentos

Itens que aparecem no personagem:

```txt
weapon
armor
helmet
back
```

Itens que inicialmente só alteram status:

```txt
gloves
boots
ring
necklace
consumables
```

## Integração com combate

Armas devem fornecer:

```ts
export interface WeaponVisualConfig {
  weaponId: string;
  characterLayer: string;
  projectileAsset: string;
  trailAsset?: string;
  impactAsset: string;
  shootSound?: string;
}
```

## Checklist de implementação

```txt
[ ] Personagem renderiza por camadas
[ ] Troca de arma muda visualmente no personagem
[ ] Troca de armadura muda visualmente no personagem
[ ] Capacete/cabelo funcionam sem conflito visual
[ ] Animação não quebra se item não tiver todos os frames
[ ] Projétil da arma aparece corretamente
[ ] Impacto da arma aparece corretamente
[ ] Assets seguem escala consistente
[ ] Nome dos arquivos segue padrão
[ ] Manifest carrega corretamente
[ ] Existe fallback para asset ausente
[ ] Sistema suporta novos personagens sem alterar código base
[ ] Sistema suporta novos itens apenas adicionando manifest/assets
```

## Entrega esperada

Ao executar esta skill, entregar:

```md
# Frontend Implementation Plan

## Asset Folder Structure

## TypeScript Models

## Render Layer System

## Animation System

## Equipment Visual System

## Projectile Visual System

## Fallback Rules

## Implementation Checklist
```
