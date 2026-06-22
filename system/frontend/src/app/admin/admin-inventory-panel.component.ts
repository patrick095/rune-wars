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
import { getEnhancementStoneIcon } from "../shared/game-core/item-display";
import { ItemRarity } from "../shared/game-core/rarity";
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
    upgrade_level?: number;
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
        "material",
    ];
    selectedCategory: ItemCategory = "weapon";
    filteredItems: { id: string; name: string }[] = [];
    selectedItemId = "";
    itemQuantity = 1;
    selectedRarity: ItemRarity = "common";
    itemUpgradeLevel = 0;
    rarities: ItemRarity[] = ["common", "uncommon", "rare", "heroic"];
    addingItem = false;

    // Add gold form
    goldAmount = 100;
    addingGold = false;

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
                    rarity: this.selectedRarity,
                    quantity: this.itemQuantity,
                    upgrade_level: this.itemUpgradeLevel,
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

    addGold(): void {
        if (!this.selectedCharacter || this.goldAmount < 1) return;
        this.addingGold = true;
        this.http
            .post(
                `${this.API}/admin/characters/${this.selectedCharacter.id}/gold/add`,
                { amount: this.goldAmount },
            )
            .subscribe({
                next: () => {
                    this.addingGold = false;
                    window.alert(`${this.goldAmount} ouro adicionado com sucesso!`);
                },
                error: () => {
                    this.addingGold = false;
                    window.alert("Erro ao adicionar ouro.");
                },
            });
    }

    getItemName(itemBaseId: string): string {
        return ITEM_CATALOG[itemBaseId]?.name ?? itemBaseId;
    }

    getItemIconPath(item: AdminInventoryItem): string {
        if (item.item_base_id === "enhancement_stone") {
            return getEnhancementStoneIcon(item.upgrade_level ?? 0);
        }
        return ITEM_CATALOG[item.item_base_id]?.iconPath ?? '';
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
