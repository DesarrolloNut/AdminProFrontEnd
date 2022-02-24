export interface ArticuloPesajeListadoViewModel {
    id: number;
    almacenDesdeID: number;
    almacenHastaID: number;
    articulo: string;
    almacenDesde: string;
    almacenHasta: string;
    pesoCanastos: number;
    pesoBalanza: number;
    pesoNeto: number;
    usuario: string;
    fechaVencimiento: Date;
    estado: string;
    detalleJSON: string;
    lote: string;
}