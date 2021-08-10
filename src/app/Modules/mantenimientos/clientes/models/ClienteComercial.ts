export class ClienteComercial {

    constructor() {
        this.clienteId = 0
        this.listaPrecioId  = 0
        this.negociaciones  = []
    }


    clienteId: number
    listaPrecioId: number
    negociaciones: ClienteNegociacion[]
    cantRegistrados?:number

}
export class ClienteNegociacion {

    constructor() {
        this.id = 0
        this.articuloId  = 0
        this.negociacionClienteId  = 0
        this.monto  = 0
        this.comentario = ""
        
    }


    id: number
    articuloId: number
    negociacionClienteId: number
    monto: number
    comentario: string
}
 