import { HttpClient } from '@angular/common/http'; // Cliente HTTP para peticiones REST
import { Injectable } from '@angular/core'; // Decorador para servicios inyectables
import { catchError, map, Observable, of } from 'rxjs'; // Operadores RxJS para manejar flujos de datos

// Interfaz que representa una tarifa completa
export interface Rate {
  rateId: string;
  zoneId: string;
  amount: number;
  description: string;
  rateType: string;
  startDate: string;
  endDate: string;
  status: string;
  dateRecord: string;
  zoneName: string;
}

// Interfaz para crear tarifa (sin campos autogenerados)
export interface CreateRateDTO {
  zoneId: string;
  amount: number;
  description: string;
  rateType: string;
  startDate: string;
  endDate: string;
  // eliminar zoneName
}

// Estructura de respuesta API
export interface ApiResponse<T> {
  status: boolean;
  data: T;
  error?: {
    errorCode: number;
    message: string;
    details?: string;
  };
}

@Injectable({
  providedIn: 'root' // Servicio disponible globalmente
})
export class RateService {
  // URL base de la API de tarifas
  private apiUrl = 'https://supreme-winner-97wpr5p54ggqc94x6-8080.app.github.dev/api/v1/tarifas';

  constructor(private http: HttpClient) {} // Inyección del cliente HTTP

  // Crear nueva tarifa
  create(rate: CreateRateDTO): Observable<ApiResponse<Rate>> {
    return this.http.post<ApiResponse<Rate>>(this.apiUrl, rate);
  }

  // Obtener tarifa por ID
  getById(id: string): Observable<ApiResponse<Rate>> {
    return this.http.get<ApiResponse<Rate>>(`${this.apiUrl}/${id}`);
  }

  // Obtener todas las tarifas por estado (activo/inactivo)
  getAllByStatus(active: boolean = true): Observable<ApiResponse<Rate[]>> {
    const endpoint = active ? 'active' : 'inactive'; // Define endpoint según estado
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/${endpoint}`).pipe(
      map(response => ({
        status: response.status,
        data: response.data.map(item => ({ // Mapea datos para adaptarlos
          rateId: item.rateId || item._id,
          zoneId: item.zoneId,
          amount: item.amount,
          description: item.description,
          rateType: item.rateType,
          startDate: item.startDate,
          endDate: item.endDate,
          status: item.status,
          dateRecord: item.dateRecord,
          zoneName: item.zoneName
        }))
      }))
    );
  }

  // Obtener solo tarifas activas
  getAllActive(): Observable<ApiResponse<Rate[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/active`).pipe(
      map(response => {
        if (response.status && Array.isArray(response.data)) {
          return {
            status: true,
            data: response.data.map(item => ({ // Formatea los datos recibidos
              rateId: item.rateId || item._id || item.id,
              zoneId: item.zoneId,
              amount: item.amount,
              description: item.description,
              rateType: item.rateType,
              startDate: item.startDate,
              endDate: item.endDate,
              status: item.status,
              dateRecord: item.dateRecord,
              zoneName: item.zoneName
            }))
          };
        } else {
          return { status: false, data: [] }; // Si falla, retorna lista vacía
        }
      }),
      catchError(err => { // Manejo de errores
        console.error('Error en getAllActive:', err);
        return of({ status: false, data: [] });
      })
    );
  }

  // Obtener tarifas inactivas
  getAllInactive(): Observable<ApiResponse<Rate[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/inactive`).pipe(
      map(response => {
        if (response.status && Array.isArray(response.data)) {
          return {
            status: true,
            data: response.data.map(item => ({
              rateId: item.rateId || item._id || item.id,
              zoneId: item.zoneId,
              amount: item.amount,
              description: item.description,
              rateType: item.rateType,
              startDate: item.startDate,
              endDate: item.endDate,
              status: item.status,
              dateRecord: item.dateRecord,
              zoneName: item.zoneName
            }))
          };
        } else {
          return { status: false, data: [] };
        }
      }),
      catchError(err => {
        console.error('Error en getAllInactive:', err);
        return of({ status: false, data: [] });
      })
    );
  }

  // Actualizar una tarifa
  update(id: string, updateRequest: Partial<{ 
    zoneId: string; 
    amount: number; 
    description: string; 
    rateType: string; 
    startDate: string; 
    endDate: string; 
    status: boolean 
  }>): Observable<ApiResponse<Rate>> {
    return this.http.put<ApiResponse<Rate>>(`${this.apiUrl}/${id}`, updateRequest);
  }

  // Eliminar tarifa (posiblemente físico o lógico)
  delete(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Activar tarifa
  activate(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/activate`, {});
  }

  // Desactivar tarifa
  desactivate(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/desactivate`, {});
  }
}
