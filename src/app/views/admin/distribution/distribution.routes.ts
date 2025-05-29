import { Routes } from '@angular/router';
import { ProgramacionDistribucionListComponent } from './distribution-list/distribution-list.component';

export const PROGRAMACION_DISTRIBUCION_ROUTES: Routes = [
  { path: '', component: ProgramacionDistribucionListComponent },
  {
    path: 'crear',
    loadComponent: () =>
      import('./distribution-form/distribution-form.component').then(m => m.ProgramacionDistribucionFormComponent)
  },
  {
    path: 'editar/:id',
    loadComponent: () =>
      import('./distribution-form/distribution-form.component').then(m => m.ProgramacionDistribucionFormComponent)
  }
];
