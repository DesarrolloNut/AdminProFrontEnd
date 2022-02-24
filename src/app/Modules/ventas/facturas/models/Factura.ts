export interface Factura {
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
    descuento: number;
    impuesto: number;
    total: number;
    monedaId: number;
    tasa: number;
    estadoId: number;
    usuarioId: number;
    listaPrecioID: number;
    entregada: number;
    fechaEntrega: Date;
    usuarioEntregaId: number;
    pagos: number;
    fechaVencimiento: Date;
    diasVencimiento: number;
    codigoDocNum: string;
}