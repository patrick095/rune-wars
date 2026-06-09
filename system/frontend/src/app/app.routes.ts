import { Routes } from '@angular/router';
import { authGuard } from './shared/guards/auth.guard';
import { characterGuard } from './shared/guards/character.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'character-select',
    canActivate: [authGuard],
    loadComponent: () => import('./character-select/character-select.component').then(m => m.CharacterSelectComponent)
  },
  // Single-screen game route — all post-login navigation stays at /game
  // Screen is controlled by GameNavigatorService signal, not the router
  {
    path: 'game',
    canActivate: [authGuard, characterGuard],
    children: []
  },
  // Legacy routes — redirect to /game; screens are swapped via GameNavigatorService.goTo()
  { path: 'hub', redirectTo: '/game', pathMatch: 'full' },
  { path: 'playground', redirectTo: '/game', pathMatch: 'full' },
  { path: 'pvp', redirectTo: '/game', pathMatch: 'full' },
  { path: 'character', redirectTo: '/game', pathMatch: 'full' },
  { path: 'academy', redirectTo: '/game', pathMatch: 'full' },
  { path: 'dungeon', redirectTo: '/game', pathMatch: 'full' },
  { path: 'craft', redirectTo: '/game', pathMatch: 'full' },
  { path: 'upgrade', redirectTo: '/game', pathMatch: 'full' },
  { path: 'market', redirectTo: '/game', pathMatch: 'full' },
  { path: 'guild', redirectTo: '/game', pathMatch: 'full' },
  { path: 'rankings', redirectTo: '/game', pathMatch: 'full' },
  { path: 'dungeon-floors', redirectTo: '/game', pathMatch: 'full' }
];
