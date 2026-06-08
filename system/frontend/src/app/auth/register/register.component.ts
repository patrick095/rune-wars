import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <h1>Rune Wars</h1>
        <h2>Criar Conta</h2>
        <form (ngSubmit)="submit()">
          <div class="field">
            <label>Email</label>
            <input type="email" [(ngModel)]="email" name="email" required />
          </div>
          <div class="field">
            <label>Senha</label>
            <input type="password" [(ngModel)]="password" name="password" required minlength="6" />
          </div>
          @if (error()) {
            <div class="error">{{ error() }}</div>
          }
          <button type="submit" [disabled]="loading()">
            {{ loading() ? 'Criando...' : 'Criar Conta' }}
          </button>
        </form>
        <p class="link">Já tem conta? <a routerLink="/login">Entrar</a></p>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: #1a1a2e;
    }
    .auth-card {
      background: #16213e;
      border: 1px solid #0f3460;
      border-radius: 8px;
      padding: 2rem;
      width: 100%;
      max-width: 360px;
      color: #e0e0e0;
    }
    h1 { color: #e94560; margin: 0 0 0.25rem; font-size: 1.5rem; text-align: center; }
    h2 { color: #a0a0c0; margin: 0 0 1.5rem; font-size: 1rem; text-align: center; font-weight: 400; }
    .field { margin-bottom: 1rem; }
    label { display: block; margin-bottom: 0.25rem; font-size: 0.875rem; color: #a0a0c0; }
    input {
      width: 100%; box-sizing: border-box; padding: 0.5rem 0.75rem;
      background: #0f3460; border: 1px solid #1a4a7a; border-radius: 4px;
      color: #e0e0e0; font-size: 1rem;
    }
    input:focus { outline: none; border-color: #e94560; }
    button {
      width: 100%; padding: 0.75rem; background: #e94560; border: none;
      border-radius: 4px; color: white; font-size: 1rem; cursor: pointer; margin-top: 0.5rem;
    }
    button:disabled { opacity: 0.6; cursor: not-allowed; }
    .error { color: #e94560; font-size: 0.875rem; margin-bottom: 0.5rem; }
    .link { text-align: center; margin-top: 1rem; font-size: 0.875rem; color: #a0a0c0; }
    .link a { color: #e94560; text-decoration: none; }
  `]
})
export class RegisterComponent {
  email = '';
  password = '';
  loading = signal(false);
  error = signal('');

  constructor(private auth: AuthService, private router: Router) {}

  submit() {
    if (!this.email || !this.password) return;
    this.loading.set(true);
    this.error.set('');
    this.auth.register(this.email, this.password).subscribe({
      next: () => this.router.navigate(['/playground']),
      error: (e) => {
        this.error.set(e.error?.message ?? 'Erro ao registrar');
        this.loading.set(false);
      },
    });
  }
}
