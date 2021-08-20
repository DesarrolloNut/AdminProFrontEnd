export class ReporteCanasto {
  constructor() {
    this.tipoRutaId = 0;
    this.tipoRuta = '';
    this.sucursalId = 0;
    this.sucursal = '';
    this.usuario = '';
    this.cantidad = 0;
    this.disponible = 0;
    this.recogidos = 0;
    this.entregados = 0;
  }

  tipoRutaId: number;
  tipoRuta: string;
  sucursalId: number;
  sucursal: string;
  usuario: string;

  cantidad: number;
  disponible: number;
  recogidos: number;
  entregados: number;

}
