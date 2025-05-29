import { Routes } from '@angular/router'; // Importa el tipo Routes para definir rutas
import { ZoneListComponent } from './zone-list/zone-list.component'; // Importa el componente de listado de zonas

export const ZONE_ROUTES: Routes = [ // Exporta el arreglo de rutas para la gestión de zonas
  { path: '', component: ZoneListComponent }, // Ruta raíz: muestra la lista de zonas

  {
    path: 'crear', // Ruta para crear una nueva zona
    loadComponent: () => // Carga el componente del formulario de forma dinámica
      import('./zone-form/zone-form.component').then(m => m.ZoneFormComponent) // Importación perezosa del formulario
  },
  {
    path: 'editar/:id', // Ruta para editar una zona, con parámetro de ID
    loadComponent: () => // Carga el componente del formulario de forma dinámica
      import('./zone-form/zone-form.component').then(m => m.ZoneFormComponent) // Importación perezosa del mismo formulario
  }
];
