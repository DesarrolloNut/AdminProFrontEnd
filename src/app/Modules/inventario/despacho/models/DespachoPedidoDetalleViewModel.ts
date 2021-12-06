export class DespachoPedidoDetalleViewModel {
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
export class DespachoPedidoDetalleArticuloViewModel {
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

export class DespachoPreventaDetalleViewModel   {
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
  peso: number;
  ubicacion: number;
  estadoId: number;
  lote: string;
  noTieneLote:boolean;
  selected:boolean;
  page:number;
}
export class DespachoPreventaDetalleExcelVM   {
  FechaEntrega?: string;
  CodigoArticulo: string;
  Descripcion: string;
  Almacen_Desde: string;
  Almacen_Hasta: string;
  Unidad: string;
  Peso: number;
  Pedido: number;
  Despacho: number;
  Lote: string;
}
export class DespachoPreventaRequestModel {
  fechaEntrega: string;
  ruta: number;
  usuarioId:number;
  estadoId:number;
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
