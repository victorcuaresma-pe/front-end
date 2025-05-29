import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { ApiResponse } from '../../../../core/services/zone.service';
import { Street, StreetService } from '../../../../core/services/street.service';
import { StreetFormComponent } from '../street-form/street-form.component';
@Component({
  selector: 'app-street-list', // Define el selector del componente
  standalone: true, // Es un componente autónomo (no depende de un módulo)
  imports: [
    CommonModule, // Importa funcionalidades comunes de Angular
    StreetFormComponent // Importa el formulario para crear/editar calles
  ],
  templateUrl: './street-list.component.html', // Ruta del HTML del componente
  styleUrls: ['./street-list.component.css'] // Ruta del CSS del componente
})

export class StreetListComponent implements OnInit {
  streets: Street[] = []; // Lista de calles cargadas
  mostrarModal = false; // Controla la visibilidad del modal
  editMode = false; // Indica si se está en modo edición
  editingStreetId?: string; // ID de la calle que se está editando
  mostrarInactivas = false; // Indica si se deben mostrar calles inactivas

  constructor(private streetService: StreetService) {} // Inyecta el servicio de calles

  ngOnInit(): void {
    this.loadStreets(); // Carga las calles al iniciar el componente
  }


  loadStreets(): void {
    const request = this.mostrarInactivas
      ? this.streetService.getAllInactive() // Si se muestran inactivas, llama a ese método
      : this.streetService.getAllActive(); // Si no, llama al método de calles activas

    request.subscribe({
      next: (resp: ApiResponse<Street[]>) => {
        this.streets = resp.data.map(street => ({
          ...street, // Copia los datos originales de la calle
          streetId: street.streetId || (street as any)._id || (street as any).streeId // Asegura tener un ID válido
        }));
      },
      error: (err) => {
        console.error('Error al obtener calles:', err); // Muestra error en consola
        this.streets = []; // Limpia la lista de calles si hay error
      }
    });
  }

alternarCalles(): void {
  this.mostrarInactivas = !this.mostrarInactivas; // Cambia entre mostrar activas/inactivas
  this.loadStreets(); // Recarga las calles según el nuevo estado
}

abrirModal(): void {
  this.editMode = false; // Desactiva el modo de edición (modo crear)
  this.editingStreetId = undefined; // Limpia el ID de calle en edición
  this.mostrarModal = true; // Muestra el modal de formulario
}

cerrarModal(): void {
  this.mostrarModal = false; // Oculta el modal
}

recargarLista(): void {
  this.loadStreets(); // Recarga la lista de calles desde el backend
  this.cerrarModal(); // Cierra el modal si está abierto
}

onEdit(street: Street): void {
  console.log('Calle seleccionada para editar:', street); // Log para depuración
  this.editingStreetId = street.streetId; // Guarda el ID de la calle a editar
  console.log('editingStreetId asignado:', this.editingStreetId); // Log para verificar ID asignado
  this.editMode = true; // Activa modo edición
  this.mostrarModal = true; // Muestra el modal con datos cargados
}

onDelete(street: Street): void {
  Swal.fire({ // Muestra un diálogo de confirmación
    title: '¿Estás seguro?', // Título del diálogo
    text: `¿Deseas eliminar la calle "${street.name}"?`, // Mensaje con el nombre de la calle
    icon: 'warning', // Icono de advertencia
    showCancelButton: true, // Muestra botón de cancelar
    confirmButtonText: 'Sí, eliminar', // Texto del botón confirmar
    cancelButtonText: 'No, cancelar' // Texto del botón cancelar
  }).then(result => {
    if (result.isConfirmed) { // Si el usuario confirma
      this.streetService.delete(street.streetId!).subscribe({ // Llama al servicio para eliminar
        next: () => {
          Swal.fire('Eliminada', 'La calle ha sido eliminada correctamente.', 'success'); // Muestra éxito
          this.recargarLista(); // Recarga la lista tras eliminación
        },
        error: err => {
          console.error('Error eliminando calle:', err); // Log de error
          Swal.fire('Error', 'No se pudo eliminar la calle.', 'error'); // Muestra mensaje de error
        }
      });
    }
  });
}

onActivate(street: Street): void {
  Swal.fire({
    title: '¿Reactivar calle?', // Título del diálogo de confirmación
    text: `¿Deseas reactivar la calle "${street.name}"?`, // Mensaje con nombre de calle
    icon: 'question', // Icono de pregunta
    showCancelButton: true, // Muestra botón cancelar
    confirmButtonText: 'Sí, reactivar', // Texto botón confirmar
    cancelButtonText: 'No' // Texto botón cancelar
  }).then(result => {
    if (result.isConfirmed) { // Si confirma el usuario
      this.streetService.activate(street.streetId!).subscribe({ // Llama al servicio para activar
        next: () => {
          Swal.fire('Reactivada', 'La calle ha sido activada nuevamente.', 'success'); // Mensaje éxito
          this.recargarLista(); // Recarga la lista de calles
        },
        error: err => {
          console.error('Error reactivando calle:', err); // Log de error
          Swal.fire('Error', 'No se pudo reactivar la calle.', 'error'); // Mensaje error
        }
      });
    }
  });
}

onDeactivate(street: Street): void {
  console.log('Intentando desactivar calle con ID:', street.streetId); // Log para depuración

  Swal.fire({
    title: '¿Desactivar calle?', // Título diálogo de confirmación
    text: `¿Deseas desactivar la calle "${street.name}"?`, // Mensaje con nombre de calle
    icon: 'warning', // Icono advertencia
    showCancelButton: true, // Muestra botón cancelar
    confirmButtonText: 'Sí, desactivar', // Texto botón confirmar
    cancelButtonText: 'No' // Texto botón cancelar
  }).then(result => {
    if (result.isConfirmed) { // Si confirma usuario
      this.streetService.deactivate(street.streetId!).subscribe({ // Llama al servicio para desactivar
        next: () => {
          Swal.fire('Desactivada', 'La calle ha sido desactivada correctamente.', 'success'); // Mensaje éxito
          this.recargarLista(); // Recarga la lista
        },
        error: err => {
          console.error('Error desactivando calle:', err); // Log error
          Swal.fire('Error', 'No se pudo desactivar la calle.', 'error'); // Mensaje error
        }
      });
    }
  });
}

// Método trackBy para optimizar el renderizado de listas en Angular
trackByStreetId(index: number, street: Street): string {
  if (street && street.streetId) {
    return street.streetId; // Usa streetId como identificador único para trackBy
  }
  return ''; // Devuelve vacío si no hay streetId
}

// Formatea el estado booleano a cadena 'A' o 'I'
formatStatus(status?: boolean): string {
  return status ? 'A' : 'I';
}

// Formatea fecha ISO a formato local de Perú
formatDate(date?: string): string {
  return date ? new Date(date).toLocaleDateString('es-PE') : '';
}
}