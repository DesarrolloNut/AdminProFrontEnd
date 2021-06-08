export interface CotizacionDetalle {
    id: number;
    cotizacionID: number;
    articuloID: number;
    almacenID: number;
    cantidad: number;
    costo: number;
    precio: number;
    subTotal: number;
    porcientoDescuento: number;
    descuento: number;
    total: number;
}