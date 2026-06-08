import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../shared/services/api.service';

interface Listing {
  id: string;
  item_base_id: string;
  item_instance_id: string;
  item_rarity: string;
  price: number;
  seller_id: string;
  created_at: string;
}

interface Transaction {
  id: string;
  item_base_id: string;
  price: number;
  fee: number;
  net_price: number;
  buyer_id: string;
  seller_id: string;
  created_at: string;
}

type Tab = 'search' | 'my-listings' | 'create' | 'history';

@Component({
  selector: 'app-market',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card">
      <h2>Mercado</h2>

      <div class="tabs">
        <button class="tab" [class.active]="activeTab === 'search'" (click)="setTab('search')">Buscar</button>
        <button class="tab" [class.active]="activeTab === 'my-listings'" (click)="setTab('my-listings')">Minhas Listagens</button>
        <button class="tab" [class.active]="activeTab === 'create'" (click)="setTab('create')">Listar Item</button>
        <button class="tab" [class.active]="activeTab === 'history'" (click)="setTab('history')">Histórico</button>
      </div>

      <!-- BUSCAR -->
      <div *ngIf="activeTab === 'search'">
        <div class="row" style="margin-bottom: 1rem;">
          <div>
            <label>Item Base ID</label><br>
            <input class="input" [(ngModel)]="searchFilters.itemBaseId" placeholder="Ex: sword_01">
          </div>
          <div>
            <label>Raridade</label><br>
            <select class="input" [(ngModel)]="searchFilters.rarity">
              <option value="">Todas</option>
              <option value="common">Common</option>
              <option value="uncommon">Uncommon</option>
              <option value="rare">Rare</option>
              <option value="epic">Epic</option>
              <option value="legendary">Legendary</option>
            </select>
          </div>
          <div>
            <label>Preço Mín.</label><br>
            <input class="input" type="number" [(ngModel)]="searchFilters.minPrice" placeholder="0">
          </div>
          <div>
            <label>Preço Máx.</label><br>
            <input class="input" type="number" [(ngModel)]="searchFilters.maxPrice" placeholder="99999">
          </div>
          <div style="align-self: flex-end;">
            <button class="btn" (click)="searchListings()">Buscar</button>
          </div>
        </div>

        <div *ngIf="searchLoading" style="color: #a0a0c0;">Buscando...</div>
        <div *ngIf="searchError" class="error">{{ searchError }}</div>

        <table *ngIf="listings.length > 0">
          <thead>
            <tr>
              <th>Item</th>
              <th>Raridade</th>
              <th>Preço</th>
              <th>Vendedor</th>
              <th>Ação</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let l of listings">
              <td style="font-family: monospace; font-size: 0.8rem;">{{ l.item_base_id }}</td>
              <td><span [class]="'tag tag-' + (l.item_rarity || 'common').toLowerCase()">{{ l.item_rarity }}</span></td>
              <td style="color: #c0a060;">{{ l.price | number }} G</td>
              <td style="font-size: 0.75rem; color: #a0a0c0;">{{ l.seller_id }}</td>
              <td>
                <button class="btn-sm" (click)="buyListing(l)">Comprar</button>
              </td>
            </tr>
          </tbody>
        </table>
        <div *ngIf="!searchLoading && listings.length === 0 && searchDone" style="color: #a0a0c0; text-align: center; padding: 1rem;">
          Nenhuma listagem encontrada.
        </div>

        <div *ngIf="buyMessage" class="card" style="margin-top: 0.5rem; padding: 0.75rem;" [class.success]="buySuccess" [class.error]="!buySuccess">
          {{ buyMessage }}
        </div>
      </div>

      <!-- MINHAS LISTAGENS -->
      <div *ngIf="activeTab === 'my-listings'">
        <div class="row" style="margin-bottom: 1rem;">
          <div>
            <label>Seller ID</label><br>
            <input class="input" [(ngModel)]="sellerId" placeholder="Seu character ID">
          </div>
          <div style="align-self: flex-end;">
            <button class="btn" (click)="loadMyListings()">Carregar</button>
          </div>
        </div>

        <div *ngIf="myListingsLoading" style="color: #a0a0c0;">Carregando...</div>
        <div *ngIf="myListingsError" class="error">{{ myListingsError }}</div>

        <table *ngIf="myListings.length > 0">
          <thead>
            <tr>
              <th>Item</th>
              <th>Raridade</th>
              <th>Preço</th>
              <th>Data</th>
              <th>Ação</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let l of myListings">
              <td style="font-family: monospace; font-size: 0.8rem;">{{ l.item_base_id }}</td>
              <td><span [class]="'tag tag-' + (l.item_rarity || 'common').toLowerCase()">{{ l.item_rarity }}</span></td>
              <td style="color: #c0a060;">{{ l.price | number }} G</td>
              <td style="font-size: 0.75rem; color: #a0a0c0;">{{ l.created_at | date:'dd/MM/yy HH:mm' }}</td>
              <td>
                <button class="btn-sm" (click)="cancelListing(l.id)">Cancelar</button>
              </td>
            </tr>
          </tbody>
        </table>
        <div *ngIf="!myListingsLoading && myListings.length === 0 && myListingsDone" style="color: #a0a0c0; text-align: center; padding: 1rem;">
          Nenhuma listagem ativa.
        </div>

        <div *ngIf="cancelMessage" class="card" style="margin-top: 0.5rem; padding: 0.75rem;" [class.success]="cancelSuccess" [class.error]="!cancelSuccess">
          {{ cancelMessage }}
        </div>
      </div>

      <!-- CRIAR LISTAGEM -->
      <div *ngIf="activeTab === 'create'">
        <div class="row">
          <div>
            <label>Seller ID (Character)</label><br>
            <input class="input" [(ngModel)]="createForm.sellerId" placeholder="Seu character ID">
          </div>
          <div>
            <label>Item Instance ID</label><br>
            <input class="input" [(ngModel)]="createForm.itemInstanceId" placeholder="ID da instância">
          </div>
        </div>
        <div class="row">
          <div>
            <label>Item Base ID</label><br>
            <input class="input" [(ngModel)]="createForm.itemBaseId" placeholder="Ex: sword_01">
          </div>
          <div>
            <label>Raridade</label><br>
            <select class="input" [(ngModel)]="createForm.itemRarity">
              <option value="">Selecionar</option>
              <option value="common">Common</option>
              <option value="uncommon">Uncommon</option>
              <option value="rare">Rare</option>
              <option value="epic">Epic</option>
              <option value="legendary">Legendary</option>
            </select>
          </div>
          <div>
            <label>Preço (Gold)</label><br>
            <input class="input" type="number" [(ngModel)]="createForm.price" placeholder="0" min="1">
          </div>
        </div>
        <div style="margin-top: 0.5rem;">
          <button class="btn" (click)="createListing()" [disabled]="creating">
            {{ creating ? 'Listando...' : 'Criar Listagem' }}
          </button>
        </div>
        <div *ngIf="createMessage" class="card" style="margin-top: 0.5rem; padding: 0.75rem;" [class.success]="createSuccess" [class.error]="!createSuccess">
          {{ createMessage }}
        </div>
      </div>

      <!-- HISTÓRICO -->
      <div *ngIf="activeTab === 'history'">
        <div class="row" style="margin-bottom: 1rem;">
          <div>
            <label>Character ID</label><br>
            <input class="input" [(ngModel)]="historyCharacterId" placeholder="Seu character ID">
          </div>
          <div style="align-self: flex-end;">
            <button class="btn" (click)="loadHistory()">Carregar</button>
          </div>
        </div>

        <div *ngIf="historyLoading" style="color: #a0a0c0;">Carregando...</div>
        <div *ngIf="historyError" class="error">{{ historyError }}</div>

        <table *ngIf="transactions.length > 0">
          <thead>
            <tr>
              <th>Item</th>
              <th>Preço</th>
              <th>Taxa</th>
              <th>Líquido</th>
              <th>Comprador</th>
              <th>Vendedor</th>
              <th>Data</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let t of transactions">
              <td style="font-family: monospace; font-size: 0.8rem;">{{ t.item_base_id }}</td>
              <td style="color: #c0a060;">{{ t.price | number }} G</td>
              <td style="color: #e94560;">-{{ t.fee | number }} G</td>
              <td style="color: #40e060;">{{ t.net_price | number }} G</td>
              <td style="font-size: 0.75rem; color: #a0a0c0;">{{ t.buyer_id }}</td>
              <td style="font-size: 0.75rem; color: #a0a0c0;">{{ t.seller_id }}</td>
              <td style="font-size: 0.75rem; color: #a0a0c0;">{{ t.created_at | date:'dd/MM/yy HH:mm' }}</td>
            </tr>
          </tbody>
        </table>
        <div *ngIf="!historyLoading && transactions.length === 0 && historyDone" style="color: #a0a0c0; text-align: center; padding: 1rem;">
          Nenhuma transação encontrada.
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; min-height: 100vh; background: #1a1a2e; color: #e0e0e0; padding: 1rem; }
    .card { background: #16213e; border: 1px solid #0f3460; border-radius: 8px; padding: 1.5rem; margin-bottom: 1rem; }
    h2 { color: #e94560; margin: 0 0 1rem; }
    .input { background: #0f3460; border: 1px solid #1a4a7a; border-radius: 4px; color: #e0e0e0; padding: 0.4rem 0.6rem; font-size: 0.9rem; }
    .btn { background: #e94560; border: none; border-radius: 4px; color: white; padding: 0.5rem 1rem; cursor: pointer; font-size: 0.9rem; }
    .btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-sm { background: #0f3460; border: 1px solid #e94560; border-radius: 4px; color: #e94560; padding: 0.25rem 0.6rem; cursor: pointer; font-size: 0.8rem; }
    .tag { display: inline-block; padding: 0.1rem 0.4rem; border-radius: 3px; font-size: 0.75rem; }
    .tag-common { background: #334; color: #aaa; }
    .tag-uncommon { background: #133; color: #6ef; }
    .tag-rare { background: #113; color: #66f; }
    .tag-epic { background: #313; color: #f6f; }
    .tag-legendary { background: #430; color: #fa0; }
    .tabs { display: flex; gap: 0.5rem; margin-bottom: 1rem; flex-wrap: wrap; }
    .tab { background: #0f3460; border: 1px solid #1a4a7a; border-radius: 4px; color: #a0a0c0; padding: 0.4rem 0.8rem; cursor: pointer; font-size: 0.875rem; }
    .tab.active { border-color: #e94560; color: #e94560; }
    table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
    th { color: #a0a0c0; text-align: left; padding: 0.4rem; border-bottom: 1px solid #0f3460; }
    td { padding: 0.4rem; border-bottom: 1px solid #0a1a30; }
    .success { color: #40e060; }
    .error { color: #e94560; }
    .row { display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap; margin-bottom: 0.5rem; }
    label { font-size: 0.8rem; color: #a0a0c0; }
  `]
})
export class MarketComponent implements OnInit {
  activeTab: Tab = 'search';

  // Search
  searchFilters = { itemBaseId: '', rarity: '', minPrice: null as number | null, maxPrice: null as number | null };
  listings: Listing[] = [];
  searchLoading = false;
  searchError = '';
  searchDone = false;
  buyMessage = '';
  buySuccess = false;

  // My Listings
  sellerId = '';
  myListings: Listing[] = [];
  myListingsLoading = false;
  myListingsError = '';
  myListingsDone = false;
  cancelMessage = '';
  cancelSuccess = false;

  // Create
  createForm = { sellerId: '', itemInstanceId: '', itemBaseId: '', itemRarity: '', price: null as number | null };
  creating = false;
  createMessage = '';
  createSuccess = false;

  // History
  historyCharacterId = '';
  transactions: Transaction[] = [];
  historyLoading = false;
  historyError = '';
  historyDone = false;

  constructor(private api: ApiService) {}

  ngOnInit() {}

  setTab(tab: Tab) {
    this.activeTab = tab;
  }

  searchListings() {
    this.searchLoading = true;
    this.searchError = '';
    this.searchDone = false;
    this.buyMessage = '';

    const params = new URLSearchParams();
    if (this.searchFilters.itemBaseId) params.set('itemBaseId', this.searchFilters.itemBaseId);
    if (this.searchFilters.rarity) params.set('rarity', this.searchFilters.rarity);
    if (this.searchFilters.minPrice != null) params.set('minPrice', String(this.searchFilters.minPrice));
    if (this.searchFilters.maxPrice != null) params.set('maxPrice', String(this.searchFilters.maxPrice));

    const query = params.toString();
    this.api.get<Listing[]>(`/market/listings${query ? '?' + query : ''}`).subscribe({
      next: (data) => { this.listings = data; this.searchLoading = false; this.searchDone = true; },
      error: (err) => { this.searchError = err.error?.message || 'Erro ao buscar'; this.searchLoading = false; this.searchDone = true; }
    });
  }

  buyListing(listing: Listing) {
    this.buyMessage = '';
    this.api.post(`/market/listings/${listing.id}/buy`, {}).subscribe({
      next: () => {
        this.buySuccess = true;
        this.buyMessage = `Item ${listing.item_base_id} comprado com sucesso por ${listing.price} G!`;
        this.listings = this.listings.filter(l => l.id !== listing.id);
      },
      error: (err) => {
        this.buySuccess = false;
        this.buyMessage = err.error?.message || 'Erro ao comprar item';
      }
    });
  }

  loadMyListings() {
    if (!this.sellerId) return;
    this.myListingsLoading = true;
    this.myListingsError = '';
    this.myListingsDone = false;
    this.cancelMessage = '';
    this.api.get<Listing[]>(`/market/listings?sellerId=${this.sellerId}`).subscribe({
      next: (data) => { this.myListings = data; this.myListingsLoading = false; this.myListingsDone = true; },
      error: (err) => { this.myListingsError = err.error?.message || 'Erro ao carregar'; this.myListingsLoading = false; this.myListingsDone = true; }
    });
  }

  cancelListing(id: string) {
    this.cancelMessage = '';
    this.api.delete(`/market/listings/${id}`).subscribe({
      next: () => {
        this.cancelSuccess = true;
        this.cancelMessage = 'Listagem cancelada com sucesso!';
        this.myListings = this.myListings.filter(l => l.id !== id);
      },
      error: (err) => {
        this.cancelSuccess = false;
        this.cancelMessage = err.error?.message || 'Erro ao cancelar';
      }
    });
  }

  createListing() {
    if (!this.createForm.sellerId || !this.createForm.itemInstanceId || !this.createForm.itemBaseId || !this.createForm.price) return;
    this.creating = true;
    this.createMessage = '';
    this.api.post('/market/listings', {
      sellerId: this.createForm.sellerId,
      itemInstanceId: this.createForm.itemInstanceId,
      itemBaseId: this.createForm.itemBaseId,
      itemRarity: this.createForm.itemRarity,
      price: this.createForm.price
    }).subscribe({
      next: () => {
        this.createSuccess = true;
        this.createMessage = 'Item listado com sucesso!';
        this.creating = false;
        this.createForm = { sellerId: this.createForm.sellerId, itemInstanceId: '', itemBaseId: '', itemRarity: '', price: null };
      },
      error: (err) => {
        this.createSuccess = false;
        this.createMessage = err.error?.message || 'Erro ao criar listagem';
        this.creating = false;
      }
    });
  }

  loadHistory() {
    if (!this.historyCharacterId) return;
    this.historyLoading = true;
    this.historyError = '';
    this.historyDone = false;
    this.api.get<Transaction[]>(`/market/history?characterId=${this.historyCharacterId}`).subscribe({
      next: (data) => { this.transactions = data; this.historyLoading = false; this.historyDone = true; },
      error: (err) => { this.historyError = err.error?.message || 'Erro ao carregar histórico'; this.historyLoading = false; this.historyDone = true; }
    });
  }
}
