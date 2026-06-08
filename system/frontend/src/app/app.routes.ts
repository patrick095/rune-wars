import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/playground', pathMatch: 'full' },
  {
    path: 'playground',
    loadComponent: () => import('./playground/playground.component')
      .then(m => m.PlaygroundComponent)
  },
  {
    path: 'character',
    loadComponent: () => import('./character/character.component')
      .then(m => m.CharacterComponent)
  },
  {
    path: 'academy',
    loadComponent: () => import('./academy/academy.component')
      .then(m => m.AcademyComponent)
  }
];
