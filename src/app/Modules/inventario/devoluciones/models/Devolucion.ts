export class Devolucion {

  constructor() {
    this.id = 0;
    this.sucursalId = 0;
    this.condicionPagoId = 0;
    this.codigoReferencia = '';
    this.clienteId = 0;
    this.fechaCreacion = '';
    this.vendedorId = 0;
    this.plazoId = 0;
    this.costoTotal = 0;
    this.subtotal = 0;
    this.descuento = 0;
    this.impuesto = 0;
    this.total = 0;
    this.monedaId = 0;
    this.tasa = 0;
    this.estadoId = 0;
    this.usuarioId = 0;
    this.listaPrecioID = 0;
  }

  id: number;
  sucursalId: number;
  condicionPagoId: number;
  codigoReferencia: string;
  clienteId: number;
  fechaCreacion: string;
  vendedorId: number;
  plazoId: number;
  costoTotal: number;
  subtotal: number;
  descuento: number;
  impuesto: number;
  total: number;
  monedaId: number;
  tasa: number;
  estadoId: number;
  usuarioId: number;
  listaPrecioID: number;
}
