import { Routes } from '@angular/router';
import { RateListComponent } from './rate-list/rate-list.component';


export const STREET_ROUTES: Routes = [
  { path: '', component: RateListComponent },
  {
    path: 'crear',
    loadComponent: () =>
      import('./rate-form/rate-form.component').then(m => m.RateFormComponent)
  },
  {
    path: 'editar/:id',
    loadComponent: () =>
      import('./rate-form/rate-form.component').then(m => m.RateFormComponent)
  }
];
