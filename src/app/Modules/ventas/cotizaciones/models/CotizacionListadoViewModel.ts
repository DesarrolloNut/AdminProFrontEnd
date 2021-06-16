export interface CotizacionListadoViewModel {
    id: number;
    cotizador: string;
    sucursal: string;
    vendedor: string;
    fechaCreacion: string;
    cliente: string;
    clienteDocumento: string;
    subTotal: number;
    descuentoTotal: number;
    impuestoTotal: number;
    totalNeto: number;
    estadoID: number;
}