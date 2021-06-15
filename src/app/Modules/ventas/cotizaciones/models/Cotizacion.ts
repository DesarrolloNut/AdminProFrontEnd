export interface Cotizacion {
    id: number;
    sucursalId: number;
    condicionPagoId: number;
    codigoReferencia: string;
    clienteId: number;
    fechaCreacion: string;
    vendedorId: number;
    plazoId: number;
    costoTotal: number;
    subtotal: number;
    descuentoTotal: number;
    impuestoTotal: number;
    totalNeto: number;
    monedaId: number;
    tasa: number;
    estadoId: number;
    usuarioId: number;
    listaPrecioID: number;
}