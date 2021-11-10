export interface CotizacionListadoViewModel {
    id: number;
    codigoReferencia: number;
    cotizador: string;
    sucursal: string;
    vendedor: string;
    fechaCreacion: string;

    cliente: string;
    clienteId: number;
    clienteDocumento: string;
    limiteCredito: number;
    balanceCliente: number;

    subTotal: number;
    descuentoTotal: number;
    impuestoTotal: number;
    totalNeto: number;
    estadoID: number;
    estadoAutorizacionId: number;
    confirmado: number;

    cargando: boolean;

    fechaUltimaFactura: Date;
    diasUltimaFechaFactura: number;

    tipoPromesaID: number;
    fechaPromesa: Date;

}
