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
    path: 'hub',
    canActivate: [authGuard],
    loadComponent: () => import('./hub/hub.component').then(m => m.HubComponent)
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
  },
  { path: 'craft', canActivate: [authGuard], loadComponent: () => import('./craft/craft.component').then(m => m.CraftComponent) },
  { path: 'upgrade', canActivate: [authGuard], loadComponent: () => import('./upgrade/upgrade.component').then(m => m.UpgradeComponent) },
  { path: 'market', canActivate: [authGuard], loadComponent: () => import('./market/market.component').then(m => m.MarketComponent) },
  { path: 'guild', canActivate: [authGuard], loadComponent: () => import('./guild/guild.component').then(m => m.GuildComponent) },
  { path: 'rankings', canActivate: [authGuard], loadComponent: () => import('./rankings/rankings.component').then(m => m.RankingsComponent) },
  { path: 'dungeon-floors', canActivate: [authGuard], loadComponent: () => import('./dungeon-floors/dungeon-floors.component').then(m => m.DungeonFloorsComponent) }
];
