import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgramacionDistribucion, ProgramacionDistribucionService, ApiResponse } from '../../../../core/services/programacion-distribucion.service';
import { ProgramacionDistribucionFormComponent } from '../programacion-distribucion-form/programacion-distribucion-form.component';

@Component({
  selector: 'app-programacion-distribucion-list',
  standalone: true,
  imports: [CommonModule, ProgramacionDistribucionFormComponent],
  templateUrl: './programacion-distribucion-list.component.html',
  styleUrls: ['./programacion-distribucion-list.component.css']
})
export class ProgramacionDistribucionListComponent implements OnInit {
  programaciones: ProgramacionDistribucion[] = [];
  mostrarInactivas = false;
  mostrarModal = false;
  editMode = false;
  editingId: string | null = null;
  cargando = false;

  constructor(private service: ProgramacionDistribucionService) {}

  ngOnInit(): void {
    this.recargarLista();
  }

  recargarLista(): void {
    this.cargando = true;
    // Usar getAllByStatus en lugar de listarProgramaciones
    this.service.getAllByStatus(!this.mostrarInactivas).subscribe({
      next: (response: ApiResponse<ProgramacionDistribucion[]>) => {
        if (response.status) {
          this.programaciones = response.data;
        } else {
          this.programaciones = [];
          console.error('Error en respuesta:', response.error);
        }
        this.cargando = false;
      },
      error: (error: any) => {
        console.error('Error al cargar programaciones:', error);
        this.programaciones = [];
        this.cargando = false;
      }
    });
  }

  abrirModal(): void {
    this.editMode = false;
    this.editingId = null;
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.recargarLista();
  }

  onEdit(prog: ProgramacionDistribucion): void {
    this.editMode = true;
    this.editingId = prog.id;
    this.mostrarModal = true;
  }

  onDesactivate(prog: ProgramacionDistribucion): void {
    if (confirm('¿Está seguro que desea desactivar esta programación?')) {
      this.cargando = true;
      // Usar desactivate (que ya está implementado en el servicio)
      this.service.desactivate(prog.id).subscribe({
        next: () => {
          console.log('Programación desactivada exitosamente');
          this.recargarLista();
        },
        error: (error: any) => {
          console.error('Error al desactivar:', error);
          this.cargando = false;
        }
      });
    }
  }

  onActivate(prog: ProgramacionDistribucion): void {
    if (confirm('¿Está seguro que desea activar esta programación?')) {
      this.cargando = true;
      // Usar activate en lugar de activar
      this.service.activate(prog.id).subscribe({
        next: () => {
          console.log('Programación activada exitosamente');
          this.recargarLista();
        },
        error: (error: any) => {
          console.error('Error al activar:', error);
          this.cargando = false;
        }
      });
    }
  }

  onDelete(prog: ProgramacionDistribucion): void {
    if (confirm('¿Está seguro que desea eliminar esta programación? Esta acción no se puede deshacer.')) {
      this.cargando = true;
      this.service.delete(prog.id).subscribe({
        next: () => {
          console.log('Programación eliminada exitosamente');
          this.recargarLista();
        },
        error: (error: any) => {
          console.error('Error al eliminar:', error);
          this.cargando = false;
        }
      });
    }
  }

  alternarProgramaciones(): void {
    this.mostrarInactivas = !this.mostrarInactivas;
    this.recargarLista();
  }

  trackById(index: number, item: ProgramacionDistribucion): string {
    return item.id;
  }

  formatDate(date: string): string {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  }

  getEstadoClass(estado: string): string {
    switch (estado?.toUpperCase()) {
      case 'ACTIVO':
        return 'estado-activo';
      case 'INACTIVO':
        return 'estado-inactivo';
      case 'PENDIENTE':
        return 'estado-pendiente';
      default:
        return 'estado-default';
    }
  }
}