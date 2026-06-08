import { AfterViewInit, Component, OnDestroy, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import Phaser from 'phaser';
import { HubScene } from '../../game/scenes/hub.scene';
import { HUB_POIS, HubPointOfInterest } from '../../game/hub/hub-poi';
import { GameEventBusService } from '../shared/services/game-event-bus.service';

@Component({
  selector: 'app-hub',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hub.component.html',
  styleUrl: './hub.component.scss',
})
export class HubComponent implements AfterViewInit, OnDestroy {
  private game: Phaser.Game | null = null;

  isMobile = false;
  activePoi: HubPointOfInterest | null = null;
  dockPois = HUB_POIS;

  constructor(
    private router: Router,
    private ngZone: NgZone,
    private eventBus: GameEventBusService,
  ) {}

  ngAfterViewInit(): void {
    this.isMobile = window.innerWidth <= 768;
    const canvasHost = document.getElementById('hub-canvas');
    const width = canvasHost?.clientWidth || window.innerWidth;
    const height = canvasHost?.clientHeight || window.innerHeight;

    // Phaser must run outside Angular zone to avoid excessive change detection
    this.ngZone.runOutsideAngular(() => {
      this.game = new Phaser.Game({
        type: Phaser.AUTO,
        parent: 'hub-canvas',
        width,
        height,
        antialias: true,
        antialiasGL: true,
        roundPixels: false,
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
        this.ngZone.run(() => this.handleNavigateTo(route));
      });

      this.game.events.on('poiHover', (poi: HubPointOfInterest) => {
        this.ngZone.run(() => { this.activePoi = poi; });
      });

      this.game.events.on('poiHoverEnd', () => {
        this.ngZone.run(() => { this.activePoi = null; });
      });
    });

    // Block Phaser canvas input while an overlay is open
    const canvas = document.getElementById('hub-canvas');
    this.eventBus.openScreen$.subscribe(() => {
      if (canvas) canvas.style.pointerEvents = 'none';
    });
    this.eventBus.closeScreen$.subscribe(() => {
      if (canvas) canvas.style.pointerEvents = '';
    });
  }

  ngOnDestroy(): void {
    if (this.game) {
      this.game.destroy(true);
      this.game = null;
    }
  }

  // Screens that open as overlay over the hub canvas.
  // All others navigate via router (full-page experience).
  private readonly OVERLAY_SCREENS = new Set(['character', 'village']);

  /** Converts a route path to a screen name. Overlay screens use EventBus; others navigate. */
  private handleNavigateTo(route: string): void {
    const screen = route.startsWith('/') ? route.slice(1) : route;
    if (this.OVERLAY_SCREENS.has(screen)) {
      this.eventBus.openScreen$.next({ screen });
    } else {
      this.router.navigate([route]);
    }
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}
