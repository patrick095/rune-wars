import Phaser from 'phaser';
import { WindState } from '../../app/shared/game-core/wind-system';

export class CombatHud {
  private playerHpText!: Phaser.GameObjects.Text;
  private aiHpText!: Phaser.GameObjects.Text;
  private windText!: Phaser.GameObjects.Text;
  private turnText!: Phaser.GameObjects.Text;

  constructor(private scene: Phaser.Scene) {
    const { width } = scene.scale;

    this.playerHpText = scene.add.text(12, 12, '', {
      fontSize: '16px',
      color: '#44aaff',
      fontFamily: 'monospace',
      stroke: '#000000',
      strokeThickness: 3,
    }).setDepth(10);

    this.aiHpText = scene.add.text(width - 12, 12, '', {
      fontSize: '16px',
      color: '#ff4444',
      fontFamily: 'monospace',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(1, 0).setDepth(10);

    this.windText = scene.add.text(width / 2, 12, '', {
      fontSize: '14px',
      color: '#ffffff',
      fontFamily: 'monospace',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5, 0).setDepth(10);

    this.turnText = scene.add.text(width / 2, 36, '', {
      fontSize: '14px',
      color: '#ffdd44',
      fontFamily: 'monospace',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5, 0).setDepth(10);
  }

  update(
    playerHp: number,
    playerMaxHp: number,
    aiHp: number,
    aiMaxHp: number,
    wind: WindState,
    isPlayerTurn: boolean
  ): void {
    this.playerHpText.setText(`HP: ${playerHp}/${playerMaxHp}`);
    this.aiHpText.setText(`HP: ${aiHp}/${aiMaxHp}`);

    const windDir = wind.direction >= 0 ? '→' : '←';
    const windIntensity = Math.round(Math.abs(wind.direction * wind.intensity));
    this.windText.setText(`Vento: ${windDir}${windIntensity}`);

    this.turnText.setText(isPlayerTurn ? 'Seu turno' : 'Turno da IA');
    this.turnText.setColor(isPlayerTurn ? '#44ff88' : '#ff8844');
  }

  setWindTextPosition(x: number): void {
    this.windText.setX(x);
    this.turnText.setX(x);
  }
}
