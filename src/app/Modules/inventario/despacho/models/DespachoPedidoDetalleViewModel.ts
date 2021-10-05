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
    cantidad: number;
    cantidadDespachada: number;
    articulo: string;
    codigoReferencia: string;
    almacen: string;
    selected:boolean;

}