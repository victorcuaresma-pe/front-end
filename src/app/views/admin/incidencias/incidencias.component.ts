import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Incidencia, CalleAfectada, MaterialRequerido } from '../../../core/models/incidencias';
import { IncidenciaService } from '../../../core/services/incidencias.service';

@Component({
  selector: 'app-incidencias',
  imports: [CommonModule, FormsModule],
  templateUrl: './incidencias.component.html',
  styleUrl: './incidencias.component.css'
})
export class IncidenciasComponent implements OnInit {
  
  incidencias: Incidencia[] = [];
  incidenciaSeleccionada: Incidencia | null = null;
  nuevaIncidencia: Incidencia = this.inicializarIncidencia();
  mostrarFormulario = false;
  modoEdicion = false;
  filtroActivo = 'todos'; // 'todos', 'activos', 'inactivos'
  loading = false;
  error = '';

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
    this.error = '';

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
        } else {
          this.error = 'Error al cargar las incidencias';
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error de conexión: ' + err.message;
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
    this.incidenciaService.getById(id).subscribe({
      next: (response) => {
        if (response.status && response.data.length > 0) {
          this.incidenciaSeleccionada = response.data[0];
        }
      },
      error: (err) => {
        this.error = 'Error al obtener la incidencia: ' + err.message;
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
    this.incidenciaService.create(this.nuevaIncidencia).subscribe({
      next: (response) => {
        if (response.status) {
          this.cargarIncidencias();
          this.cancelarFormulario();
        } else {
          this.error = 'Error al crear la incidencia';
        }
      },
      error: (err) => {
        this.error = 'Error al crear: ' + err.message;
      }
    });
  }

  // Actualizar incidencia
  actualizarIncidencia(): void {
    if (this.nuevaIncidencia.id) {
      this.incidenciaService.update(this.nuevaIncidencia.id, this.nuevaIncidencia).subscribe({
        next: (response) => {
          if (response.status) {
            this.cargarIncidencias();
            this.cancelarFormulario();
          } else {
            this.error = 'Error al actualizar la incidencia';
          }
        },
        error: (err) => {
          this.error = 'Error al actualizar: ' + err.message;
        }
      });
    }
  }

  // Eliminar lógicamente (inactivar)
  eliminarLogico(id: string): void {
    if (confirm('¿Está seguro de que desea eliminar esta incidencia?')) {
      this.incidenciaService.deleteLogic(id).subscribe({
        next: (response) => {
          if (response.status) {
            this.cargarIncidencias();
          } else {
            this.error = 'Error al eliminar la incidencia';
          }
        },
        error: (err) => {
          this.error = 'Error al eliminar: ' + err.message;
        }
      });
    }
  }

  // Activar incidencia
  activarIncidencia(id: string): void {
    this.incidenciaService.activate(id).subscribe({
      next: (response) => {
        if (response.status) {
          this.cargarIncidencias();
        } else {
          this.error = 'Error al activar la incidencia';
        }
      },
      error: (err) => {
        this.error = 'Error al activar: ' + err.message;
      }
    });
  }

  // Desactivar incidencia
  desactivarIncidencia(id: string): void {
    this.incidenciaService.deactivate(id).subscribe({
      next: (response) => {
        if (response.status) {
          this.cargarIncidencias();
        } else {
          this.error = 'Error al desactivar la incidencia';
        }
      },
      error: (err) => {
        this.error = 'Error al desactivar: ' + err.message;
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
    this.mostrarFormulario = false;
    this.nuevaIncidencia = this.inicializarIncidencia();
    this.modoEdicion = false;
    this.error = '';
  }

  // Agregar calle afectada
  agregarCalleAfectada(): void {
    const nuevaCalle: CalleAfectada = {
      calleId: '',
      calleNombre: ''
    };
    this.nuevaIncidencia.callesAfectadas.push(nuevaCalle);
  }

  // Eliminar calle afectada
  eliminarCalleAfectada(index: number): void {
    this.nuevaIncidencia.callesAfectadas.splice(index, 1);
  }

  // Agregar material requerido
  agregarMaterialRequerido(): void {
    const nuevoMaterial: MaterialRequerido = {
      nombre: '',
      cantidad: 0,
      unidad: ''
    };
    this.nuevaIncidencia.materialesRequeridos.push(nuevoMaterial);
  }

  // Eliminar material requerido
  eliminarMaterialRequerido(index: number): void {
    this.nuevaIncidencia.materialesRequeridos.splice(index, 1);
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
}