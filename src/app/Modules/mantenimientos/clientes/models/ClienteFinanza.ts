import { ClienteTabsValida } from "./Cliente"

export class ClienteFinanza {

    constructor() {
        this.clienteId           = 0
        this.limiteCredito       = 0
        this.clienteTipoId       = 0

        this.condicionPagoId     = 0
        this.plazoId             = 0
    }


    clienteId           : number
    limiteCredito       : number
    clienteTipoId       : number
    condicionPagoId     : number
    plazoId             : number

}

export class ClienteFinanzaResponse {

    constructor() {
        this.id = 0;
        this.clienteTabsValida = new ClienteTabsValida()  
    }
    id: number;
    clienteTabsValida: ClienteTabsValida;
}