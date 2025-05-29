import {
  Component,
  OnInit,
  OnChanges,
  Input,
  Output,
  EventEmitter,
  SimpleChanges,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import Swal from 'sweetalert2';
import { Street, StreetService } from '../../../../core/services/street.service';
import { ApiResponse, Zone, ZoneService } from '../../../../core/services/zone.service';

@Component({
  selector: 'app-street-form', // Nombre del selector HTML
  standalone: true, // Componente independiente
  imports: [CommonModule, ReactiveFormsModule], // Módulos necesarios
  templateUrl: './street-form.component.html', // Ruta del HTML
  styleUrls: ['./street-form.component.css'] // Ruta del CSS
})
export class StreetFormComponent implements OnInit, OnChanges {

  @Input() editMode: boolean = false; // Modo edición (true/false)
  @Input() streetId?: string; // ID de la calle a editar

  @Output() guardado = new EventEmitter<void>(); // Evento al guardar
  @Output() cerrar = new EventEmitter<void>(); // Evento al cerrar

  form!: FormGroup; // Formulario reactivo
  zonas: Zone[] = []; // Lista de zonas

  private fb = inject(FormBuilder); // Constructor de formularios
  private streetService = inject(StreetService); // Servicio de calles
  private zoneService = inject(ZoneService); // Servicio de zonas

  streets: Street[] | undefined; // Lista de calles
  mostrarInactivas: any; // Mostrar calles inactivas
  selectedZoneName: string | undefined; // Nombre de zona seleccionada

 ngOnInit(): void {
  // Se crea el formulario con validaciones
  this.form = this.fb.group({
    name: [
      '', // Valor inicial vacío
      [
        Validators.required, // Campo obligatorio
        Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ][A-Za-z0-9ÁÉÍÓÚáéíóúÑñ\s]*$/) // Debe comenzar con letra
      ]
    ],
    zoneId: ['', Validators.required] // Zona obligatoria
  });

  this.cargarZonas(); // Carga las zonas desde el servicio
}

ngOnChanges(changes: SimpleChanges): void {
  // Si cambia el ID de calle, está en modo edición y hay ID
  if (changes['streetId'] && this.editMode && this.streetId) {
    console.log('streetId cambiado a:', this.streetId); // Log para depuración
    this.cargarDatos(); // Carga los datos de la calle para edición
  }
}
private cargarZonas(): void {
  // Obtiene todas las zonas activas
  this.zoneService.getAllActive().subscribe({
    next: (resp) => {
      this.zonas = resp.data; // Asigna zonas al arreglo
      console.log('Zonas cargadas:', this.zonas);

      // Si está en edición, carga los datos de la calle
      if (this.editMode && this.streetId) {
        this.cargarDatos();
      }
    },
    error: (err) => {
      console.error('Error cargando zonas:', err); // Muestra error si falla
    }
  });
}

private cargarDatos(): void {
  if (!this.streetId) return; // Si no hay ID, no hace nada

  // Obtiene los datos de la calle por su ID
  this.streetService.getById(this.streetId).subscribe({
    next: (res) => {
      const street = res.data; // Guarda la calle recibida
      console.log('Datos de la calle recibidos:', street);

      // Llena el formulario con los datos existentes
      this.form.patchValue({
        name: street.name,
        zoneId: street.zoneId
      });

      // Busca el nombre de la zona seleccionada
      const zonaSeleccionada = this.zonas.find(z => z.zoneId === street.zoneId);
      this.selectedZoneName = zonaSeleccionada ? zonaSeleccionada.name : undefined;
    },
    error: (err) => {
      console.error('Error al cargar los datos de la calle:', err); // Muestra error
    }
  });
}

guardar(): void {
  if (this.form.invalid) {
    console.log('Formulario inválido'); // Verifica si el formulario es válido
    return;
  }

  const payload = this.form.value; // Obtiene los valores del formulario
  console.log('Payload:', payload);

  // Define los textos según si es edición o creación
  const mensaje = this.editMode ? '¿Deseas actualizar esta calle?' : '¿Deseas registrar esta calle?';
  const titulo = this.editMode ? 'Confirmar edición' : 'Confirmar registro';

  // Muestra cuadro de confirmación
  Swal.fire({
    title: titulo,
    text: mensaje,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      if (this.editMode && this.streetId) {
        // Si es edición, llama al servicio de actualización
        this.streetService.update(this.streetId, payload).subscribe({
          next: (res) => {
            console.log('Calle actualizada con éxito', res);
            Swal.fire('Éxito', 'Calle actualizada con éxito', 'success');
            this.guardado.emit(); // Emite evento de guardado
            this.cerrar.emit(); // Emite evento de cierre
          },
          error: (err) => {
            console.error('Error al actualizar la calle:', err);
            Swal.fire('Error', 'Error al actualizar la calle', 'error');
          }
        });
      } else {
        // Si es nueva, llama al servicio de creación
        this.streetService.create(payload).subscribe({
          next: (res) => {
            console.log('Calle creada con éxito', res);
            Swal.fire('Éxito', 'Calle creada con éxito', 'success');
            this.guardado.emit(); // Emite evento de guardado
            this.cerrar.emit(); // Emite evento de cierre
          },
          error: (err) => {
            console.error('Error al crear la calle:', err);
            Swal.fire('Error', 'Error al crear la calle', 'error');
          }
        });
      }
    } else {
      console.log('Acción cancelada por el usuario'); // Si cancela, no hace nada
    }
  });
}
loadStreets(): void {
  // Elige si cargar calles inactivas o activas según el flag
  const request = this.mostrarInactivas
    ? this.streetService.getAllInactive()
    : this.streetService.getAllActive();

  // Realiza la solicitud
  request.subscribe({
    next: (resp: ApiResponse<Street[]>) => {
      // Asigna las calles al arreglo y asegura que tengan un ID válido
      this.streets = resp.data.map(street => ({
        ...street,
        streetId: street.streetId || (street as any)._id || (street as any).streeId
      }));
      console.log('Calles cargadas:', this.streets); // Log para verificar
    },
    error: (err: any) => {
      this.streets = []; // Limpia el arreglo en caso de error
      console.error('Error al obtener calles:', err); // Muestra el error
    }
  });
}


cancelar(): void {
  this.form.reset(); // Limpia el formulario
  this.cerrar.emit(); // Emite evento para cerrar el formulario
}
}
