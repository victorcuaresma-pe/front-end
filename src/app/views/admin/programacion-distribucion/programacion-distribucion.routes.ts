import { Routes } from '@angular/router';
import { ProgramacionDistribucionListComponent } from './programacion-distribucion-list/programacion-distribucion-list.component';

export const PROGRAMACION_DISTRIBUCION_ROUTES: Routes = [
  { path: '', component: ProgramacionDistribucionListComponent },
  {
    path: 'crear',
    loadComponent: () =>
      import('./programacion-distribucion-form/programacion-distribucion-form.component').then(m => m.ProgramacionDistribucionFormComponent)
  },
  {
    path: 'editar/:id',
    loadComponent: () =>
      import('./programacion-distribucion-form/programacion-distribucion-form.component').then(m => m.ProgramacionDistribucionFormComponent)
  }
];
