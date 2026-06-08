export interface HubPointOfInterest {
    id:
        | "pvp"
        | "dungeon"
        | "village"
        | "market"
        | "blacksmith"
        | "guild"
        | "academy";
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
    {
        id: "academy",
        label: "Academia",
        subtitle: "Treino livre",
        x: 310,
        y: 510,
        width: 360,
        height: 310,
        iconKey: "icon_academy",
        poiKey: "poi_academy",
        route: "/academy",
        accentColor: 0x3a9ad9,
        hoverSound: "ui_hover_rune",
        selectSound: "ui_select_rune",
        rasterKey: "poi_academy_painted",
        rasterPath: "/assets/hub/poi-raster/poi_academy_painted.png?v=20260608-alpha-fix",
        spriteWidth: 400,
        spriteHeight: 350,
        labelOffsetY: -132,
    },
    {
        id: "blacksmith",
        label: "Ferreiro",
        subtitle: "Craft e upgrade",
        x: 800,
        y: 490,
        width: 315,
        height: 270,
        iconKey: "icon_blacksmith",
        poiKey: "poi_blacksmith",
        route: "/craft",
        accentColor: 0xf4a226,
        hoverSound: "ui_hover_rune",
        selectSound: "ui_select_rune",
        rasterKey: "poi_blacksmith_painted",
        rasterPath: "/assets/hub/poi-raster/poi_blacksmith_painted.png?v=20260608-alpha-fix",
        spriteWidth: 365,
        spriteHeight: 315,
        labelOffsetY: -178,
    },
    {
        id: "dungeon",
        label: "Dungeon",
        subtitle: "Andares e recompensas",
        x: 1190,
        y: 150,
        width: 300,
        height: 300,
        iconKey: "icon_dungeon",
        poiKey: "poi_dungeon_entrance",
        route: "/dungeon",
        accentColor: 0x7b2fbe,
        hoverSound: "ui_hover_rune",
        selectSound: "ui_select_rune",
        rasterKey: "poi_dungeon_painted",
        rasterPath: "/assets/hub/poi-raster/poi_dungeon_painted.png?v=20260608-alpha-fix",
        spriteWidth: 290,
        spriteHeight: 345,
        labelOffsetY: -50,
    },
    {
        id: "pvp",
        label: "Arena",
        subtitle: "Duelo e ranqueadas",
        x: 1828,
        y: 265,
        width: 330,
        height: 255,
        iconKey: "icon_pvp",
        poiKey: "poi_pvp_arena",
        route: "/pvp",
        accentColor: 0xe63946,
        hoverSound: "ui_hover_rune",
        selectSound: "ui_select_rune",
        rasterKey: "poi_pvp_painted",
        rasterPath: "/assets/hub/poi-raster/poi_pvp_painted.png?v=20260608-alpha-fix",
        spriteWidth: 370,
        spriteHeight: 295,
        labelOffsetY: -150,
    },
    {
        id: "guild",
        label: "Guild",
        subtitle: "Clã e chat",
        x: 1455,
        y: 530,
        width: 310,
        height: 285,
        iconKey: "icon_guild",
        poiKey: "poi_guild_hall",
        route: "/guild",
        accentColor: 0x7b2fbe,
        hoverSound: "ui_hover_rune",
        selectSound: "ui_select_rune",
        rasterKey: "poi_guild_painted",
        rasterPath: "/assets/hub/poi-raster/poi_guild_painted.png?v=20260608-alpha-fix",
        spriteWidth: 340,
        spriteHeight: 320,
        labelOffsetY: -165,
    },
    {
        id: "market",
        label: "MERCADO",
        subtitle: "Comprar e vender",
        x: 1845,
        y: 865,
        width: 315,
        height: 230,
        iconKey: "icon_market",
        poiKey: "poi_market",
        route: "/market",
        accentColor: 0xcd7f32,
        hoverSound: "ui_hover_rune",
        selectSound: "ui_select_rune",
        rasterKey: "poi_market_painted",
        rasterPath: "/assets/hub/poi-raster/poi_market_painted.png?v=20260608-alpha-fix",
        spriteWidth: 335,
        spriteHeight: 250,
        labelOffsetY: -145,
    },
    {
        id: "village",
        label: "Vila",
        subtitle: "Personagem e inventário",
        x: 1110,
        y: 765,
        width: 270,
        height: 215,
        iconKey: "icon_village",
        poiKey: "poi_main_village",
        route: "/character",
        accentColor: 0x3a9ad9,
        hoverSound: "ui_hover_rune",
        selectSound: "ui_select_rune",
        rasterKey: "poi_village_painted",
        rasterPath: "/assets/hub/poi-raster/poi_village_painted.png?v=20260608-alpha-fix",
        spriteWidth: 370,
        spriteHeight: 330,
        labelOffsetY: -135,
    },
];
