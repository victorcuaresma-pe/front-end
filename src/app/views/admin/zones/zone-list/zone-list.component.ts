import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

import { ZoneFormComponent } from '../zone-form/zone-form.component';
import { ApiResponse, Zone, ZoneService } from '../../../../core/services/zone.service';
@Component({ // Decorador que define metadatos del componente
  selector: 'app-zone-list', // Nombre del componente para usar en HTML
  standalone: true, // Indica que este componente no depende de un módulo
  imports: [ // Importa otros módulos/componentes necesarios
    CommonModule, // Módulo común de Angular (ngIf, ngFor, etc.)
    ZoneFormComponent // Componente de formulario de zona
  ],
  templateUrl: './zone-list.component.html', // Ruta al archivo de plantilla HTML
  styleUrls: ['./zone-list.component.css'] // Ruta al archivo de estilos CSS
})

export class ZoneListComponent implements OnInit { // Define la clase del componente y su implementación del ciclo OnInit
  zones: Zone[] = []; // Arreglo para almacenar las zonas obtenidas
  mostrarModal = false; // Controla la visibilidad del modal
  editMode = false; // Indica si se está editando una zona
  editingZoneId?: string; // Almacena el ID de la zona que se está editando
  mostrarInactivas = false; // Controla si se muestran zonas inactivas

  constructor(private zoneService: ZoneService) {} // Inyecta el servicio que maneja zonas

  ngOnInit(): void { // Método que se ejecuta al inicializar el componente
    this.loadZones(); // Carga la lista de zonas
  }

  loadZones(): void { // Método para cargar zonas según el estado activo/inactivo
    if (this.mostrarInactivas) { // Si se deben mostrar zonas inactivas
      this.zoneService.getAllInactive().subscribe({ // Llama al servicio para obtener zonas inactivas
        next: (resp: ApiResponse<Zone[]>) => this.zones = resp.data, // Asigna los datos de respuesta a la lista de zonas
        error: err => console.error('Error al obtener zonas inactivas:', err) // Muestra error en consola si falla
      });
    } else { // Si se deben mostrar zonas activas
      this.zoneService.getAllActive().subscribe({ // Llama al servicio para obtener zonas activas
        next: (resp: ApiResponse<Zone[]>) => this.zones = resp.data, // Asigna los datos de respuesta a la lista de zonas
        error: err => console.error('Error al obtener zonas activas:', err) // Muestra error en consola si falla
      });
    }
  }

alternarZonas(): void { // Cambia entre mostrar zonas activas e inactivas
  this.mostrarInactivas = !this.mostrarInactivas; // Invierte el valor de mostrarInactivas
  this.loadZones(); // Recarga la lista de zonas según el nuevo estado
}

abrirModal(): void { // Abre el modal para crear una nueva zona
  this.editMode = false; // Desactiva el modo edición
  this.editingZoneId = undefined; // Limpia el ID de edición
  this.mostrarModal = true; // Muestra el modal
}

cerrarModal(): void { // Cierra el modal
  this.mostrarModal = false; // Oculta el modal
}

recargarLista(): void { // Recarga la lista de zonas y cierra el modal
  this.cerrarModal(); // Cierra el modal
  this.loadZones(); // Vuelve a cargar la lista de zonas
}

cargarZonas(): void { // Alternativa a loadZones con manejo de errores personalizados
  const request = this.mostrarInactivas // Selecciona el tipo de solicitud según el estado
    ? this.zoneService.getAllInactive() // Si se muestran inactivas, obtiene zonas inactivas
    : this.zoneService.getAllActive(); // Si no, obtiene zonas activas

  request.subscribe({ // Se suscribe a la respuesta del servicio
    next: (response) => { // Si la respuesta es exitosa
      if (response.status) { // Verifica si la respuesta indica éxito
        this.zones = response.data; // Asigna los datos recibidos
      } else { // Si la respuesta indica fallo lógico
        this.zones = []; // Limpia la lista de zonas
        console.error('Error al obtener zonas:', response.error?.details); // Muestra error en consola
      }
    },
    error: (err) => { // Si ocurre un error en la solicitud
      this.zones = []; // Limpia la lista de zonas
      console.error('Error de conexión:', err); // Muestra error de conexión en consola
    }
  });
}

  onEdit(zone: Zone): void { // Inicia el modo edición para una zona específica
  this.editMode = true; // Activa el modo edición
  this.editingZoneId = zone.zoneId; // Guarda el ID de la zona que se va a editar
  this.mostrarModal = true; // Muestra el modal con el formulario
}

onDelete(zone: Zone): void { // Confirma y elimina lógicamente una zona
  Swal.fire({ // Muestra alerta de confirmación con SweetAlert2
    title: '¿Estás seguro?', // Título de la alerta
    text: `¿Deseas eliminar la zona "${zone.name}"?`, // Mensaje con el nombre de la zona
    icon: 'warning', // Icono de advertencia
    showCancelButton: true, // Muestra botón de cancelar
    confirmButtonText: 'Sí, eliminar', // Texto del botón de confirmación
    cancelButtonText: 'No, cancelar' // Texto del botón de cancelar
  }).then(result => { // Maneja la respuesta del usuario
    if (result.isConfirmed) { // Si el usuario confirma
      this.zoneService.delete(zone.zoneId!).subscribe({ // Llama al servicio para eliminar la zona
        next: () => { // Si la eliminación es exitosa
          Swal.fire('Eliminada', 'La zona ha sido eliminada correctamente.', 'success'); // Muestra mensaje de éxito
          this.recargarLista(); // Recarga la lista de zonas
        },
        error: err => { // Si ocurre un error en la eliminación
          console.error('Error eliminando zona:', err); // Muestra el error en consola
          Swal.fire('Error', 'No se pudo eliminar la zona.', 'error'); // Muestra mensaje de error
        }
      });
    }
  });
}

onActivate(zone: Zone): void { // Confirma y reactiva una zona inactiva
  Swal.fire({ // Muestra alerta de confirmación para reactivar
    title: '¿Reactivar zona?', // Título de la alerta
    text: `¿Deseas reactivar la zona "${zone.name}"?`, // Mensaje con el nombre de la zona
    icon: 'question', // Icono de pregunta
    showCancelButton: true, // Muestra botón de cancelar
    confirmButtonText: 'Sí, reactivar', // Texto del botón de confirmación
    cancelButtonText: 'No' // Texto del botón de cancelar
  }).then(result => { // Maneja la respuesta del usuario
    if (result.isConfirmed) { // Si el usuario confirma
      this.zoneService.activate(zone.zoneId!).subscribe({ // Llama al servicio para reactivar la zona
        next: () => { // Si la reactivación es exitosa
          Swal.fire('Reactivada', 'La zona ha sido activada nuevamente.', 'success'); // Muestra mensaje de éxito
          this.recargarLista(); // Recarga la lista de zonas
        },
        error: err => { // Si ocurre un error en la reactivación
          console.error('Error reactivando zona:', err); // Muestra el error en consola
          Swal.fire('Error', 'No se pudo reactivar la zona.', 'error'); // Muestra mensaje de error
        }
      });
    }
  });
}

formatStatus(status?: string): string { // Devuelve un texto corto para el estado
  return status === 'ACTIVE' ? 'A' : 'I'; // Devuelve 'A' si es activo, 'I' si no
}

formatDate(dateRecord?: string): string { // Formatea la fecha en formato local
  if (!dateRecord) return ''; // Si no hay fecha, devuelve cadena vacía
  return new Date(dateRecord).toLocaleDateString('es-PE'); // Convierte y da formato a la fecha (ej: 28/05/2025)
}
}
