import { Component, OnDestroy, OnInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import Phaser from 'phaser';
import { HubScene } from '../../game/scenes/hub.scene';
import { HUB_POIS, HubPointOfInterest } from '../../game/hub/hub-poi';

@Component({
  selector: 'app-hub',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hub.component.html',
  styleUrl: './hub.component.scss',
})
export class HubComponent implements OnInit, OnDestroy {
  private game: Phaser.Game | null = null;

  isMobile = false;
  activePoi: HubPointOfInterest | null = null;
  dockPois = HUB_POIS;

  constructor(private router: Router, private ngZone: NgZone) {}

  ngOnInit(): void {
    this.isMobile = window.innerWidth <= 768;

    // Phaser must run outside Angular zone to avoid excessive change detection
    this.ngZone.runOutsideAngular(() => {
      this.game = new Phaser.Game({
        type: Phaser.AUTO,
        parent: 'hub-canvas',
        width: window.innerWidth,
        height: window.innerHeight,
        transparent: true,
        backgroundColor: 'transparent',
        physics: {
          default: 'arcade',
          arcade: { gravity: { x: 0, y: 0 }, debug: false },
        },
        scene: [HubScene],
        scale: {
          mode: Phaser.Scale.RESIZE,
          autoCenter: Phaser.Scale.CENTER_BOTH,
        },
      });

      // Listen to events emitted by HubScene
      this.game.events.on('navigateTo', (route: string) => {
        this.ngZone.run(() => this.navigateTo(route));
      });

      this.game.events.on('poiHover', (poi: HubPointOfInterest) => {
        this.ngZone.run(() => { this.activePoi = poi; });
      });

      this.game.events.on('poiHoverEnd', () => {
        this.ngZone.run(() => { this.activePoi = null; });
      });
    });
  }

  ngOnDestroy(): void {
    if (this.game) {
      this.game.destroy(true);
      this.game = null;
    }
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}
