import { HttpClient } from '@angular/common/http'; // Cliente HTTP
import { Injectable } from '@angular/core'; // Decorador para servicios
import { Observable } from 'rxjs'; // Tipo para respuestas reactivas
import { map } from 'rxjs/operators'; // Operador para transformar respuestas

export interface Zone { // Modelo de zona
  zoneName: any; // Nombre de zona (referencial)
  zoneId?: string; // ID de la zona
  name: string; // Nombre
  description: string; // Descripción
  officeId?: string; // ID de oficina
  status?: string; // Estado ('ACTIVE' o 'INACTIVE')
  dateRecord?: string; // Fecha de registro
}

export interface ApiResponse<T> { // Respuesta genérica de la API
  status: boolean; // Éxito o fallo
  data: T; // Datos de respuesta
  error?: { // Detalles de error
    errorCode: number; // Código de error
    message: string; // Mensaje
    details?: string; // Detalles opcionales
  };
}

@Injectable({ providedIn: 'root' }) // Servicio inyectable en toda la app
export class ZoneService {
  private apiUrl = 'https://supreme-winner-97wpr5p54ggqc94x6-8080.app.github.dev/api/v1/zonas'; // URL base de zonas

  constructor(private http: HttpClient) {} // Inyección de HttpClient

  getById(id: string): Observable<{ status: boolean; data: Zone }> { // Obtener zona por ID
    return this.http.get<{ status: boolean; data: Zone }>(`${this.apiUrl}/${id}`); // Llamada GET
  }

  getAllActive(): Observable<ApiResponse<Zone[]>> { // Obtener zonas activas
    return this.http.get<ApiResponse<Zone[]>>(`${this.apiUrl}/activas`).pipe(
      map(response => { // Transformar respuesta
        console.log('Zonas activas:', response.data); // Mostrar en consola
        return response; // Retornar respuesta
      })
    );
  }

  getAllInactive(): Observable<any> { // Obtener zonas inactivas
    return this.http.get(`${this.apiUrl}/inactivas`); // Llamada GET
  }

  create(zone: Zone): Observable<Zone> { // Crear zona nueva
    return this.http.post<Zone>(this.apiUrl, zone); // Llamada POST
  }

  update(id: string, zone: Zone): Observable<Zone> { // Actualizar zona
    return this.http.put<Zone>(`${this.apiUrl}/${id}`, zone); // Llamada PUT
  }

  delete(id: string): Observable<any> { // Eliminar zona (lógico)
    return this.http.delete(`${this.apiUrl}/${id}`); // Llamada DELETE
  }

  activate(id: string): Observable<any> { // Activar zona
    return this.http.patch(`${this.apiUrl}/${id}/activate`, {}); // Llamada PATCH
  }
}
