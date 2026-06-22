import { Component, Output, EventEmitter } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { WeaponSystem } from "../shared/game-core/weapon-system";
import { WeaponDefinition } from "../shared/game-core/weapon-definition";
import { AcademyConfig, ACADEMY_MAPS } from "./academy-config";

@Component({
    selector: "app-academy-config-panel",
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: "./academy-config-panel.component.html",
    styleUrls: ["./academy-config-panel.component.scss"],
})
export class AcademyConfigPanelComponent {
    @Output() startTraining = new EventEmitter<AcademyConfig>();
    @Output() leave = new EventEmitter<void>();

    maps = ACADEMY_MAPS;
    weapons: WeaponDefinition[] = [];
    difficulties = ["easy", "normal", "hard"];

    selectedMapId = ACADEMY_MAPS[0].id;
    selectedWeaponId = "cannon";
    selectedTargetType: "fixed" | "mobile" | "dummy_player" = "fixed";
    selectedDifficulty: "easy" | "normal" | "hard" = "normal";

    constructor() {
        this.weapons = new WeaponSystem().getAll();
        if (this.weapons.length > 0) {
            this.selectedWeaponId = this.weapons[0].id;
        }
    }

    onTrain(): void {
        this.startTraining.emit({
            mapId: this.selectedMapId,
            weaponId: this.selectedWeaponId,
            targetType: this.selectedTargetType,
            difficulty: this.selectedDifficulty,
        });
    }

    onLeave(): void {
        this.leave.emit();
    }
}
