import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { IncidenciaResponse, Incidencia } from '../models/incidents'; // Importa tu interfaz

@Injectable({
  providedIn: 'root'
})
export class IncidenciaService {

  private baseUrl = 'https://musical-system-pvx67wgrrxv2657r-8080.app.github.dev/api/v1/incidencias'; // Cambia la URL según tu configuración

  constructor(private http: HttpClient) {}

  // Obtener todas las incidencias (activos e inactivos)
  getAll(): Observable<IncidenciaResponse> {
    return this.http.get<IncidenciaResponse>(this.baseUrl);
  }

  // Obtener incidencias activas
  getAllActive(): Observable<IncidenciaResponse> {
    return this.http.get<IncidenciaResponse>(`${this.baseUrl}/active`);
  }

  // Obtener incidencias inactivas
  getAllInactive(): Observable<IncidenciaResponse> {
    return this.http.get<IncidenciaResponse>(`${this.baseUrl}/inactive`);
  }

  // Obtener incidencia por ID
  getById(id: string): Observable<IncidenciaResponse> {
    return this.http.get<IncidenciaResponse>(`${this.baseUrl}/${id}`);
  }

  // Crear nueva incidencia
  create(incidencia: Incidencia): Observable<IncidenciaResponse> {
    return this.http.post<IncidenciaResponse>(this.baseUrl, incidencia);
  }

  // Actualizar incidencia
  update(id: string, incidencia: Incidencia): Observable<IncidenciaResponse> {
    return this.http.put<IncidenciaResponse>(`${this.baseUrl}/${id}`, incidencia);
  }

  // Eliminación lógica (inactivar)
  deleteLogic(id: string): Observable<IncidenciaResponse> {
    return this.http.delete<IncidenciaResponse>(`${this.baseUrl}/${id}`);
  }

  // Eliminación física
  deletePermanent(id: string): Observable<IncidenciaResponse> {
    return this.http.delete<IncidenciaResponse>(`${this.baseUrl}/${id}/permanent`);
  }

  // Activar incidencia
  activate(id: string): Observable<IncidenciaResponse> {
    return this.http.patch<IncidenciaResponse>(`${this.baseUrl}/${id}/activate`, {});
  }

  // Desactivar incidencia
  deactivate(id: string): Observable<IncidenciaResponse> {
    return this.http.patch<IncidenciaResponse>(`${this.baseUrl}/${id}/deactivate`, {});
  }
}
