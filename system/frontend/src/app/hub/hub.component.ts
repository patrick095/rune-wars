import { AfterViewInit, Component, HostListener, OnDestroy, NgZone, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import Phaser from 'phaser';
import { HubScene } from '../../game/scenes/hub.scene';
import { HUB_POIS, HubPointOfInterest } from '../../game/hub/hub-poi';
import { GameEventBusService } from '../shared/services/game-event-bus.service';
import { ActiveCharacterService } from '../shared/services/active-character.service';
import { GameNavigatorService, GameScreen } from '../shared/services/game-navigator.service';
import { AuthService } from '../shared/services/auth.service';

@Component({
  selector: 'app-hub',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hub.component.html',
  styleUrl: './hub.component.scss',
})
export class HubComponent implements AfterViewInit, OnDestroy {
  private game: Phaser.Game | null = null;
  private activeCharacterService = inject(ActiveCharacterService);
  private authService = inject(AuthService);

  isMobile = false;
  activePoi: HubPointOfInterest | null = null;
  dockPois = HUB_POIS;

  get activeCharacterName(): string {
    return this.activeCharacterService.character?.name ?? 'Aventureiro';
  }

  get activeCharacterGold(): number {
    return this.activeCharacterService.character?.gold ?? 0;
  }

  private navigator = inject(GameNavigatorService);

  /** Maps legacy route paths to GameScreen values for single-screen navigation */
  private readonly ROUTE_TO_SCREEN: Partial<Record<string, GameScreen>> = {
    academy:    'academy',
    dungeon:    'dungeon-lobby',
    'dungeon-lobby': 'dungeon-lobby',
    pvp:        'pvp-lobby',
    craft:      'ferreiro',
    upgrade:    'ferreiro',
    ferreiro:   'ferreiro',
    market:     'market',
    guild:      'guild',
    rankings:   'rankings',
    playground: 'playground',
    character:  'character',
  };

  constructor(
    private router: Router,
    private ngZone: NgZone,
    private eventBus: GameEventBusService,
  ) {}

  ngAfterViewInit(): void {
    this.isMobile = window.innerWidth <= 768;
    const canvasHost = document.getElementById('hub-canvas');
    const frame = document.getElementById('game-frame');
    const width = canvasHost?.clientWidth || frame?.clientWidth || window.innerWidth;
    const height = canvasHost?.clientHeight || frame?.clientHeight || window.innerHeight;

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

  /** Converts a route path to a GameScreen and navigates via GameNavigatorService. */
  private handleNavigateTo(route: string): void {
    const path = route.startsWith('/') ? route.slice(1) : route;
    const gameScreen = this.ROUTE_TO_SCREEN[path];
    if (gameScreen) {
      this.navigator.goTo(gameScreen);
    } else {
      // Fallback for auth-level routes (e.g. character-select)
      this.router.navigate([route]);
    }
  }

  navigateTo(route: string): void {
    const path = route.startsWith('/') ? route.slice(1) : route;
    const gameScreen = this.ROUTE_TO_SCREEN[path];
    if (gameScreen) {
      this.navigator.goTo(gameScreen);
    } else {
      this.router.navigate([route]);
    }
  }

  logout(): void {
    this.authService.logout();
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if ((event.key === 'i' || event.key === 'I') && this.authService.isAdmin()) {
      if (this.navigator.showAdminPanel()) {
        this.navigator.closeAdminPanel();
      } else {
        this.navigator.openAdminPanel();
      }
    }
  }
}
