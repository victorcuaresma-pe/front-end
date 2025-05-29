import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Incidencia, CalleAfectada, MaterialRequerido } from '../../../core/models/incidents';
import { IncidenciaService } from '../../../core/services/incidents.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-incidents',
  imports: [CommonModule, FormsModule],
  templateUrl: './incidents.component.html',
  styleUrl: './incidents.component.css'
})
export class IncidenciasComponent implements OnInit {
  
  incidencias: Incidencia[] = [];
  incidenciaSeleccionada: Incidencia | null = null;
  nuevaIncidencia: Incidencia = this.inicializarIncidencia();
  mostrarFormulario = false;
  modoEdicion = false;
  filtroActivo = 'todos'; // 'todos', 'activos', 'inactivos'
  loading = false;

  constructor(private incidenciaService: IncidenciaService) {}

  ngOnInit(): void {
    this.cargarIncidencias();
  }

  // Inicializar objeto incidencia vacío
  inicializarIncidencia(): Incidencia {
    return {
      id: '',
      tipoIncidencia: '',
      descripcion: '',
      zonaId: '',
      zonaNombre: '',
      callesAfectadas: [],
      fechaInicio: '',
      fechaEstimadaSolucion: '',
      fechaSolucionReal: null,
      estado: 'PENDIENTE',
      prioridad: 'MEDIA',
      reportadoPor: '',
      asignadoA: '',
      materialesRequeridos: [],
      actualizaciones: [],
      observaciones: '',
      notificado: false,
      activo: true,
      eliminado: false,
      fechaRegistro: ''
    };
  }

  // Cargar incidencias según filtro
  cargarIncidencias(): void {
    this.loading = true;

    let observable;
    switch (this.filtroActivo) {
      case 'activos':
        observable = this.incidenciaService.getAllActive();
        break;
      case 'inactivos':
        observable = this.incidenciaService.getAllInactive();
        break;
      default:
        observable = this.incidenciaService.getAll();
    }

    observable.subscribe({
      next: (response) => {
        if (response.status) {
          this.incidencias = response.data;
          this.showSuccessToast('Incidencias cargadas correctamente');
        } else {
          this.showErrorAlert('Error al cargar las incidencias');
        }
        this.loading = false;
      },
      error: (err) => {
        this.showErrorAlert('Error de conexión', err.message);
        this.loading = false;
      }
    });
  }

  // Cambiar filtro
  cambiarFiltro(filtro: string): void {
    this.filtroActivo = filtro;
    this.cargarIncidencias();
  }

