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
        this.frecuenciaVisitaId= 0;
        this.clienteId= 0;
        this. usuarioId = 0;
        this.ordenVisita = 0;
        this.rutaId = 0;
        this.tipoRutaId = 0;
        this.diaId = 0;
        this.companiaId= 0;
        this.codigoReferencia = "";
        this.visitaLunes = false;
        this.visitaMartes = false;
        this.visitaMiercoles= false;
        this.visitaJueves = false;
        this.visitaviernes = false;
        this.visitaSabado = false;
        this.visitaDomingo = false;

    }

   


   frecuenciaVisitaId: number;
   clienteId : number;
    usuarioId : number;
     ordenVisita : number;
     rutaId : number;
     tipoRutaId : number;
     diaId : number;
    companiaId: number;
    codigoReferencia : string;
     visitaLunes : boolean;
    visitaMartes : boolean;
     visitaMiercoles: boolean;
     visitaJueves : boolean;
    visitaviernes : boolean;
    visitaSabado : boolean;
     visitaDomingo : boolean;

}
export class FrecuenciaVisitaResponse {

    constructor() {
        this.countId = 0;
        this.clienteTabsValida = new ClienteTabsValida()
    }

    countId: number;
    clienteTabsValida: ClienteTabsValida;

}
