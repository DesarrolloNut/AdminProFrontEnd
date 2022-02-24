export interface PedidoEmpleadoDetalle {
    id: number;
    cotizacionId: number;
    articuloId: number;
    codigoReferencia: string;
    nombre: string;

    imagenUrl:string;
    almacenId: number;
    cantidad: number;
    costo: number;
    precio: number;
    subtotal: number;
    porcientoDescuento: number;
    totalDescuento: number;
    totalImpuesto: number;
    totalNeto: number;
}
