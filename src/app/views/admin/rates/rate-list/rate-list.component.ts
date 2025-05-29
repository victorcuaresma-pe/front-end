import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { Rate, RateService, ApiResponse } from '../../../../core/services/rate.service';
import { RateFormComponent } from '../rate-form/rate-form.component';
import { Observable } from 'rxjs';
import { ZoneService } from '../../../../core/services/zone.service';

@Component({
  selector: 'app-rate-list',
  standalone: true,
  imports: [
    CommonModule,
    RateFormComponent
  ],
  templateUrl: './rate-list.component.html',
  styleUrls: ['./rate-list.component.css']
})

export class RateListComponent implements OnInit {
  rates: Rate[] = [];
  mostrarModal = false;
  editMode = false;
  editingRateId?: string;
  mostrarInactivas = false;


  constructor(
  private rateService: RateService,
  private zoneService: ZoneService
) {}


  ngOnInit(): void {
    this.loadRates();
  }

 loadRates(): void {
  // Primero cargamos las zonas
  this.zoneService.getAllActive().subscribe({
    next: (zonaResp: { data: any; }) => {
      const zonas = zonaResp.data;

      const request = this.mostrarInactivas
        ? this.rateService.getAllInactive()
        : this.rateService.getAllActive();

      request.subscribe({
        next: (rateResp: ApiResponse<Rate[]>) => {
          this.rates = rateResp.data.map(rate => {
            const zona = zonas.find((z: { zoneId: { toString: () => string; }; }) => z.zoneId.toString() === rate.zoneId.toString());
            return {
              ...rate,
              rateId: rate.rateId || (rate as any)._id,
              zoneName: zona ? zona.name : 'Sin Zona'
            };
          });
        },
        error: (err: any) => {
          this.rates = [];
          console.error('Error al obtener tarifas:', err);
        }
      });
    },
    error: (err: any) => {
      console.error('Error al obtener zonas:', err);
    }
  });
}


  

  alternarTarifas(): void {
    this.mostrarInactivas = !this.mostrarInactivas;
    this.loadRates();
  }

  abrirModal(): void {
    this.editMode = false;
    this.editingRateId = undefined;
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
  }

  recargarLista(): void {
    this.loadRates();
    this.cerrarModal();
  }


 onEdit(rate: Rate): void {
    this.editingRateId = rate.rateId;
    this.editMode = true;
    this.mostrarModal = true;
  }

  onDesactivate(rate: Rate): void {
    Swal.fire({
      title: '¿Desactivar tarifa?',
      text: `¿Deseas desactivar la tarifa "${rate.zoneId}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, desactivar',
      cancelButtonText: 'No'
    }).then(result => {
      if (result.isConfirmed) {
        this.rateService.desactivate(rate.rateId!).subscribe({
          next: () => {
            Swal.fire('Desactivada', 'La tarifa ha sido desactivada correctamente.', 'success');
            this.recargarLista();
          },
          error: err => {
            console.error('Error desactivando tarifa:', err);
            Swal.fire('Error', 'No se pudo desactivar la tarifa.', 'error');
          }
        });
      }
    });
  }

  onActivate(rate: Rate): void {
    Swal.fire({
      title: '¿Reactivar tarifa?',
      text: `¿Deseas reactivar la tarifa "${rate.zoneId}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, reactivar',
      cancelButtonText: 'No'
    }).then(result => {
      if (result.isConfirmed) {
        this.rateService.activate(rate.rateId!).subscribe({
          next: () => {
            Swal.fire('Reactivada', 'La tarifa ha sido reactivada correctamente.', 'success');
            this.recargarLista();
          },
          error: err => {
            console.error('Error reactivando tarifa:', err);
            Swal.fire('Error', 'No se pudo reactivar la tarifa.', 'error');
          }
        });
      }
    });
  }

  // Método trackBy para optimizar la lista
  trackByRateId(index: number, rate: Rate): string {
    return rate.rateId ?? '';
  }

  formatStatus(status?: boolean): string {
    return status ? 'A' : 'I';
  }

  formatDate(date?: string | Date): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('es-PE');
}

}
