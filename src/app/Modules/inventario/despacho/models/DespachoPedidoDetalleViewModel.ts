export interface DespachoPedidoDetalleViewModel {
    id: number;
    cotizacionId: number;
    articuloId: number;
    almacenId: number;
    cantidad: number;
    cantidadDespacho: number;

    costo: number;
    precio: number;
    subtotal: number;
    porcientoDescuento: number;
    totalDescuento: number;
    totalImpuesto: number;
    totalNeto: number;
    unidadMedida: string;
    articulo: string;
    almacen: string;
    selected:boolean;
    codigoReferencia: string;
    estadoId:number;
    estado:string;
    estadoColor:string;
}
export interface DespachoPedidoDetalleArticuloViewModel {
    DespachoDetalleId: number;
    DespachoId: number;
    articuloId: number;
    almacenId: number;
    pedido: number;
    despacho: number;
    articulo: string;
    codigoReferencia: string;
    unidadMedida: string;
    almacen: string;
    selected:boolean;

}
export interface DespachoPreventaDetalleViewModel  {
  fechaCreacion: string;
  distribuidorId: number;
  articuloId: number;
  articulo: string;
  almacenId: number;
  codigoReferencia: string;
  unidadMedida: string;
  pedido: number;
  despacho: number;
  estadoId: number;
  selected:boolean;

}
