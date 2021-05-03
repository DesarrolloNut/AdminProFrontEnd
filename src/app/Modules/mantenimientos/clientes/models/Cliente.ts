import { ClienteContactos } from './ClienteContactos';
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
        this.documento = ""
        this.fechaNacimiento = ""
        this.fechaRegistrado = ""
        this.codigoReferencia = ""
        this.calle = ""
        this.numero = 0
        this.limiteCredito = 0
        this.condicionPagoId = 0
        this.rutaId = 0
        this.sexo = ""
        this.longitud = ""
        this.latitud = ""
        this.contactos = new Array<ClienteContactos>();

    }


    id: number
    clienteTipoID: number
    documentoTipoID: number
    nombres: string
    apellidos: string
    documento: string
    fechaNacimiento: string
    fechaRegistrado: string
    estadoID: number
    sucursalID: number
    codigoReferencia: string
    provinciaID: number
    ciudadID: number
    sectorID: number
    calle: string
    numero: number
    limiteCredito: number
    condicionPagoId: number
    rutaId: number
    listaPrecioId: number;
    sexo: string
    longitud: string
    latitud: string
    contactos:Array<ClienteContactos>
}
