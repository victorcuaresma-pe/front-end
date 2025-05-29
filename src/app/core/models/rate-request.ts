export interface RateRequest {
  zoneId: string;  // Id de la zona a la que pertenece a la tarifa
  amount: number;
  description: string;
  rateType: string;
  startDate: Date;
  endDate: Date;
}
