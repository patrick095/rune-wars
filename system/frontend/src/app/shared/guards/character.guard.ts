import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ActiveCharacterService } from '../services/active-character.service';
import { ApiService } from '../services/api.service';

export const characterGuard: CanActivateFn = async (route, state) => {
  const active = inject(ActiveCharacterService);
  const api = inject(ApiService);
  const router = inject(Router);

  if (active.character) return true;

  const loaded = await active.loadFromStorage(api);
  if (loaded) return true;

  return router.createUrlTree(['/character-select']);
};
