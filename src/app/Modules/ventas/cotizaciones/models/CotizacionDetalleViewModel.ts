export interface CotizacionDetalleViewModel {
    id: number;
    cotizacionId: number;
    articuloId: number;
    almacenId: number;
    cantidad: number;
    costo: number;
    precio: number;
    subtotal: number;
    porcientoDescuento: number;
    totalDescuento: number;
    totalImpuesto: number;
    totalNeto: number;
    articulo: string;
    almacen: string;
    articuloCodRef: string;

}