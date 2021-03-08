export class Cliente {

    constructor() {
        this.id = 0
        this.clienteTipoID = 0
        this.documentoTipoID = 0
        this.estadoID = 0
        this.sucursalID = 0
        this.provinciaID = 0
        this.ciudadID = 0
        this.sectorID = 0
        this.nombres = ""
        this.apellidos = ""
        this.celular = ""
        this.documento = ""
        this.fechaNacimiento = ""
        this.fechaRegistrado = ""
        this.email = ""
        this.codigoReferencia = ""
    }


    id: number
    clienteTipoID: number
    documentoTipoID: number
    nombres: string
    apellidos: string
    celular: string
    documento: string
    fechaNacimiento: string
    fechaRegistrado: string
    estadoID: number
    sucursalID: number
    email: string
    codigoReferencia: string
    provinciaID: number
    ciudadID: number
    sectorID: number
}