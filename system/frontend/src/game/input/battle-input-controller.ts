import Phaser from 'phaser';

/**
 * BattleInputController — controlador unificado de input para todos os
 * modos de batalha (PvP, Dungeon, Academy).
 *
 * Uso:
 *   const controller = new BattleInputController();
 *   controller.attach(this); // dentro do create() da cena
 *   // ...
 *   controller.detach();     // no shutdown/destroy da cena
 *
 * Eventos emitidos via scene.events:
 *   'consumable:use'  { slotIndex: number }   — Q/W/E/R/T → slots 0–4
 *   'modifier:use'    { slotIndex: number }   — 1/2/3/4/5 → slots 0–4
 *   'charge:start'    (sem payload)           — ESPAÇO (primeira vez por turno)
 *   'angle:left'      (sem payload)           — ←
 *   'angle:right'     (sem payload)           — →
 */
export class BattleInputController {
  private scene: Phaser.Scene | null = null;

  // Guardamos as referências dos handlers para poder removê-los no detach()
  private handlers: Array<{ key: string; fn: () => void }> = [];

  // Controla que 'charge:start' só é disparado uma vez por turno
  private chargeStartedThisTurn = false;

  // ──────────────────────────────────────────────────────────
  // Lifecycle
  // ──────────────────────────────────────────────────────────

  /**
   * Registra todos os listeners de teclado na cena fornecida.
   * Deve ser chamado dentro do create() da cena.
   */
  attach(scene: Phaser.Scene): void {
    if (this.scene) {
      this.detach();
    }

    this.scene = scene;
    this.chargeStartedThisTurn = false;

    if (!scene.input.keyboard) return;

    // Consumíveis: Q W E R T → slots 0–4
    const consumableKeys: Array<{ key: string; slot: number }> = [
      { key: 'Q', slot: 0 },
      { key: 'W', slot: 1 },
      { key: 'E', slot: 2 },
      { key: 'R', slot: 3 },
      { key: 'T', slot: 4 },
    ];

    for (const { key, slot } of consumableKeys) {
      const fn = () => {
        this.scene?.events.emit('consumable:use', { slotIndex: slot });
      };
      scene.input.keyboard.on(`keydown-${key}`, fn);
      this.handlers.push({ key: `keydown-${key}`, fn });
    }

    // Modificadores: 1 2 3 4 5 → slots 0–4
    const modifierKeys: Array<{ key: string; slot: number }> = [
      { key: 'ONE',   slot: 0 },
      { key: 'TWO',   slot: 1 },
      { key: 'THREE', slot: 2 },
      { key: 'FOUR',  slot: 3 },
      { key: 'FIVE',  slot: 4 },
    ];

    for (const { key, slot } of modifierKeys) {
      const fn = () => {
        this.scene?.events.emit('modifier:use', { slotIndex: slot });
      };
      scene.input.keyboard.on(`keydown-${key}`, fn);
      this.handlers.push({ key: `keydown-${key}`, fn });
    }

    // ESPAÇO: charge:start (somente primeira vez por turno)
    const onSpace = () => {
      if (this.chargeStartedThisTurn) return;
      this.chargeStartedThisTurn = true;
      this.scene?.events.emit('charge:start');
    };
    scene.input.keyboard.on('keydown-SPACE', onSpace);
    this.handlers.push({ key: 'keydown-SPACE', fn: onSpace });

    // ←: angle:left
    const onLeft = () => {
      this.scene?.events.emit('angle:left');
    };
    scene.input.keyboard.on('keydown-LEFT', onLeft);
    this.handlers.push({ key: 'keydown-LEFT', fn: onLeft });

    // →: angle:right
    const onRight = () => {
      this.scene?.events.emit('angle:right');
    };
    scene.input.keyboard.on('keydown-RIGHT', onRight);
    this.handlers.push({ key: 'keydown-RIGHT', fn: onRight });
  }

  /**
   * Remove todos os listeners registrados pelo attach().
   * Deve ser chamado no shutdown/destroy da cena.
   */
  detach(): void {
    if (!this.scene?.input?.keyboard) {
      this.handlers = [];
      this.scene = null;
      return;
    }

    for (const { key, fn } of this.handlers) {
      this.scene.input.keyboard.off(key, fn);
    }

    this.handlers = [];
    this.scene = null;
    this.chargeStartedThisTurn = false;
  }

  // ──────────────────────────────────────────────────────────
  // Turn control
  // ──────────────────────────────────────────────────────────

  /**
   * Deve ser chamado ao início de cada turno do jogador para
   * permitir que 'charge:start' seja emitido novamente.
   */
  resetTurn(): void {
    this.chargeStartedThisTurn = false;
  }
}

export default BattleInputController;
