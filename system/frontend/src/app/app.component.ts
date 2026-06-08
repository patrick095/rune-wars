import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { GameEventBusService, GameScreenEvent } from './shared/services/game-event-bus.service';
import { CharacterComponent } from './character/character.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, CharacterComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  activeScreen: string | null = null;
  screenData: any = null;
  private subs = new Subscription();

  constructor(private eventBus: GameEventBusService) {}

  ngOnInit() {
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
