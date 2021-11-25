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

export interface DespachoPreventaDetalleViewModel   {
  fechaEntrega: string;
  canalId: string;
  distribuidor: string;
  distribuidorId: number;
  ruta: number;
  almacen_Origen: string;
  almacenOrigenId: number;
  almacen_Destino: string;
  almacenDestinoId: number;
  codigoArticulo: string;
  articuloId: number;
  articulo: string;
  unidadMedida: string;
  pedido: number;
  despacho: number;
  estadoId: number;
  lote: string;
  selected:boolean;
  page:number;
}

export class DespachoPreventaRequestModel {
  fechaEntrega: string;
  ruta: number;
  almacen_Origen: string;
  almacen_Destino: string;
  articuloId: number;
  lote: string;
  pedido: number;
  despacho: number;
}

export class SAPLoteDespachoPedido   {
  articulo: string;
  almacen: string;
  lote: string;
  fechExpira: string;
  disponible: number;
  cantidadPedida: number;
}
