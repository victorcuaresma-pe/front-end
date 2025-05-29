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
import { Rate, RateService, CreateRateDTO } from '../../../../core/services/rate.service';
import { ApiResponse, Zone, ZoneService } from '../../../../core/services/zone.service';

@Component({
  selector: 'app-rate-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './rate-form.component.html',
  styleUrls: ['./rate-form.component.css']
})
export class RateFormComponent implements OnInit, OnChanges {
  @Input() editMode: boolean = false;
  @Input() rateId?: string;

  @Output() guardado = new EventEmitter<void>();
  @Output() cerrar = new EventEmitter<void>();

  form!: FormGroup;
  zonas: Zone[] = [];

  private fb = inject(FormBuilder);
  private rateService = inject(RateService);
  private zoneService = inject(ZoneService);

  rates: Rate[] | undefined;
  mostrarInactivas: any;
  selectedZoneName: string | undefined;

 ngOnInit(): void {
  this.form = this.fb.group({
    zoneId: ['', Validators.required],
    amount: [
      '', 
      [
        Validators.required,
        Validators.pattern(/^\d+(\.\d+)?$/)  // Acepta enteros y decimales
      ]
    ],
    description: [
      '',
      [
        Validators.required,
        Validators.pattern(/^[A-Za-z0-9ÁÉÍÓÚáéíóúÑñ\s]+$/)
      ]
    ],
    rateType: [
      '',
      [
        Validators.required,
        Validators.pattern(/^[A-Za-z0-9ÁÉÍÓÚáéíóúÑñ\s]+$/)
      ]
    ],
    startDate: ['', Validators.required],
    endDate: ['', Validators.required]
  });

  this.cargarZonas();
}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['rateId'] && this.editMode && this.rateId) {
      this.cargarDatos();
    }
  }

  private cargarZonas(): void {
    this.zoneService.getAllActive().subscribe({
      next: (resp) => {
        this.zonas = resp.data;
        if (this.editMode && this.rateId) {
          this.cargarDatos();
        }
      },
      error: (err) => {
        console.error('Error cargando zonas:', err);
      }
    });
  }

  private cargarDatos(): void {
    if (!this.rateId) return;

    this.rateService.getById(this.rateId).subscribe({
      next: (res) => {
        const rate = res.data;
        this.form.patchValue({
          zoneId: rate.zoneId,
          amount: rate.amount,
          description: rate.description,
          rateType: rate.rateType,
          startDate: this.formatDateToInput(rate.startDate),
          endDate: this.formatDateToInput(rate.endDate)
        });

        const zonaSeleccionada = this.zonas.find(z => z.zoneId === rate.zoneId);
        this.selectedZoneName = zonaSeleccionada ? zonaSeleccionada.name : undefined;
      },
      error: (err) => {
        console.error('Error al cargar los datos de la tarifa:', err);
      }
    });
  }

 guardar(): void {
  if (this.form.invalid) {
    console.log('Formulario inválido');
    return;
  }

  const raw = this.form.value;
  const selectedZone = this.zonas.find(z => z.zoneId === raw.zoneId);

  if (!this.editMode && this.rates) {
    const existeTarifaActiva = this.rates.some(rate =>
      rate.zoneId === raw.zoneId && rate.status === 'ACTIVE'
    );

    if (existeTarifaActiva) {
      Swal.fire('Error', 'Ya existe una tarifa activa para esta zona.', 'error');
      return;
    }
  }

  Swal.fire({
    title: this.editMode ? '¿Deseas actualizar esta tarifa?' : '¿Deseas crear esta tarifa?',
    text: 'Esta acción no se puede deshacer.',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Sí, confirmar',
    cancelButtonText: 'Cancelar'
  }).then(result => {
    if (!result.isConfirmed) return;

    if (this.editMode && this.rateId) {
      const updatePayload = {
        zoneId: raw.zoneId,
        amount: Number(raw.amount),
        description: raw.description,
        rateType: raw.rateType,
        startDate: new Date(raw.startDate).toISOString(),
        endDate: new Date(raw.endDate).toISOString()
      };

      console.log('Payload para actualizar tarifa:', updatePayload);

      this.rateService.update(this.rateId, updatePayload).subscribe({
        next: (res) => {
          console.log('Respuesta backend actualización:', res);
          Swal.fire('Éxito', 'Tarifa actualizada con éxito', 'success');
          this.guardado.emit();
          this.cerrar.emit();
        },
        error: (err) => {
          console.error('Error al actualizar la tarifa:', err);
          Swal.fire('Error', 'Error al actualizar la tarifa', 'error');
        }
      });
    } else {
      const createPayload: CreateRateDTO = {
        zoneId: raw.zoneId,
        amount: Number(raw.amount),
        description: raw.description,
        rateType: raw.rateType,
        startDate: new Date(raw.startDate).toISOString(),
        endDate: new Date(raw.endDate).toISOString(),
      };

      console.log('Payload para crear tarifa:', createPayload);

      this.rateService.create(createPayload).subscribe({
        next: (res) => {
          console.log('Respuesta backend creación:', res);
          Swal.fire('Éxito', 'Tarifa creada con éxito', 'success');
          this.guardado.emit();
          this.cerrar.emit();
        },
        error: (err) => {
          console.error('Error al crear la tarifa:', err);
          Swal.fire('Error', 'Error al crear la tarifa', 'error');
        }
      });
    }
  });
}

  private formatDateToInput(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const offset = date.getTimezoneOffset(); // ajuste por zona horaria local
    date.setMinutes(date.getMinutes() - offset); // elimina desfase
    return date.toISOString().split('T')[0]; // yyyy-MM-dd
  }

  loadRates(): void {
    const request = this.mostrarInactivas
      ? this.rateService.getAllInactive()
      : this.rateService.getAllActive();

    request.subscribe({
      next: (resp: ApiResponse<Rate[]>) => {
        this.rates = resp.data.map(rate => ({
          ...rate,
          rateId: rate.rateId || (rate as any)._id || (rate as any).rateId
        }));
        console.log('Tarifas cargadas:', this.rates);
      },
      error: (err: any) => {
        this.rates = [];
        console.error('Error al obtener tarifas:', err);
      }
    });
  }

  cancelar(): void {
    this.form.reset();
    this.cerrar.emit();
  }
}
