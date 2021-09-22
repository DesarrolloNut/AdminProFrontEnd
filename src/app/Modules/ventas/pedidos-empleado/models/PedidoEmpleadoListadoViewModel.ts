export interface PedidoEmpleadoListadoViewModel {
    id: number;
    cotizador: string;
    sucursal: string;
    vendedor: string;
    fechaCreacion: string;
    clienteId: number;
    cliente: string;
    clienteDocumento: string;
    subTotal: number;
    descuentoTotal: number;
    impuestoTotal: number;
    totalNeto: number;
    estadoID: number;
    estado: string;
    estadoAutorizacionId: number;
    confirmado: number;
    loadingCancelPedido:boolean;
}
