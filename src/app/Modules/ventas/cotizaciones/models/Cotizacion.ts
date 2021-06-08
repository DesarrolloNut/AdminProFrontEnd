 export interface Cotizacion {
    id: number;
    sucursalID: number;
    condicionPagoID: number;
    codigoReferencia: string;
    clienteID: number;
    fechaCreacion: string;
    vendedorID: number;
    plazoID: number;
    costoTotal: number;
    subTotal: number;
    descuentoTotal: number;
    impuesto: number;
    total: number;
    monedaID: number;
    tasa: number;
    estadoID: number;
    usuarioID: number;
    listaPrecioID: number;
}