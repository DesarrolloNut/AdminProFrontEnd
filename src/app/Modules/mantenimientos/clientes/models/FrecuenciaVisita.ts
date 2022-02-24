import { ClienteTabsValida } from "./Cliente";

export class FrecuenciaVisita {

    constructor() {
        this.id = 0;
        this.diaId = 0;
        this.frecuenciaVisitaId = 0;
        this.clienteId = 0;
        this.ordenVisita = 0;
        this.tipoRutaId = 0;
        this.rutaId=0;
        this.dias=[];
    }

    id: number;
    diaId: number;
    frecuenciaVisitaId: number;
    clienteId: number;
    usuarioId: number;

    ordenVisita: number;
    tipoRutaId: number;
    rutaId:number;
    dias:FrecuenciaVisitaFormated[]

}

export class FrecuenciaVisitaFormated {

    constructor() {
        this.diaId = 0;
        this.frecuenciaVisitaId = 0;
        this.clienteId = 0;
        this.ordenVisita = 0;
        this.tipoRutaId = 0;

    }

    diaId: number;
    frecuenciaVisitaId: number;
    clienteId: number;
    usuarioId: number;
    ordenVisita: number;
    tipoRutaId: number;

}
export class FrecuenciaVisitaResponse {

    constructor() {
        this.countId = 0;
        this.clienteTabsValida = new ClienteTabsValida()
    }

    countId: number;
    clienteTabsValida: ClienteTabsValida;

}
