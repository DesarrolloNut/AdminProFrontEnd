import { FrecuenciaVisita } from './FrecuenciaVisita';
import { Cliente } from 'src/app/Modules/mantenimientos/clientes/models/Cliente';
export class ClienteFrecuencia {

    constructor() {
        this.cliente = new Cliente();
        this.visita = new Array<FrecuenciaVisita>();

    }

    cliente: Cliente;
    visita: Array<FrecuenciaVisita>;


}
