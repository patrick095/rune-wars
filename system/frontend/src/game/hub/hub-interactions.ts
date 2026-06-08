import Phaser from 'phaser';

export function applyHoverState(
  scene: Phaser.Scene,
  gameObject: Phaser.GameObjects.Rectangle,
  accentColor: number
): void {
  scene.tweens.add({
    targets: gameObject,
    scaleX: 1.04,
    scaleY: 1.04,
    duration: 150,
    ease: 'Sine.Out',
  });
  gameObject.setStrokeStyle(3, accentColor, 1);
}

export function removeHoverState(
  scene: Phaser.Scene,
  gameObject: Phaser.GameObjects.Rectangle
): void {
  scene.tweens.add({
    targets: gameObject,
    scaleX: 1.0,
    scaleY: 1.0,
    duration: 120,
    ease: 'Sine.Out',
  });
  gameObject.setStrokeStyle(0);
}

export function applyPressedState(
  scene: Phaser.Scene,
  gameObject: Phaser.GameObjects.Rectangle
): void {
  scene.tweens.add({
    targets: gameObject,
    scaleX: 0.96,
    scaleY: 0.96,
    duration: 80,
    ease: 'Sine.In',
    yoyo: true,
  });
}
