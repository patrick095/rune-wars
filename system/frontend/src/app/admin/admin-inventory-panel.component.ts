import {
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    SimpleChanges,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { Subject, Subscription } from "rxjs";
import { debounceTime, distinctUntilChanged } from "rxjs/operators";
import { ITEM_CATALOG, ItemCategory } from "../shared/game-core/item-catalog";
import {
    CONSUMABLE_CATALOG,
    ConsumableDefinition,
} from "../shared/services/consumable-inventory.service";
import { environment } from "../../environments/environment";

export interface AdminCharacterSummary {
    id: string;
    name: string;
    level: number;
    userId: string;
    email: string;
}

export interface AdminInventoryItem {
    id: string;
    item_base_id: string;
    rarity: string;
    quantity: number;
    equipped_slot?: string | null;
}

@Component({
    selector: "app-admin-inventory-panel",
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: "./admin-inventory-panel.component.html",
    styleUrl: "./admin-inventory-panel.component.scss",
})
export class AdminInventoryPanelComponent
    implements OnInit, OnDestroy, OnChanges
{
    @Input() visible = false;
    @Output() close = new EventEmitter<void>();

    // Search
    searchQuery = "";
    searchResults: AdminCharacterSummary[] = [];
    allCharacters: AdminCharacterSummary[] = [];
    loadingCharacters = false;

    // Selected character
    selectedCharacter: AdminCharacterSummary | null = null;
    inventory: AdminInventoryItem[] = [];
    loadingInventory = false;

    // Add item form
    itemCategories: ItemCategory[] = [
        "weapon",
        "armor",
        "head",
        "legs",
        "secondary",
        "accessory",
        "consumable",
        "material",
    ];
    selectedCategory: ItemCategory = "weapon";
    filteredItems: { id: string; name: string }[] = [];
    selectedItemId = "";
    itemQuantity = 1;
    addingItem = false;

    // Add consumable form
    consumableList: ConsumableDefinition[] = Object.values(CONSUMABLE_CATALOG);
    selectedConsumableId = "";
    consumableQuantity = 1;
    addingConsumable = false;

    private searchSubject = new Subject<string>();
    private subs = new Subscription();

    private readonly API = environment.apiUrl;

    constructor(private http: HttpClient) {}

    ngOnInit(): void {
        this.subs.add(
            this.searchSubject
                .pipe(debounceTime(300), distinctUntilChanged())
                .subscribe((query) => this.performSearch(query)),
        );

        this.onCategoryChange();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes["visible"]?.currentValue === true) {
            this.loadAllCharacters();
        }
    }

    ngOnDestroy(): void {
        this.subs.unsubscribe();
    }

    onSearchInput(): void {
        this.searchSubject.next(this.searchQuery);
    }

    private loadAllCharacters(): void {
        this.loadingCharacters = true;
        this.http
            .get<AdminCharacterSummary[]>(`${this.API}/admin/characters`)
            .subscribe({
                next: (chars) => {
                    this.allCharacters = chars;
                    this.loadingCharacters = false;
                    this.searchResults = this.filterCharacters(
                        this.searchQuery,
                    );
                },
                error: () => {
                    this.loadingCharacters = false;
                    window.alert("Erro ao carregar personagens.");
                },
            });
    }

    private performSearch(query: string): void {
        this.searchResults = this.filterCharacters(query);
    }

    private filterCharacters(query: string): AdminCharacterSummary[] {
        if (!query.trim()) return this.allCharacters;
        const lower = query.toLowerCase();
        return this.allCharacters.filter(
            (c) =>
                c.name.toLowerCase().includes(lower) ||
                c.email.toLowerCase().includes(lower),
        );
    }

    selectCharacter(char: AdminCharacterSummary): void {
        this.selectedCharacter = char;
        this.loadInventory(char.id);
    }

    private loadInventory(characterId: string): void {
        this.loadingInventory = true;
        this.inventory = [];
        this.http
            .get<
                AdminInventoryItem[]
            >(`${this.API}/admin/characters/${characterId}/inventory`)
            .subscribe({
                next: (items) => {
                    this.inventory = items;
                    this.loadingInventory = false;
                },
                error: () => {
                    this.loadingInventory = false;
                    window.alert("Erro ao carregar inventário.");
                },
            });
    }

    onCategoryChange(): void {
        this.filteredItems = Object.values(ITEM_CATALOG)
            .filter((item) => item.category === this.selectedCategory)
            .map((item) => ({ id: item.id, name: item.name }));
        this.selectedItemId = this.filteredItems[0]?.id ?? "";
    }

    addItem(): void {
        if (
            !this.selectedCharacter ||
            !this.selectedItemId ||
            this.itemQuantity < 1
        )
            return;
        this.addingItem = true;
        this.http
            .post(
                `${this.API}/admin/characters/${this.selectedCharacter.id}/inventory/add`,
                {
                    item_base_id: this.selectedItemId,
                    rarity: "common",
                    quantity: this.itemQuantity,
                },
            )
            .subscribe({
                next: () => {
                    this.addingItem = false;
                    window.alert(
                        `Item "${this.selectedItemId}" adicionado com sucesso!`,
                    );
                    this.loadInventory(this.selectedCharacter!.id);
                },
                error: () => {
                    this.addingItem = false;
                    window.alert("Erro ao adicionar item.");
                },
            });
    }

    addConsumable(): void {
        if (
            !this.selectedCharacter ||
            !this.selectedConsumableId ||
            this.consumableQuantity < 1
        )
            return;
        this.addingConsumable = true;
        this.http
            .post(
                `${this.API}/admin/characters/${this.selectedCharacter.id}/consumables/add`,
                {
                    consumableId: this.selectedConsumableId,
                    quantity: this.consumableQuantity,
                },
            )
            .subscribe({
                next: () => {
                    this.addingConsumable = false;
                    window.alert(
                        `Consumível "${this.selectedConsumableId}" adicionado com sucesso!`,
                    );
                    this.loadInventory(this.selectedCharacter!.id);
                },
                error: () => {
                    this.addingConsumable = false;
                    window.alert("Erro ao adicionar consumível.");
                },
            });
    }

    getItemName(itemBaseId: string): string {
        return ITEM_CATALOG[itemBaseId]?.name ?? itemBaseId;
    }

    getItemIconPath(itemBaseId: string): string {
        return ITEM_CATALOG[itemBaseId]?.iconPath ?? '';
    }

    removeItem(itemId: string): void {
        if (!this.selectedCharacter) return;
        this.http
            .delete(`${this.API}/admin/characters/${this.selectedCharacter.id}/inventory/${itemId}`)
            .subscribe({
                next: () => this.loadInventory(this.selectedCharacter!.id),
                error: () => window.alert('Erro ao remover item.'),
            });
    }

    onClose(): void {
        this.close.emit();
    }

    onBackdropClick(event: MouseEvent): void {
        if (
            (event.target as HTMLElement).classList.contains(
                "admin-panel-backdrop",
            )
        ) {
            this.onClose();
        }
    }
}
