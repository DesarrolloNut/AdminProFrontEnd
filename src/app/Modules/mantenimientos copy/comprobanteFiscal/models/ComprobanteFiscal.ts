export interface ComprobanteFiscal {
    id: number;
    serie: string;
    tipoComprobanteID: number;
    secuenciaDesde: string;
    secuenciaHasta: string;
    fechaVencimiento: string;
    estadoID: number;
    CompaniaId:number;
}