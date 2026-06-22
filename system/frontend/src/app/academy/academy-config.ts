export interface AcademyConfig {
    mapId: string;
    weaponId: string;
    targetType: "fixed" | "mobile" | "dummy_player";
    difficulty?: "easy" | "normal" | "hard"; // CPU difficulty
}

export const ACADEMY_MAPS: Array<{ id: string; name: string }> = [
    { id: "map-plains", name: "Planícies" },
    { id: "map-runic-forest", name: "Floresta Rúnica" },
    { id: "map-arcane-ruins", name: "Ruínas Arcanas" },
    { id: "map-mystic-castle", name: "Castelo Místico" },
    { id: "map-deep-mines", name: "Minas Profundas" },
    { id: "dungeon-cave-entrance", name: "Caverna — Entrada" },
    { id: "dungeon-cave-hall", name: "Caverna — Hall" },
    { id: "dungeon-cave-boss", name: "Caverna — Boss" },
];
