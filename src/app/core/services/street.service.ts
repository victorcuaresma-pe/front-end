import { HttpClient } from '@angular/common/http'; // Cliente HTTP
import { Injectable } from '@angular/core'; // Decorador para servicios
import { map, Observable } from 'rxjs'; // Funciones reactivas

export interface Street { // Modelo de calle
  streetId?: string; // ID de calle
  name: string; // Nombre de la calle
  zoneId: string; // ID de la zona
  zoneName?: string; // Nombre de la zona (referencia)
  status?: boolean; // Estado activo/inactivo
  dateRecord?: string; // Fecha de registro
}

export interface ApiResponse<T> { // Estructura de respuesta API
  status: boolean; // Estado de la respuesta
  data: T; // Datos
  error?: { // Error opcional
    errorCode: number; // Código del error
    message: string; // Mensaje del error
    details?: string; // Detalles adicionales
  };
}

@Injectable({
  providedIn: 'root' // Servicio disponible en toda la app
})
export class StreetService {
  private apiUrl = 'https://musical-system-pvx67wgrrxv2657r-8080.app.github.dev/api/v1/calles'; // URL base

  constructor(private http: HttpClient) {} // Inyecta HttpClient

  create(street: Street): Observable<ApiResponse<Street>> { // Crear calle
    return this.http.post<ApiResponse<Street>>(this.apiUrl, street); // POST
  }

  getById(id: string): Observable<ApiResponse<Street>> { // Obtener calle por ID
    return this.http.get<ApiResponse<Street>>(`${this.apiUrl}/${id}`); // GET
  }

  getAllByStatus(active: boolean = true): Observable<ApiResponse<Street[]>> { // Obtener calles por estado
    const endpoint = active ? 'active' : 'inactive'; // Define endpoint
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/${endpoint}`).pipe( // GET
      map(response => ({ // Mapear respuesta
        status: response.status, // Estado
        data: response.data.map(item => ({ // Transformar datos
          streetId: item.streeId || item._id, // ID flexible
          name: item.name, // Nombre
          zoneId: item.zoneId, // Zona ID
          zoneName: item.zoneName, // Nombre de zona
          status: item.status, // Estado
          dateRecord: item.dateRecord // Fecha
        }))
      }))
    );
  }

  getAllActive(): Observable<ApiResponse<Street[]>> { // Calles activas
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/active`).pipe(
      map(response => ({ // Mapear respuesta
        status: response.status, // Estado
        data: response.data.map(item => ({ // Convertir data
          streetId: item.streetId || item.streeId || item._id || item.id, // ID flexible
          name: item.name, // Nombre
          zoneId: item.zoneId, // ID zona
          zoneName: item.zoneName, // Nombre zona
          status: item.status, // Estado
          dateRecord: item.dateRecord // Fecha
        }))
      }))
    );
  }

  getAllInactive(): Observable<ApiResponse<Street[]>> { // Calles inactivas
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/inactive`).pipe(
      map(response => {
        if (response.status && response.data && Array.isArray(response.data)) { // Validación
          return {
            status: true,
            data: response.data.map(item => ({ // Convertir data
              streetId: item.streetId || item.streeId || item._id || item.id, // ID
              name: item.name, // Nombre
              zoneId: item.zoneId, // Zona ID
              zoneName: item.zoneName, // Nombre zona
              status: item.status, // Estado
              dateRecord: item.dateRecord // Fecha
            }))
          };
        } else {
          console.error('La respuesta de /inactive no tiene data válida:', response); // Error
          return {
            status: false,
            data: [] // Devuelve vacío
          };
        }
      })
    );
  }

  update(id: string, updateRequest: Partial<{ name: string; zoneId: string; status: boolean }>): Observable<ApiResponse<Street>> {
    return this.http.put<ApiResponse<Street>>(`${this.apiUrl}/${id}`, updateRequest); // Actualizar calle
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`); // Eliminar (lógico)
  }

  activate(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/activate`, {}); // Activar calle
  }

  deactivate(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/deactivate`, {}); // Desactivar calle
  }
}
