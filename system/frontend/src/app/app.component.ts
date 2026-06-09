import { Component, OnInit, OnDestroy, HostListener, effect, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { GameEventBusService, GameScreenEvent } from './shared/services/game-event-bus.service';
import { GameNavigatorService } from './shared/services/game-navigator.service';
import { CharacterComponent } from './character/character.component';
import { HubComponent } from './hub/hub.component';
import { PlaygroundComponent } from './playground/playground.component';
import { PvpComponent } from './pvp/pvp.component';
import { PvpLobbyComponent } from './pvp/pvp-lobby/pvp-lobby.component';
import { PvpRoomComponent } from './pvp/pvp-room/pvp-room.component';
import { BattleHostComponent } from './battle/battle-host.component';
import { DungeonComponent } from './dungeon/dungeon.component';
import { AcademyComponent } from './academy/academy.component';
import { CraftComponent } from './craft/craft.component';
import { UpgradeComponent } from './upgrade/upgrade.component';
import { MarketComponent } from './market/market.component';
import { GuildComponent } from './guild/guild.component';
import { RankingsComponent } from './rankings/rankings.component';
import { Subscription, filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    CharacterComponent,
    HubComponent,
    PlaygroundComponent,
    PvpComponent,
    PvpLobbyComponent,
    PvpRoomComponent,
    BattleHostComponent,
    DungeonComponent,
    AcademyComponent,
    CraftComponent,
    UpgradeComponent,
    MarketComponent,
    GuildComponent,
    RankingsComponent,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
// NOTE: Phaser is initialized in child components (e.g. hub.component.ts, pvp.component.ts),
// not here. Each component uses its own `parent` element ID (e.g. 'hub-canvas').
// The game-frame wrapper (#game-frame) provides the letterbox container;
// child Phaser instances fill their own canvas host elements inside the frame.
export class AppComponent implements OnInit, OnDestroy {
  activeScreen: string | null = null;
  screenData: any = null;

  /** True when the router is at /game — shows signal-based screen switcher */
  isGameRoute = false;

  /** Controls the opacity transition class */
  screenActive = signal(false);

  /** True for modal-type screens that should show the backdrop */
  isModalScreen = computed(() =>
    ['character', 'craft', 'upgrade', 'market', 'guild', 'rankings', 'academy'].includes(this.navigator.screen())
  );

  private subs = new Subscription();

  constructor(
    private eventBus: GameEventBusService,
    public navigator: GameNavigatorService,
    private router: Router,
  ) {
    // Re-trigger transition animation on screen change
    effect(() => {
      // read the signal to subscribe
      this.navigator.screen();
      this.screenActive.set(false);
      // one microtask delay so the browser can apply opacity:0 before transitioning
      Promise.resolve().then(() => this.screenActive.set(true));
    });

    // Block Phaser canvas pointer events when a non-hub screen is active
    effect(() => {
      const screen = this.navigator.screen();
      const canvas =
        document.querySelector<HTMLCanvasElement>('#hub-canvas canvas') ??
        document.querySelector<HTMLCanvasElement>('canvas');
      if (canvas) {
        canvas.style.pointerEvents = screen !== 'hub' ? 'none' : '';
      }
    });
  }

  ngOnInit() {
    // Track current route to decide between router-outlet and game @switch
    this.subs.add(
      this.router.events
        .pipe(filter(e => e instanceof NavigationEnd))
        .subscribe((e: NavigationEnd) => {
          this.isGameRoute = e.urlAfterRedirects.startsWith('/game');
        })
    );

    this.subs.add(
      this.eventBus.openScreen$.subscribe((event: GameScreenEvent) => {
        this.activeScreen = event.screen;
        this.screenData = event.data;
      })
    );
    this.subs.add(
      this.eventBus.closeScreen$.subscribe(() => this.closeOverlay())
    );
  }

  @HostListener('document:keydown.escape')
  closeOverlay() {
    this.activeScreen = null;
    this.screenData = null;
    this.eventBus.closeScreen$.next();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
