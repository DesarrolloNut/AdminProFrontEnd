export interface ComprobanteFiscalListadoViewModel {
    id: number;
    serie: string;
    tipoComprobanteID: number;
    tipoComprobante: string;
    secuenciaDesde: number;
    secuenciaHasta: number;
    fechaVencimiento: string;
    estadoID: number;
    estado: string;
}