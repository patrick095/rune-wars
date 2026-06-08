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
  rasterKey: string;
  rasterPath: string;
  spriteWidth: number;
  spriteHeight: number;
  labelOffsetY: number;
}

export const HUB_POIS: HubPointOfInterest[] = [
  { id: 'academy',    label: 'ACADEMIA',  subtitle: 'Treino livre',             x: 285,  y: 555, width: 300, height: 235, iconKey: 'icon_academy',    poiKey: 'poi_academy',          route: '/academy',   accentColor: 0x3A9AD9, hoverSound: 'ui_hover_rune', selectSound: 'ui_select_rune', rasterKey: 'poi_academy_painted',    rasterPath: '/assets/hub/poi-raster/poi_academy_painted.png',    spriteWidth: 275, spriteHeight: 214, labelOffsetY: -128 },
  { id: 'blacksmith', label: 'FERREIRO',  subtitle: 'Craft e upgrade',          x: 735,  y: 610, width: 325, height: 335, iconKey: 'icon_blacksmith', poiKey: 'poi_blacksmith',       route: '/craft',     accentColor: 0xF4A226, hoverSound: 'ui_hover_rune', selectSound: 'ui_select_rune', rasterKey: 'poi_blacksmith_painted', rasterPath: '/assets/hub/poi-raster/poi_blacksmith_painted.png', spriteWidth: 330, spriteHeight: 375, labelOffsetY: -214 },
  { id: 'dungeon',    label: 'DUNGEON',   subtitle: 'Andares e recompensas',    x: 1105, y: 315, width: 340, height: 320, iconKey: 'icon_dungeon',    poiKey: 'poi_dungeon_entrance', route: '/dungeon',   accentColor: 0x7B2FBE, hoverSound: 'ui_hover_rune', selectSound: 'ui_select_rune', rasterKey: 'poi_dungeon_painted',    rasterPath: '/assets/hub/poi-raster/poi_dungeon_painted.png',    spriteWidth: 360, spriteHeight: 323, labelOffsetY: -180 },
  { id: 'pvp',        label: 'ARENA PVP', subtitle: 'Duelo e ranqueadas',       x: 1835, y: 450, width: 375, height: 300, iconKey: 'icon_pvp',        poiKey: 'poi_pvp_arena',        route: '/pvp',       accentColor: 0xE63946, hoverSound: 'ui_hover_rune', selectSound: 'ui_select_rune', rasterKey: 'poi_pvp_painted',        rasterPath: '/assets/hub/poi-raster/poi_pvp_painted.png',        spriteWidth: 360, spriteHeight: 286, labelOffsetY: -162 },
  { id: 'guild',      label: 'GUILD',     subtitle: 'Clã e chat',               x: 1460, y: 685, width: 340, height: 325, iconKey: 'icon_guild',      poiKey: 'poi_guild_hall',       route: '/guild',     accentColor: 0x7B2FBE, hoverSound: 'ui_hover_rune', selectSound: 'ui_select_rune', rasterKey: 'poi_guild_painted',      rasterPath: '/assets/hub/poi-raster/poi_guild_painted.png',      spriteWidth: 340, spriteHeight: 326, labelOffsetY: -184 },
  { id: 'market',     label: 'MERCADO',   subtitle: 'Comprar e vender',         x: 1815, y: 885, width: 350, height: 255, iconKey: 'icon_market',     poiKey: 'poi_market',           route: '/market',    accentColor: 0xCD7F32, hoverSound: 'ui_hover_rune', selectSound: 'ui_select_rune', rasterKey: 'poi_market_painted',     rasterPath: '/assets/hub/poi-raster/poi_market_painted.png',     spriteWidth: 350, spriteHeight: 298, labelOffsetY: -170 },
  { id: 'village',    label: 'VILA',      subtitle: 'Personagem e inventário',  x: 1100, y: 890, width: 300, height: 240, iconKey: 'icon_village',    poiKey: 'poi_main_village',     route: '/character', accentColor: 0x3A9AD9, hoverSound: 'ui_hover_rune', selectSound: 'ui_select_rune', rasterKey: 'poi_village_painted',    rasterPath: '/assets/hub/poi-raster/poi_village_painted.png',    spriteWidth: 280, spriteHeight: 255, labelOffsetY: -150 },
];
