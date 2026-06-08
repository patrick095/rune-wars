import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-dungeon-result',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dungeon-result.component.html',
})
export class DungeonResultComponent {
  @Input() status: 'victory' | 'defeat' = 'victory';
  @Input() xp = 0;
  @Input() gold = 0;

  @Output() restart = new EventEmitter<void>();
  @Output() leave = new EventEmitter<void>();
}
