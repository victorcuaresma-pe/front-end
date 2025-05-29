import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';

// Interfaces del modelo
export interface ProgramacionDistribucion {
  id: string;
  fecha: string;
  zonaId: string;
  zonaNombre: string;
  estado: string;
  fechaRegistro: string;
}

export interface CreateProgramacionDTO {
  fecha: string;
  zonaId: string;
}

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
  providedIn: 'root'
})
export class ProgramacionDistribucionService {
  obtenerPorId(id: string) {
    throw new Error('Method not implemented.');
  }
  guardar(dto: ProgramacionDistribucion) {
    throw new Error('Method not implemented.');
  }
  activar(id: string) {
    throw new Error('Method not implemented.');
  }
  listarProgramaciones(arg0: boolean) {
    throw new Error('Method not implemented.');
  }
  private apiUrl = 'https://musical-system-pvx67wgrrxv2657r-8080.app.github.dev/api/v1/programacion-distribucion';

  constructor(private http: HttpClient) {}

  create(dto: CreateProgramacionDTO): Observable<ApiResponse<ProgramacionDistribucion>> {
    return this.http.post<ApiResponse<ProgramacionDistribucion>>(this.apiUrl, dto);
  }

  getById(id: string): Observable<ApiResponse<ProgramacionDistribucion>> {
    return this.http.get<ApiResponse<ProgramacionDistribucion>>(`${this.apiUrl}/${id}`);
  }

  getAllByStatus(activo: boolean = true): Observable<ApiResponse<ProgramacionDistribucion[]>> {
    const endpoint = activo ? 'active' : 'inactive';
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/${endpoint}`).pipe(
      map(response => ({
        status: response.status,
        data: response.data.map(item => ({
          id: item.id || item._id,
          fecha: item.fecha,
          zonaId: item.zonaId,
          zonaNombre: item.zonaNombre,
          estado: item.estado,
          fechaRegistro: item.fechaRegistro
        }))
      })),
      catchError(err => {
        console.error('Error al obtener programaciones:', err);
        return of({ status: false, data: [] });
      })
    );
  }

  update(id: string, updateRequest: Partial<CreateProgramacionDTO & { estado: string }>): Observable<ApiResponse<ProgramacionDistribucion>> {
    return this.http.put<ApiResponse<ProgramacionDistribucion>>(`${this.apiUrl}/${id}`, updateRequest);
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  activate(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/activate`, {});
  }

  desactivate(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/desactivate`, {});
  }
}