  // Obtener incidencia por ID
  obtenerPorId(id: string): void {
    Swal.fire({
      title: 'Cargando...',
      text: 'Obteniendo detalles de la incidencia',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.incidenciaService.getById(id).subscribe({
      next: (response) => {
        Swal.close();
        if (response.status && response.data.length > 0) {
          this.incidenciaSeleccionada = response.data[0];
        } else {
          this.showErrorAlert('No se encontró la incidencia');
        }
      },
      error: (err) => {
        Swal.close();
        this.showErrorAlert('Error al obtener la incidencia', err.message);
      }
    });
  }

  // Mostrar formulario para nueva incidencia
  mostrarFormularioNuevo(): void {
    this.nuevaIncidencia = this.inicializarIncidencia();
    this.modoEdicion = false;
    this.mostrarFormulario = true;
  }

  // Mostrar formulario para editar incidencia
  editarIncidencia(incidencia: Incidencia): void {
    this.nuevaIncidencia = { ...incidencia };
    this.modoEdicion = true;
    this.mostrarFormulario = true;
  }

  // Crear nueva incidencia
  crearIncidencia(): void {
    Swal.fire({
      title: 'Creando incidencia...',
      text: 'Por favor espere',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.incidenciaService.create(this.nuevaIncidencia).subscribe({
      next: (response) => {
        if (response.status) {
          Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: 'Incidencia creada correctamente',
            timer: 2000,
            showConfirmButton: false
          });
          this.cargarIncidencias();
          this.cancelarFormulario();
        } else {
          this.showErrorAlert('Error al crear la incidencia');
        }
      },
      error: (err) => {
        this.showErrorAlert('Error al crear', err.message);
      }
    });
  }

  // Actualizar incidencia
  actualizarIncidencia(): void {
    if (this.nuevaIncidencia.id) {
      Swal.fire({
        title: 'Actualizando incidencia...',
        text: 'Por favor espere',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      this.incidenciaService.update(this.nuevaIncidencia.id, this.nuevaIncidencia).subscribe({
        next: (response) => {
          if (response.status) {
            Swal.fire({
              icon: 'success',
              title: '¡Actualizada!',
              text: 'Incidencia actualizada correctamente',
              timer: 2000,
              showConfirmButton: false
            });
            this.cargarIncidencias();
            this.cancelarFormulario();
          } else {
            this.showErrorAlert('Error al actualizar la incidencia');
          }
        },
        error: (err) => {
          this.showErrorAlert('Error al actualizar', err.message);
        }
      });
    }
  }

  // Eliminar lógicamente (inactivar)
  eliminarLogico(id: string): void {
    Swal.fire({
      title: '¿Está seguro?',
      text: 'Esta acción eliminará la incidencia (eliminación lógica)',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Eliminando...',
          text: 'Por favor espere',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        this.incidenciaService.deleteLogic(id).subscribe({
          next: (response) => {
            if (response.status) {
              Swal.fire({
                icon: 'success',
                title: '¡Eliminada!',
                text: 'La incidencia ha sido eliminada correctamente',
                timer: 2000,
                showConfirmButton: false
              });
              this.cargarIncidencias();
            } else {
              this.showErrorAlert('Error al eliminar la incidencia');
            }
          },
          error: (err) => {
            this.showErrorAlert('Error al eliminar', err.message);
          }
        });
      }
    });
  }

  // Activar incidencia
  activarIncidencia(id: string): void {
    Swal.fire({
      title: '¿Activar incidencia?',
      text: 'Esta incidencia volverá a estar activa',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, activar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.incidenciaService.activate(id).subscribe({
          next: (response) => {
            if (response.status) {
              this.showSuccessAlert('¡Activada!', 'La incidencia ha sido activada correctamente');
              this.cargarIncidencias();
            } else {
              this.showErrorAlert('Error al activar la incidencia');
            }
          },
          error: (err) => {
            this.showErrorAlert('Error al activar', err.message);
          }
        });
      }
    });
  }

  // Desactivar incidencia
  desactivarIncidencia(id: string): void {
    Swal.fire({
      title: '¿Desactivar incidencia?',
      text: 'Esta incidencia quedará como inactiva',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ffc107',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, desactivar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.incidenciaService.deactivate(id).subscribe({
          next: (response) => {
            if (response.status) {
              this.showSuccessAlert('¡Desactivada!', 'La incidencia ha sido desactivada correctamente');
              this.cargarIncidencias();
            } else {
              this.showErrorAlert('Error al desactivar la incidencia');
            }
          },
          error: (err) => {
            this.showErrorAlert('Error al desactivar', err.message);
          }
        });
      }
    });
  }

  // Guardar incidencia (crear o actualizar)
  guardarIncidencia(): void {
    if (this.modoEdicion) {
      this.actualizarIncidencia();
    } else {
      this.crearIncidencia();
    }
  }

  // Cancelar formulario
  cancelarFormulario(): void {
    if (this.modoEdicion || this.nuevaIncidencia.tipoIncidencia || this.nuevaIncidencia.descripcion) {
      Swal.fire({
        title: '¿Cancelar operación?',
        text: 'Se perderán los cambios no guardados',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, cancelar',
        cancelButtonText: 'Continuar editando'
      }).then((result) => {
        if (result.isConfirmed) {
          this.resetFormulario();
        }
      });
    } else {
      this.resetFormulario();
    }
  }

  // Reset del formulario
  private resetFormulario(): void {
    this.mostrarFormulario = false;
    this.nuevaIncidencia = this.inicializarIncidencia();
    this.modoEdicion = false;
  }

  // Agregar calle afectada
  agregarCalleAfectada(): void {
    const nuevaCalle: CalleAfectada = {
      calleId: '',
      calleNombre: ''
    };
    this.nuevaIncidencia.callesAfectadas.push(nuevaCalle);
    this.showSuccessToast('Calle agregada');
  }

  // Eliminar calle afectada
  eliminarCalleAfectada(index: number): void {
    Swal.fire({
      title: '¿Eliminar calle?',
      text: 'Esta calle será removida de la lista',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.nuevaIncidencia.callesAfectadas.splice(index, 1);
        this.showSuccessToast('Calle eliminada');
      }
    });
  }

  // Agregar material requerido
  agregarMaterialRequerido(): void {
    const nuevoMaterial: MaterialRequerido = {
      nombre: '',
      cantidad: 0,
      unidad: ''
    };
    this.nuevaIncidencia.materialesRequeridos.push(nuevoMaterial);
    this.showSuccessToast('Material agregado');
  }

  // Eliminar material requerido
  eliminarMaterialRequerido(index: number): void {
    Swal.fire({
      title: '¿Eliminar material?',
      text: 'Este material será removido de la lista',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.nuevaIncidencia.materialesRequeridos.splice(index, 1);
        this.showSuccessToast('Material eliminado');
      }
    });
  }

  // Formatear fecha para mostrar
  formatearFecha(fecha: string): string {
    if (!fecha) return 'No definida';
    return new Date(fecha).toLocaleDateString('es-ES');
  }

  // Obtener clase CSS según prioridad
  getClasePrioridad(prioridad: string): string {
    switch (prioridad) {
      case 'ALTA': return 'prioridad-alta';
      case 'MEDIA': return 'prioridad-media';
      case 'BAJA': return 'prioridad-baja';
      default: return '';
    }
  }

  // Obtener clase CSS según estado
  getClaseEstado(estado: string): string {
    switch (estado) {
      case 'PENDIENTE': return 'estado-pendiente';
      case 'EN_PROCESO': return 'estado-proceso';
      case 'COMPLETADO': return 'estado-completado';
      case 'CANCELADO': return 'estado-cancelado';
      default: return '';
    }
  }

  // Métodos de SweetAlert2 personalizados
  private showSuccessAlert(title: string, text?: string): void {
    Swal.fire({
      icon: 'success',
      title: title,
      text: text,
      timer: 3000,
      showConfirmButton: false,
      toast: false,
      position: 'center'
    });
  }

  private showErrorAlert(title: string, text?: string): void {
    Swal.fire({
      icon: 'error',
      title: title,
      text: text,
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#d33'
    });
  }

  private showSuccessToast(message: string): void {
    Swal.fire({
      icon: 'success',
      title: message,
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true
    });
  }

  private showInfoAlert(title: string, text: string): void {
    Swal.fire({
      icon: 'info',
      title: title,
      text: text,
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#3085d6'
    });
  }
}