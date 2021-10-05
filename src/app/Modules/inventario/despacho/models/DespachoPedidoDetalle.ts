export interface DespachoPedidoDetalle {
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
    estadoId:number;
}