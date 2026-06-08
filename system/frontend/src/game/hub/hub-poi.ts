export interface HubPointOfInterest {
  id: 'pvp' | 'dungeon' | 'village' | 'market' | 'blacksmith' | 'guild' | 'academy';
  label: string;
  subtitle: string;
  x: number;
  y: number;
  width: number;
  height: number;
  iconKey: string;
  poiKey: string;
  route: string;
  accentColor: number;
  hoverSound: string;
  selectSound: string;
}

export const HUB_POIS: HubPointOfInterest[] = [
  { id: 'academy',    label: 'ACADEMIA',  subtitle: 'Treino livre',             x: 255,  y: 510, width: 270, height: 230, iconKey: 'icon_academy',    poiKey: 'poi_academy',          route: '/academy',   accentColor: 0x3A9AD9, hoverSound: 'ui_hover_rune', selectSound: 'ui_select_rune' },
  { id: 'blacksmith', label: 'FERREIRO',  subtitle: 'Craft e upgrade',          x: 760,  y: 500, width: 310, height: 260, iconKey: 'icon_blacksmith', poiKey: 'poi_blacksmith',       route: '/craft',     accentColor: 0xF4A226, hoverSound: 'ui_hover_rune', selectSound: 'ui_select_rune' },
  { id: 'dungeon',    label: 'DUNGEON',   subtitle: 'Andares e recompensas',    x: 1110, y: 275, width: 360, height: 300, iconKey: 'icon_dungeon',    poiKey: 'poi_dungeon_entrance', route: '/dungeon',   accentColor: 0x7B2FBE, hoverSound: 'ui_hover_rune', selectSound: 'ui_select_rune' },
  { id: 'pvp',        label: 'ARENA PVP', subtitle: 'Duelo e ranqueadas',       x: 1810, y: 365, width: 380, height: 270, iconKey: 'icon_pvp',        poiKey: 'poi_pvp_arena',        route: '/pvp',       accentColor: 0xE63946, hoverSound: 'ui_hover_rune', selectSound: 'ui_select_rune' },
  { id: 'guild',      label: 'GUILD',     subtitle: 'Clã e chat',               x: 1390, y: 555, width: 330, height: 285, iconKey: 'icon_guild',      poiKey: 'poi_guild_hall',       route: '/guild',     accentColor: 0x7B2FBE, hoverSound: 'ui_hover_rune', selectSound: 'ui_select_rune' },
  { id: 'market',     label: 'MERCADO',   subtitle: 'Comprar e vender',         x: 1875, y: 690, width: 320, height: 210, iconKey: 'icon_market',     poiKey: 'poi_market',           route: '/market',    accentColor: 0xCD7F32, hoverSound: 'ui_hover_rune', selectSound: 'ui_select_rune' },
  { id: 'village',    label: 'VILA',      subtitle: 'Personagem e inventário',  x: 1050, y: 670, width: 260, height: 220, iconKey: 'icon_village',    poiKey: 'poi_main_village',     route: '/character', accentColor: 0x3A9AD9, hoverSound: 'ui_hover_rune', selectSound: 'ui_select_rune' },
];
