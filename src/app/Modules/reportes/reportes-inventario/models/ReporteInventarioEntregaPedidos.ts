export interface ReporteInventarioEntregaPedidos {
    clienteCodigoReferencia: string;
    cliente: string;
    direccion: string;
    facturaCodigoReferencia: string;
    totalFactura: number;
    zona: string;
    vendedor: string;
    facturaFechaCreacion: Date;
    facturaFechaEntrega: Date;
    estado: string;
}