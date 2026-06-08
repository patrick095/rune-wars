import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface GameScreenEvent {
  screen: string;
  data?: any;
}

@Injectable({ providedIn: 'root' })
export class GameEventBusService {
  openScreen$ = new Subject<GameScreenEvent>();
  closeScreen$ = new Subject<void>();
}
