export interface IncidenciaResponse {
  status: boolean;
  data: Incidencia[];
}

export interface Incidencia {
  id: string;
  tipoIncidencia: string;
  descripcion: string;
  zonaId: string;
  zonaNombre: string;
  callesAfectadas: CalleAfectada[];
  fechaInicio: string; // ISO string, o Date si prefieres manejarlo como fecha
  fechaEstimadaSolucion: string;
  fechaSolucionReal: string | null;
  estado: string;
  prioridad: string;
  reportadoPor: string;
  asignadoA: string;
  materialesRequeridos: MaterialRequerido[];
  actualizaciones: Actualizacion[];
  observaciones: string;
  notificado: boolean;
  activo: boolean;
  eliminado: boolean;
  fechaRegistro: string;
}

export interface CalleAfectada {
  calleId: string;
  calleNombre: string;
}

export interface MaterialRequerido {
  nombre: string;
  cantidad: number;
  unidad: string;
}

export interface Actualizacion {
  fecha: string;
  estado: string;
  descripcion: string;
  usuarioId: string;
}
