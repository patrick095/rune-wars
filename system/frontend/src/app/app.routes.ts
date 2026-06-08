import { Routes } from '@angular/router';
import { authGuard } from './shared/guards/auth.guard';

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
    path: 'playground',
    canActivate: [authGuard],
    loadComponent: () => import('./playground/playground.component')
      .then(m => m.PlaygroundComponent)
  },
  {
    path: 'character',
    canActivate: [authGuard],
    loadComponent: () => import('./character/character.component')
      .then(m => m.CharacterComponent)
  },
  {
    path: 'academy',
    canActivate: [authGuard],
    loadComponent: () => import('./academy/academy.component')
      .then(m => m.AcademyComponent)
  },
  {
    path: 'dungeon',
    canActivate: [authGuard],
    loadComponent: () => import('./dungeon/dungeon.component')
      .then(m => m.DungeonComponent)
  },
  {
    path: 'pvp',
    canActivate: [authGuard],
    loadComponent: () => import('./pvp/pvp.component').then(m => m.PvpComponent)
  }
];
