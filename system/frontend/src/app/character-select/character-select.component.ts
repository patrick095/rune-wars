import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Character } from '../shared/models/character.model';
import { ActiveCharacterService } from '../shared/services/active-character.service';
import { ApiService } from '../shared/services/api.service';
import { AuthService } from '../shared/services/auth.service';

@Component({
  selector: 'app-character-select',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './character-select.component.html',
  styleUrl: './character-select.component.scss',
})
export class CharacterSelectComponent implements OnInit {
  characters: Character[] = [];
  loading = true;
  error = '';
  showCreateModal = false;
  showDeleteConfirm = false;
  characterToDelete: Character | null = null;
  creating = false;
  createError = '';

  nameForm: FormGroup = new FormGroup({
    name: new FormControl('', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(50),
      Validators.pattern('^[a-zA-Z0-9_-]+$'),
    ]),
    race: new FormControl('', [Validators.required]),
  });

  readonly races: Array<{ value: 'human' | 'dwarf' | 'elf'; label: string }> = [
    { value: 'human', label: 'Human' },
    { value: 'dwarf', label: 'Dwarf' },
    { value: 'elf', label: 'Elf' },
  ];

  constructor(
    public activeCharacter: ActiveCharacterService,
    private api: ApiService,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadCharacters();
  }

  loadCharacters(): void {
    this.loading = true;
    this.error = '';
    this.api.get<Character[]>('/characters').subscribe({
      next: (chars) => {
        this.characters = chars;
        this.loading = false;
      },
      error: () => {
        this.error = 'Falha ao carregar personagens.';
        this.loading = false;
      },
    });
  }

  selectCharacter(char: Character): void {
    this.activeCharacter.setActive(char);
    this.router.navigate(['/hub']);
  }

  openCreateModal(): void {
    this.nameForm.reset();
    this.createError = '';
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
  }

  selectRace(race: 'human' | 'dwarf' | 'elf'): void {
    this.nameForm.get('race')!.setValue(race);
    this.nameForm.get('race')!.markAsTouched();
  }

  createCharacter(): void {
    if (this.nameForm.invalid || this.creating) return;
    this.creating = true;
    this.createError = '';
    const { name, race } = this.nameForm.value;
    this.api.post<Character>('/characters', { name, race }).subscribe({
      next: (char) => {
        this.characters.push(char);
        this.creating = false;
        this.showCreateModal = false;
        this.activeCharacter.setActive(char);
        this.router.navigate(['/hub']);
      },
      error: (err) => {
        this.creating = false;
        if (err?.status === 409) {
          this.createError = 'Este nome já está em uso';
        } else {
          this.createError = 'Erro ao criar personagem. Tente novamente.';
        }
      },
    });
  }

  confirmDelete(char: Character): void {
    this.characterToDelete = char;
    this.showDeleteConfirm = true;
  }

  cancelDelete(): void {
    this.characterToDelete = null;
    this.showDeleteConfirm = false;
  }

  deleteCharacter(): void {
    if (!this.characterToDelete) return;
    const id = this.characterToDelete.id;
    this.api.delete<void>(`/characters/${id}`).subscribe({
      next: () => {
        this.characters = this.characters.filter((c) => c.id !== id);
        if (this.activeCharacter.characterId === id) {
          this.activeCharacter.clearActive();
        }
        this.characterToDelete = null;
        this.showDeleteConfirm = false;
      },
      error: () => {
        this.characterToDelete = null;
        this.showDeleteConfirm = false;
      },
    });
  }

  goToHub(): void {
    this.router.navigate(['/hub']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  get hasActiveCharacter(): boolean {
    return this.activeCharacter.character != null;
  }

  get activeCharacterName(): string {
    return this.activeCharacter.character?.name ?? '';
  }

  get canCreateMore(): boolean {
    return this.characters.length < 5;
  }

  getNameErrors(): string {
    const ctrl = this.nameForm.get('name')!;
    if (!ctrl.touched || ctrl.valid) return '';
    if (ctrl.hasError('required')) return 'Nome é obrigatório.';
    if (ctrl.hasError('minlength')) return 'Nome deve ter no mínimo 3 caracteres.';
    if (ctrl.hasError('maxlength')) return 'Nome deve ter no máximo 50 caracteres.';
    if (ctrl.hasError('pattern')) return 'Apenas letras, números, _ e - são permitidos.';
    return '';
  }
}
