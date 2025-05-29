import {
  Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProgramacionDistribucionService, ProgramacionDistribucion, CreateProgramacionDTO } from '../../../../core/services/distribution.service';

@Component({
  selector: 'app-distribucion-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './distribution-form.component.html',
  styleUrls: ['./distribution-form.component.css']
})
export class ProgramacionDistribucionFormComponent implements OnInit, OnChanges {
  @Input() editMode = false;
  @Input() programacionId: string | null = null;

  @Output() guardado = new EventEmitter<void>();
  @Output() cerrar = new EventEmitter<void>();

  form!: FormGroup;
  cargando = false;

  constructor(
    private fb: FormBuilder,
    private service: ProgramacionDistribucionService
  ) {}

  ngOnInit(): void {
    this.crearFormulario();
    if (this.editMode && this.programacionId) {
      this.cargarDatos(this.programacionId);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['programacionId'] && this.programacionId && this.form) {
      this.cargarDatos(this.programacionId);
    }
  }

  crearFormulario(): void {
    this.form = this.fb.group({
      fecha: ['', Validators.required],
      zonaId: ['', Validators.required],
      zonaNombre: ['', Validators.required],
      estado: ['ACTIVO']
    });
  }

  cargarDatos(id: string): void {
    this.cargando = true;
    this.service.getById(id).subscribe({
      next: (response) => {
        if (response.status && response.data) {
          this.form.patchValue({
            fecha: response.data.fecha,
            zonaId: response.data.zonaId,
            zonaNombre: response.data.zonaNombre,
            estado: response.data.estado
          });
        }
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar datos:', error);
        this.cargando = false;
      }
    });
  }

  guardar(): void {
    if (this.form.valid) {
      this.cargando = true;
      
      if (this.editMode && this.programacionId) {
        // Actualizar programación existente
        const updateData = {
          fecha: this.form.value.fecha,
          zonaId: this.form.value.zonaId,
          estado: this.form.value.estado
        };
        
        this.service.update(this.programacionId, updateData).subscribe({
          next: (response) => {
            if (response.status) {
              this.guardado.emit();
              this.cerrar.emit();
            }
            this.cargando = false;
          },
          error: (error) => {
            console.error('Error al actualizar:', error);
            this.cargando = false;
          }
        });
      } else {
        // Crear nueva programación
        const createData: CreateProgramacionDTO = {
          fecha: this.form.value.fecha,
          zonaId: this.form.value.zonaId
        };
        
        this.service.create(createData).subscribe({
          next: (response) => {
            if (response.status) {
              this.guardado.emit();
              this.cerrar.emit();
            }
            this.cargando = false;
          },
          error: (error) => {
            console.error('Error al crear:', error);
            this.cargando = false;
          }
        });
      }
    } else {
      this.form.markAllAsTouched();
    }
  }

  cancelar(): void {
    this.cerrar.emit();
  }
}