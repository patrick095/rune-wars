import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import Phaser from 'phaser';
import { AcademyScene } from '../../game/scenes/academy.scene';
import { WeaponSystem } from '../shared/game-core/weapon-system';
import { WeaponDefinition } from '../shared/game-core/weapon-definition';

@Component({
  selector: 'app-academy',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './academy.component.html',
  styleUrls: ['./academy.component.scss'],
})
export class AcademyComponent implements AfterViewInit, OnDestroy {
  @ViewChild('gameContainer') containerRef!: ElementRef<HTMLDivElement>;

  private game: Phaser.Game | null = null;
  private hitPollInterval: ReturnType<typeof setInterval> | null = null;

  hitCount = 0;
  weapons: WeaponDefinition[] = [];

  constructor(private cdr: ChangeDetectorRef) {
    this.weapons = new WeaponSystem().getAll();
  }

  ngAfterViewInit(): void {
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: window.innerWidth - 200,
      height: window.innerHeight,
      backgroundColor: '#1a1a2e',
      parent: this.containerRef.nativeElement,
      scene: [AcademyScene],
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
    };

    this.game = new Phaser.Game(config);

    // Poll hit count every 500ms and update view
    this.hitPollInterval = setInterval(() => {
      const scene = (window as unknown as Record<string, unknown>)['academyScene'] as AcademyScene | undefined;
      const count = scene?.hitCount ?? 0;
      if (count !== this.hitCount) {
        this.hitCount = count;
        this.cdr.detectChanges();
      }
    }, 500);
  }

  ngOnDestroy(): void {
    if (this.hitPollInterval) {
      clearInterval(this.hitPollInterval);
      this.hitPollInterval = null;
    }
    this.game?.destroy(true);
    this.game = null;
  }

  setMode(event: Event): void {
    const mode = (event.target as HTMLSelectElement).value;
    const scene = (window as unknown as Record<string, unknown>)['academyScene'] as { setMode: (m: string) => void } | undefined;
    scene?.setMode(mode);
  }

  setWeapon(event: Event): void {
    const id = (event.target as HTMLSelectElement).value;
    const scene = (window as unknown as Record<string, unknown>)['academyScene'] as { setWeapon: (id: string) => void } | undefined;
    scene?.setWeapon(id);
  }

  resetTargets(): void {
    const scene = (window as unknown as Record<string, unknown>)['academyScene'] as { resetTargets: () => void } | undefined;
    scene?.resetTargets();
  }
}
