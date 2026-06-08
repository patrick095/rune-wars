import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventoryItem, EquipmentSlotType } from '../../game-core/types';

@Component({
  selector: 'app-loadout-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-backdrop" (click)="onBackdropClick($event)">
      <div class="modal-panel">
        <h2 class="modal-title">Loadout — Entrar na Partida</h2>

        <div class="equipped-list" *ngIf="equippedEntries.length > 0; else empty">
          <div class="equipped-entry" *ngFor="let entry of equippedEntries">
            <span class="slot-label">{{ slotLabel(entry.slot) }}</span>
            <span class="item-icon">{{ entry.item.icon }}</span>
            <span class="item-name">{{ entry.item.name }}</span>
          </div>
        </div>

        <ng-template #empty>
          <p class="empty-msg">Nenhum item equipado.</p>
        </ng-template>

        <div class="modal-actions">
          <button class="btn-cancel" type="button" (click)="cancel.emit()">Cancelar</button>
          <button class="btn-confirm" type="button" (click)="confirm.emit(equippedItems)">
            Confirmar e Entrar
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-panel {
      background: #1a1a2e;
      border: 2px solid #4488ff;
      border-radius: 12px;
      padding: 24px;
      min-width: 320px;
      max-width: 480px;
      width: 90%;
      color: #fff;
      font-family: monospace;
    }

    .modal-title {
      font-size: 18px;
      color: #aad4ff;
      margin: 0 0 16px;
      text-align: center;
    }

    .equipped-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 20px;
    }

    .equipped-entry {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 12px;
      background: #252545;
      border-radius: 6px;
      font-size: 14px;

      .slot-label {
        min-width: 110px;
        color: #aaa;
        font-size: 12px;
      }

      .item-icon {
        font-size: 18px;
      }

      .item-name {
        flex: 1;
        color: #fff;
      }
    }

    .empty-msg {
      text-align: center;
      color: #888;
      font-size: 14px;
      margin-bottom: 20px;
    }

    .modal-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
    }

    .btn-cancel {
      padding: 10px 20px;
      background: #333;
      color: #fff;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-family: monospace;
      font-size: 14px;

      &:hover { background: #555; }
    }

    .btn-confirm {
      padding: 10px 20px;
      background: #4488ff;
      color: #fff;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-family: monospace;
      font-size: 14px;

      &:hover { background: #2266dd; }
    }
  `],
})
export class LoadoutModalComponent {
  @Input() equippedItems: Partial<Record<EquipmentSlotType, InventoryItem>> = {};

  @Output() confirm = new EventEmitter<Partial<Record<EquipmentSlotType, InventoryItem>>>();
  @Output() cancel = new EventEmitter<void>();

  private readonly SLOT_LABELS: Record<EquipmentSlotType, string> = {
    mainHand: 'Mão Principal',
    offHand: 'Mão Secundária',
    head: 'Capacete',
    chest: 'Armadura',
    legs: 'Botas',
    accessory1: 'Anel 1',
    accessory2: 'Anel 2',
    necklace: 'Colar',
    earring: 'Brinco',
    bracelet: 'Pulseira',
  };

  get equippedEntries(): { slot: EquipmentSlotType; item: InventoryItem }[] {
    return (Object.entries(this.equippedItems) as [EquipmentSlotType, InventoryItem][])
      .filter(([, item]) => !!item)
      .map(([slot, item]) => ({ slot, item }));
  }

  slotLabel(slot: EquipmentSlotType): string {
    return this.SLOT_LABELS[slot] ?? slot;
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.cancel.emit();
    }
  }
}
