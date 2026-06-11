export type ItemCategory =
  | 'weapon'
  | 'armor'
  | 'accessory'
  | 'head'
  | 'legs'
  | 'secondary'
  | 'consumable'
  | 'material';

export interface ItemStats {
  attack?: number;
  defense?: number;
  speed?: number;
  hp?: number;
  mana?: number;
  [key: string]: number | undefined;
}

export interface ItemDefinition {
  id: string;
  name: string;
  category: ItemCategory;
  /** Relative to assets/, e.g. 'assets/items/weapons/boomerang.png' */
  iconPath: string;
  description: string;
  stats?: ItemStats;
}

// ---------------------------------------------------------------------------
// ITEM CATALOG — all items found under assets/items/ and assets/rune-wars/items/
// ---------------------------------------------------------------------------

export const ITEM_CATALOG: Record<string, ItemDefinition> = {

  // ── WEAPONS ──────────────────────────────────────────────────────────────

  boomerang: {
    id: 'boomerang',
    name: 'Bumerangue',
    category: 'weapon',
    iconPath: 'assets/items/weapons/boomerang.png',
    description: 'Arma de arremesso que retorna ao lançador após atingir o alvo.',
    stats: { attack: 18, speed: 2 },
  },

  cannon: {
    id: 'cannon',
    name: 'Canhão',
    category: 'weapon',
    iconPath: 'assets/items/weapons/cannon.png',
    description: 'Projétil de alto impacto com grande raio de explosão. Ideal para destruição em área.',
    stats: { attack: 35 },
  },

  'ice-book': {
    id: 'ice-book',
    name: 'Livro de Gelo',
    category: 'weapon',
    iconPath: 'assets/items/weapons/ice-book.png',
    description: 'Grimório encantado que dispara projéteis de gelo, congelando inimigos ao impacto.',
    stats: { attack: 22, mana: 10 },
  },

  longbow: {
    id: 'longbow',
    name: 'Arco Longo',
    category: 'weapon',
    iconPath: 'assets/items/weapons/longbow.png',
    description: 'Arco de precisão com alto alcance. Eficaz contra alvos distantes.',
    stats: { attack: 28, speed: 1 },
  },

  'magic-grenade': {
    id: 'magic-grenade',
    name: 'Granada Mágica',
    category: 'weapon',
    iconPath: 'assets/items/weapons/magic-grenade.png',
    description: 'Explosivo imbuído de magia arcana. Dano em área com efeito mágico residual.',
    stats: { attack: 30, mana: 5 },
  },

  potion: {
    id: 'potion',
    name: 'Poção de Combate',
    category: 'weapon',
    iconPath: 'assets/items/weapons/potion.png',
    description: 'Frasco explosivo lançável que causa dano ao impacto.',
    stats: { attack: 15 },
  },

  tnt: {
    id: 'tnt',
    name: 'TNT',
    category: 'weapon',
    iconPath: 'assets/items/weapons/tnt.png',
    description: 'Explosivo clássico de grande poder destrutivo. Destrói o terreno ao redor.',
    stats: { attack: 40 },
  },

  // Equipment weapons (from assets/items/equipment/)
  sword_iron: {
    id: 'sword_iron',
    name: 'Espada de Ferro',
    category: 'weapon',
    iconPath: 'assets/items/equipment/sword_iron.png',
    description: 'Espada forjada em ferro comum. Confiável e durável para iniciantes.',
    stats: { attack: 20 },
  },

  sword_steel: {
    id: 'sword_steel',
    name: 'Espada de Aço',
    category: 'weapon',
    iconPath: 'assets/items/equipment/sword_steel.png',
    description: 'Espada de aço refinado com fio afiado. Supera a versão de ferro em todos os aspectos.',
    stats: { attack: 32 },
  },

  bow_wood: {
    id: 'bow_wood',
    name: 'Arco de Madeira',
    category: 'weapon',
    iconPath: 'assets/items/equipment/bow_wood.png',
    description: 'Arco artesanal de madeira flexível. Ideal para combate à distância de curto alcance.',
    stats: { attack: 16, speed: 1 },
  },

  staff_runic: {
    id: 'staff_runic',
    name: 'Cajado Rúnico',
    category: 'weapon',
    iconPath: 'assets/items/equipment/staff_runic.png',
    description: 'Cajado imbuído com runas ancestrais. Amplifica o poder mágico do portador.',
    stats: { attack: 25, mana: 20 },
  },

  // ── ARMOR ────────────────────────────────────────────────────────────────

  armor_leather: {
    id: 'armor_leather',
    name: 'Armadura de Couro',
    category: 'armor',
    iconPath: 'assets/items/equipment/armor_leather.png',
    description: 'Armadura leve de couro curtido. Oferece proteção básica sem comprometer a mobilidade.',
    stats: { defense: 15, speed: 1 },
  },

  // ── HEAD ─────────────────────────────────────────────────────────────────

  helmet_iron: {
    id: 'helmet_iron',
    name: 'Elmo de Ferro',
    category: 'head',
    iconPath: 'assets/items/equipment/helmet_iron.png',
    description: 'Capacete forjado em ferro. Protege a cabeça de golpes físicos.',
    stats: { defense: 12 },
  },

  // ── LEGS / BOOTS ─────────────────────────────────────────────────────────

  boots_swift: {
    id: 'boots_swift',
    name: 'Botas Ágeis',
    category: 'legs',
    iconPath: 'assets/items/equipment/boots_swift.png',
    description: 'Botas encantadas que aumentam significativamente a velocidade de movimento.',
    stats: { speed: 5, defense: 5 },
  },

  // ── ACCESSORIES ──────────────────────────────────────────────────────────

  ring_luck: {
    id: 'ring_luck',
    name: 'Anel da Sorte',
    category: 'accessory',
    iconPath: 'assets/items/equipment/ring_luck.png',
    description: 'Anel dourado encantado com cristais de sorte. Aumenta a chance de drops raros.',
    stats: { hp: 5 },
  },

  necklace_vitality: {
    id: 'necklace_vitality',
    name: 'Colar da Vitalidade',
    category: 'accessory',
    iconPath: 'assets/items/equipment/necklace_vitality.png',
    description: 'Colar forjado com cristais de vida. Aumenta substancialmente os pontos de vida do portador.',
    stats: { hp: 30 },
  },

  bracelet_strength: {
    id: 'bracelet_strength',
    name: 'Bracelete da Força',
    category: 'accessory',
    iconPath: 'assets/items/equipment/bracelet_strength.png',
    description: 'Bracelete imbuído com gemas de força. Potencializa o dano físico em combate.',
    stats: { attack: 12 },
  },

  // ── SECONDARY ────────────────────────────────────────────────────────────

  shield: {
    id: 'shield',
    name: 'Escudo',
    category: 'secondary',
    iconPath: 'assets/items/secondary/shield.png',
    description: 'Escudo resistente que bloqueia ataques físicos. Pode ser usado para deflectir projéteis.',
    stats: { defense: 25 },
  },

  'healing-book': {
    id: 'healing-book',
    name: 'Livro de Cura',
    category: 'secondary',
    iconPath: 'assets/items/secondary/healing-book.png',
    description: 'Grimório de restauração que permite ao portador curar aliados próximos.',
    stats: { hp: 20, mana: 15 },
  },

  'protection-totem': {
    id: 'protection-totem',
    name: 'Totem de Proteção',
    category: 'secondary',
    iconPath: 'assets/items/secondary/protection-totem.png',
    description: 'Totem ancestral que cria um campo de proteção ao redor do portador.',
    stats: { defense: 18, hp: 10 },
  },

  'runic-builder': {
    id: 'runic-builder',
    name: 'Construtor Rúnico',
    category: 'secondary',
    iconPath: 'assets/items/secondary/runic-builder.png',
    description: 'Ferramenta mágica capaz de construir e modificar estruturas no mapa.',
    stats: { mana: 10 },
  },

  'camouflage-orb': {
    id: 'camouflage-orb',
    name: 'Orbe de Camuflagem',
    category: 'secondary',
    iconPath: 'assets/items/secondary/camouflage-orb.png',
    description: 'Orbe mágico que envolve o portador em camuflagem, tornando-o invisível brevemente.',
    stats: { speed: 3 },
  },

  // ── CONSUMABLES ──────────────────────────────────────────────────────────

  heal: {
    id: 'heal',
    name: 'Poção de Cura',
    category: 'consumable',
    iconPath: 'assets/items/consumables/heal.png',
    description: 'Poção medicinal que restaura pontos de vida instantaneamente ao ser consumida.',
    stats: { hp: 50 },
  },

  teleport: {
    id: 'teleport',
    name: 'Pergaminho de Teleporte',
    category: 'consumable',
    iconPath: 'assets/items/consumables/teleport.png',
    description: 'Pergaminho mágico que teleporta o usuário para um local seguro no mapa.',
  },

  'ice-throw': {
    id: 'ice-throw',
    name: 'Arremesso de Gelo',
    category: 'consumable',
    iconPath: 'assets/items/consumables/ice-throw.png',
    description: 'Cristal de gelo consumível que pode ser arremessado, congelando a área de impacto.',
    stats: { attack: 20 },
  },

  invisibility: {
    id: 'invisibility',
    name: 'Poção de Invisibilidade',
    category: 'consumable',
    iconPath: 'assets/items/consumables/invisibility.png',
    description: 'Poção alquímica que torna o usuário completamente invisível por alguns turnos.',
  },

  'calibration-shot': {
    id: 'calibration-shot',
    name: 'Disparo de Calibração',
    category: 'consumable',
    iconPath: 'assets/items/consumables/calibration-shot.png',
    description: 'Projétil especial que revela informações de trajetória, auxiliando na mira.',
  },

  // ── MATERIALS ────────────────────────────────────────────────────────────

  iron_ore: {
    id: 'iron_ore',
    name: 'Minério de Ferro',
    category: 'material',
    iconPath: 'assets/items/materials/iron_ore.png',
    description: 'Minério bruto de ferro extraído de cavernas. Usado na forja de armas e armaduras.',
  },

  steel_bar: {
    id: 'steel_bar',
    name: 'Barra de Aço',
    category: 'material',
    iconPath: 'assets/items/materials/steel_bar.png',
    description: 'Barra de aço refinado obtida a partir do processamento de minério de ferro.',
  },

  hardwood: {
    id: 'hardwood',
    name: 'Madeira Resistente',
    category: 'material',
    iconPath: 'assets/items/materials/hardwood.png',
    description: 'Madeira dura de alta qualidade retirada de árvores antigas da floresta.',
  },

  fiber: {
    id: 'fiber',
    name: 'Fibra',
    category: 'material',
    iconPath: 'assets/items/materials/fiber.png',
    description: 'Fibra vegetal resistente usada na fabricação de cordas e arcos.',
  },

  leather: {
    id: 'leather',
    name: 'Couro',
    category: 'material',
    iconPath: 'assets/items/materials/leather.png',
    description: 'Couro curtido de alta resistência. Base para armaduras leves e equipamentos.',
  },

  rune_crystal: {
    id: 'rune_crystal',
    name: 'Cristal Rúnico',
    category: 'material',
    iconPath: 'assets/items/materials/rune_crystal.png',
    description: 'Cristal imbuído de energia rúnica. Essencial para criar itens mágicos poderosos.',
  },

  life_crystal: {
    id: 'life_crystal',
    name: 'Cristal de Vida',
    category: 'material',
    iconPath: 'assets/items/materials/life_crystal.png',
    description: 'Cristal pulsante com energia vital. Usado para criar itens de restauração e vitalidade.',
  },

  agility_crystal: {
    id: 'agility_crystal',
    name: 'Cristal de Agilidade',
    category: 'material',
    iconPath: 'assets/items/materials/agility_crystal.png',
    description: 'Cristal que emana energia cinética. Utilizado na criação de equipamentos de velocidade.',
  },

  gold_nugget: {
    id: 'gold_nugget',
    name: 'Pepita de Ouro',
    category: 'material',
    iconPath: 'assets/items/materials/gold_nugget.png',
    description: 'Pepita de ouro puro encontrada em minas profundas. Material precioso para acessórios.',
  },

  luck_gem: {
    id: 'luck_gem',
    name: 'Gema da Sorte',
    category: 'material',
    iconPath: 'assets/items/materials/luck_gem.png',
    description: 'Gema rara que irradia fortuna. Componente chave para criação de itens de sorte.',
  },

  strength_gem: {
    id: 'strength_gem',
    name: 'Gema de Força',
    category: 'material',
    iconPath: 'assets/items/materials/strength_gem.png',
    description: 'Gema carregada com energia de força bruta. Usada para criar equipamentos de ataque.',
  },
};

// ---------------------------------------------------------------------------
// Fallback para item_base_id desconhecido
// ---------------------------------------------------------------------------

export const UNKNOWN_ITEM: ItemDefinition = {
  id: 'unknown',
  name: 'Item Desconhecido',
  category: 'weapon',
  iconPath: 'assets/items/placeholder.png',
  description: 'Item não identificado.',
};

export function getItemDefinition(itemBaseId: string): ItemDefinition {
  return ITEM_CATALOG[itemBaseId] ?? { ...UNKNOWN_ITEM, id: itemBaseId };
}
