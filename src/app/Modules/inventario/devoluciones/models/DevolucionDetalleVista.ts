export class DevolucionDetalleVista {

  constructor() {
    this.id = 0;
    this.devolucionId = 0;
    this.articuloId = 0;
    this.articulo = '';
    this.almacen = '';
    this.cantidad = 0;
    this.costo = 0;
    this.precio = 0;
    this.subtotal = 0;
    this.porcientoDescuento = 0;
    this.descuento = 0;
    this.impuesto = 0;
    this.total = 0;
    this.cantidadConfirmado = 0;
  }

  id: number;
  devolucionId: number;
  articuloId: number;
  articulo: string;
  almacen: string;
  cantidad: number;
  costo: number;
  precio: number;
  subtotal: number;
  porcientoDescuento: number;
  descuento: number;
  impuesto: number;
  total: number;
  cantidadConfirmado: number;
}
