import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: 'modal-open', redirectTo: '', pathMatch: 'full' },

  // Wildcard fallback (optional, for any unknown route)
  { path: '**', redirectTo: '' },
];
