import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../shared/services/api.service';

interface Recipe {
  id: string;
  result_item_name: string;
  result_rarity: string;
  materials: { item_name: string; quantity: number }[];
}

interface CraftResult {
  success: boolean;
  item?: { name: string; rarity: string };
  message?: string;
}

interface DismantleResult {
  success: boolean;
  materials?: { item_name: string; quantity: number }[];
  message?: string;
}

@Component({
  selector: 'app-craft',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card">
      <h2>Forja & Craft</h2>

      <div class="row" style="margin-bottom: 1rem;">
        <div>
          <label>Character ID</label><br>
          <input class="input" [(ngModel)]="characterId" placeholder="ID do personagem">
        </div>
        <div>
          <label>Sorte (luck)</label><br>
          <input class="input" type="number" [(ngModel)]="luck" placeholder="0">
        </div>
      </div>

      <h3>Receitas Disponíveis</h3>
      <div *ngIf="loading" style="color: #a0a0c0;">Carregando receitas...</div>
      <div *ngIf="error" class="error">{{ error }}</div>

      <div *ngFor="let recipe of recipes" class="card" style="margin-bottom: 0.5rem; cursor: pointer;"
           [style.border-color]="selectedRecipe?.id === recipe.id ? '#e94560' : '#0f3460'"
           (click)="selectRecipe(recipe)">
        <div class="row">
          <strong>{{ recipe.result_item_name }}</strong>
          <span [class]="'tag tag-' + (recipe.result_rarity || 'common').toLowerCase()">
            {{ recipe.result_rarity || 'Common' }}
          </span>
        </div>
        <div style="font-size: 0.8rem; color: #a0a0c0; margin-top: 0.25rem;">
          Materiais:
          <span *ngFor="let mat of recipe.materials" style="margin-left: 0.5rem;">
            {{ mat.item_name }} x{{ mat.quantity }}
          </span>
        </div>
      </div>

      <div *ngIf="selectedRecipe" style="margin-top: 1rem;">
        <div style="color: #a0a0c0; font-size: 0.85rem; margin-bottom: 0.5rem;">
          Receita selecionada: <strong style="color: #e0e0e0;">{{ selectedRecipe.result_item_name }}</strong>
        </div>
        <button class="btn" (click)="craft()" [disabled]="crafting">
          {{ crafting ? 'Craftando...' : 'Craftar Item' }}
        </button>
      </div>

      <div *ngIf="craftResult" class="card" style="margin-top: 1rem;">
        <h3>Resultado do Craft</h3>
        <div [class]="craftResult.success ? 'success' : 'error'">
          {{ craftResult.success ? 'Sucesso!' : 'Falhou!' }}
        </div>
        <div *ngIf="craftResult.item" style="margin-top: 0.5rem;">
          Item obtido: <strong>{{ craftResult.item.name }}</strong>
          <span [class]="'tag tag-' + (craftResult.item.rarity || 'common').toLowerCase()" style="margin-left: 0.5rem;">
            {{ craftResult.item.rarity }}
          </span>
        </div>
        <div *ngIf="craftResult.message" style="color: #a0a0c0; font-size: 0.85rem; margin-top: 0.25rem;">
          {{ craftResult.message }}
        </div>
      </div>
    </div>

    <div class="card">
      <h3>Desmontar Item</h3>
      <div class="row">
        <div>
          <label>Item Instance ID</label><br>
          <input class="input" [(ngModel)]="dismantleItemId" placeholder="ID da instância">
        </div>
        <div>
          <label>Raridade</label><br>
          <select class="input" [(ngModel)]="dismantleRarity">
            <option value="">Selecionar</option>
            <option value="common">Common</option>
            <option value="uncommon">Uncommon</option>
            <option value="rare">Rare</option>
            <option value="epic">Epic</option>
            <option value="legendary">Legendary</option>
          </select>
        </div>
        <div style="align-self: flex-end;">
          <button class="btn" (click)="dismantle()" [disabled]="dismantling">
            {{ dismantling ? 'Desmontando...' : 'Desmontar' }}
          </button>
        </div>
      </div>

      <div *ngIf="dismantleResult" class="card" style="margin-top: 0.5rem;">
        <div [class]="dismantleResult.success ? 'success' : 'error'">
          {{ dismantleResult.success ? 'Desmontado com sucesso!' : 'Falhou!' }}
        </div>
        <div *ngIf="dismantleResult.materials" style="margin-top: 0.5rem;">
          Materiais recuperados:
          <span *ngFor="let mat of dismantleResult.materials" class="tag tag-common" style="margin-left: 0.25rem;">
            {{ mat.item_name }} x{{ mat.quantity }}
          </span>
        </div>
        <div *ngIf="dismantleResult.message" style="color: #a0a0c0; font-size: 0.85rem;">
          {{ dismantleResult.message }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; min-height: 100vh; background: #1a1a2e; color: #e0e0e0; padding: 1rem; }
    .card { background: #16213e; border: 1px solid #0f3460; border-radius: 8px; padding: 1.5rem; margin-bottom: 1rem; }
    h2 { color: #e94560; margin: 0 0 1rem; }
    h3 { color: #c0a060; margin: 0 0 0.5rem; }
    .input { background: #0f3460; border: 1px solid #1a4a7a; border-radius: 4px; color: #e0e0e0; padding: 0.4rem 0.6rem; font-size: 0.9rem; }
    .btn { background: #e94560; border: none; border-radius: 4px; color: white; padding: 0.5rem 1rem; cursor: pointer; font-size: 0.9rem; }
    .btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .tag { display: inline-block; padding: 0.1rem 0.4rem; border-radius: 3px; font-size: 0.75rem; margin-right: 0.25rem; }
    .tag-common { background: #334; color: #aaa; }
    .tag-uncommon { background: #133; color: #6ef; }
    .tag-rare { background: #113; color: #66f; }
    .tag-epic { background: #313; color: #f6f; }
    .tag-legendary { background: #430; color: #fa0; }
    .success { color: #40e060; }
    .error { color: #e94560; }
    .row { display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap; margin-bottom: 0.5rem; }
    label { font-size: 0.8rem; color: #a0a0c0; }
  `]
})
export class CraftComponent implements OnInit {
  recipes: Recipe[] = [];
  selectedRecipe: Recipe | null = null;
  characterId = '';
  luck = 0;
  loading = false;
  error = '';
  crafting = false;
  craftResult: CraftResult | null = null;

  dismantleItemId = '';
  dismantleRarity = '';
  dismantling = false;
  dismantleResult: DismantleResult | null = null;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadRecipes();
  }

  loadRecipes() {
    this.loading = true;
    this.error = '';
    this.api.get<Recipe[]>('/craft/recipes').subscribe({
      next: (data) => { this.recipes = data; this.loading = false; },
      error: (err) => { this.error = err.message || 'Erro ao carregar receitas'; this.loading = false; }
    });
  }

  selectRecipe(recipe: Recipe) {
    this.selectedRecipe = recipe;
    this.craftResult = null;
  }

  craft() {
    if (!this.selectedRecipe || !this.characterId) return;
    this.crafting = true;
    this.craftResult = null;
    this.api.post<CraftResult>('/craft/attempt', {
      characterId: this.characterId,
      recipeId: this.selectedRecipe.id,
      luck: this.luck
    }).subscribe({
      next: (data) => { this.craftResult = data; this.crafting = false; },
      error: (err) => {
        this.craftResult = { success: false, message: err.error?.message || err.message || 'Erro ao craftar' };
        this.crafting = false;
      }
    });
  }

  dismantle() {
    if (!this.dismantleItemId || !this.characterId) return;
    this.dismantling = true;
    this.dismantleResult = null;
    this.api.post<DismantleResult>('/craft/dismantle', {
      characterId: this.characterId,
      itemInstanceId: this.dismantleItemId,
      rarity: this.dismantleRarity
    }).subscribe({
      next: (data) => { this.dismantleResult = data; this.dismantling = false; },
      error: (err) => {
        this.dismantleResult = { success: false, message: err.error?.message || err.message || 'Erro ao desmontar' };
        this.dismantling = false;
      }
    });
  }
}
