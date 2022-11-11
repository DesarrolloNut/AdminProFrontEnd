import { FrecuenciaVisita, FrecuenciaVisitaFormated } from './FrecuenciaVisita';
import { Cliente } from 'src/app/Modules/mantenimientos/clientes/models/Cliente';
export class ClienteFrecuencia {

    constructor() {
        this.cliente = new Cliente();
        this.visita = new Array<FrecuenciaVisita>();

    }

    cliente: Cliente;
    visita: Array<FrecuenciaVisita>;


}

export class FrecuenciaVisitaCliente {

    constructor() {
        
        this.clienteId = 0;
        this.diaId=0;
        this.companiaId = 0;
        this.diaId = 0;
        this.tipoRutaId=0;
        this.rutaId=0;
        this.frecuenciaVisitaId=0;
       

    }

   
    id: number;
    diaId: number;
    companiaId:number;
    frecuenciaVisitaId: number;
    clienteId: number;
    usuarioId: number;
    ordenVisita: number;
    tipoRutaId: number;
    rutaId:number;
   
}
