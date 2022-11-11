export class CargaMasiva {

    constructor() {
        this.id = 0;
        this.tipoCargaMasiva = "";
        this.registros = 0;
        this.detalle = "";
        this.fechaSubida = new Date();
    }

    id: number
    tipoCargaMasiva: string
    registros: number
    detalle: string
    fechaSubida: Date
}
export class DetalleReestructuracionClient {

    constructor() {
        this.clienteId = 0;
        this.codigoReferencia = "";
        this.nombres = "";

        this.rutaNombreAnterior = "";
        this.rutaNombre = "";

        this.rutaCodigoReferenciaAnterior = 0;
        this.rutaCodigoReferencia = 0;

        this.diaVisitaAnterior = 0;
        this.diaVisita = 0;

        this.reestructuraRutasEstadoId = 0;
    }

    clienteId: number
    codigoReferencia: string
    nombres: string

    rutaNombreAnterior: string
    rutaNombre: string
    
    rutaCodigoReferenciaAnterior: number
    rutaCodigoReferencia: number

    diaVisitaAnterior: number
    diaVisita: number

    reestructuraRutasEstadoId: number
}
