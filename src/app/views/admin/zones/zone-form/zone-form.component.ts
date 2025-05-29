import {
  Component, EventEmitter, Input, OnInit, Output,
  OnChanges, SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Zone, ZoneService } from '../../../../core/services/zone.service';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-zone-form', // Componente en templates
  standalone: true, // Componente independiente, sin módulo específico
  imports: [CommonModule, ReactiveFormsModule], // Importa módulos necesarios para form reactivos y funcionalidades
  templateUrl: './zone-form.component.html', // Archivo HTML asociado
  styleUrls: ['./zone-form.component.css'] // Archivo CSS asociado
})

export class ZoneFormComponent implements OnInit, OnChanges {
  @Output() cerrar = new EventEmitter<void>(); // Evento para notificar cierre del formulario
  @Output() zonaCreada = new EventEmitter<void>(); // Evento para notificar creación o edición exitosa
  @Input() editMode = false; // Indica si el formulario está en modo edición
  @Input() zoneId?: string; // ID de la zona a editar (si aplica)

  form!: FormGroup; // Define el formulario reactivo

  constructor(private fb: FormBuilder, private zoneService: ZoneService) {} // Inyecta FormBuilder y servicio de zonas

  ngOnInit(): void {
    console.log('⚙️ ZoneFormComponent.ngOnInit — editMode =', this.editMode, 'zoneId =', this.zoneId); // Log para depuración

    // Expresión regular para validar nombres y descripciones:
    // - Empieza con una letra
    // - No permite espacios consecutivos
    // - Permite letras, ñ, tildes y espacios entre palabras
    const letrasYEspacios = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ](?!.*\s{2,})[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]*$/;

    this.form = this.fb.group({
      name: [
        '', // Valor inicial vacío
        [
          Validators.required, // Campo obligatorio
          Validators.pattern(letrasYEspacios) // Validación con regex personalizada
        ]
      ],
      description: [
        '', // Valor inicial vacío
        [
          Validators.required, // Campo obligatorio
          Validators.pattern(letrasYEspacios) // Validación con regex personalizada
        ]
      ]
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
  if (changes['zoneId'] && this.editMode && this.zoneId) { // Si cambió zoneId, y estamos en modo edición con zoneId válido
    this.cargarZona(); // Carga la zona desde backend para edición
  }
}

private cargarZona(): void {
  console.log('📥 Cargando zona desde el backend con ID:', this.zoneId); // Log de inicio carga
  this.zoneService.getById(this.zoneId!).subscribe({
    next: (response) => {
      const zone = response.data; // Obtiene datos de la zona
      console.log('✅ Zona cargada para edición:', zone); // Log éxito carga
      this.form.patchValue({ // Rellena el formulario con los datos
        name: zone.name,
        description: zone.description,
      });
    },
    error: err => console.error('❌ Error cargando zona:', err) // Log error carga
  });
}

guardar(): void {
  console.log('💾 guardar() llamado, form válido:', this.form.valid); // Log para saber si form es válido
  if (this.form.invalid) return; // No continuar si formulario inválido

  const mensaje = this.editMode
    ? '¿Deseas actualizar esta zona?' // Mensaje para actualizar
    : '¿Deseas agregar esta nueva zona?'; // Mensaje para crear nueva zona

  Swal.fire({
    title: '¿Estás seguro?', // Título diálogo confirmación
    text: mensaje, // Texto según modo crear/editar
    icon: 'warning', // Icono advertencia
    showCancelButton: true, // Mostrar botón cancelar
    confirmButtonText: 'Sí, continuar', // Texto confirmar
    cancelButtonText: 'No, cancelar' // Texto cancelar
  }).then((result) => {
    if (result.isConfirmed) { // Si usuario confirma
      const payload: Zone = this.form.value; // Obtiene datos del formulario

      if (this.editMode && this.zoneId) { // Si está en modo edición
        this.zoneService.update(this.zoneId, payload).subscribe({ // Llama servicio actualizar
          next: () => {
            console.log('✅ Zona actualizada'); // Log éxito
            Swal.fire('Actualizado', 'La zona fue actualizada correctamente.', 'success'); // Mensaje éxito
            this.zonaCreada.emit(); // Emitir evento zona creada (o actualizada)
            this.cerrar.emit(); // Emitir evento cerrar formulario
          },
          error: err => {
            console.error('❌ Error actualizando zona:', err); // Log error
            Swal.fire('Error', 'No se pudo actualizar la zona.', 'error'); // Mensaje error
          }
        });
      } else { // Si está en modo creación
        this.zoneService.create(payload).subscribe({ // Llama servicio crear
          next: () => {
            console.log('✅ Zona creada'); // Log éxito creación
            Swal.fire('Registrado', 'La zona fue registrada correctamente.', 'success'); // Mensaje éxito
            this.zonaCreada.emit(); // Emitir evento zona creada
            this.cerrar.emit(); // Emitir evento cerrar formulario
          },
          error: err => {
            console.error('❌ Error creando zona:', err); // Log error creación
            Swal.fire('Error', 'No se pudo registrar la zona.', 'error'); // Mensaje error
          }
        });
      }
    } else {
      console.log('⚠️ Acción cancelada por el usuario.'); // Log si usuario cancela
    }
  });
}

cancelar(): void {
  console.log('❎ cancelar() llamado'); // Log cancelación
  this.cerrar.emit(); // Emitir evento para cerrar formulario sin cambios
}
}
