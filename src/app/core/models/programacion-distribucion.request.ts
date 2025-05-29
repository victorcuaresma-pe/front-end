export interface StreetScheduleRequest {
  calle_id: string;       // ID de la calle (como string)
  zona_id: string;        // ID de la zona (como string)
  hora_inicio: string;    // hora de inicio en formato "HH:mm"
  hora_fin: string;       // hora de fin en formato "HH:mm"
  es_diario: boolean;     // si la distribución es diaria
  observaciones?: string; // observaciones opcionales
  responsable_id: string; // ID del responsable
}
