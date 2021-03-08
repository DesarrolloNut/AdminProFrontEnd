export class MultipuntoOpcionesViewModel {
    constructor() {
        this.id = 0
        this.opcion = ""
        this.categoria = ""
        this.categoriaPadre = ""
        this.tipoInput1 = ""
        this.tipoInput2 = ""
        this.tipoInput3 = ""

        this.multipuntoEstado = ""
        this.respuesta1 = ""
        this.respuesta2 = ""
        this.respuesta3 = ""
    }

    id: number
    opcion: string
    categoria: string
    categoriaPadre: string
    tipoInput1: string
    tipoInput2: string
    tipoInput3: string

    //respuesta

    respuesta1: any
    respuesta2: any
    respuesta3: any
    multipuntoEstado: any

}