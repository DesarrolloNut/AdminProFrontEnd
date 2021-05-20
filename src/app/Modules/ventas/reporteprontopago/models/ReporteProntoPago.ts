export class ReporteProntoPago {
  constructor() {
      this.id = 0;
      this.cardCode = ""
      this.docNum = 0
      this.importe = 0
      this.pendiente = 0
      this.ncfafectado = ""
      this.ultimoPago = ""
      this.montoPago = 0
      this.fechaFactura = ""
      this.fechaVenceFactura = ""
      this.cliente = ""
      this.procesada = false
      this.reconciliada = false
  }
  id: number;
  cardCode: string;
  docNum: number;
  importe: number;
  pendiente: number;
  ncfafectado: string;
  ultimoPago: string;
  montoPago: number;
  fechaFactura: string;
  fechaVenceFactura: string;
  cliente: string;
  procesada: boolean;
  reconciliada: boolean;
}
