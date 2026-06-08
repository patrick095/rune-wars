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

export type HubAudioConfig = typeof HUB_AUDIO_CONFIG;
