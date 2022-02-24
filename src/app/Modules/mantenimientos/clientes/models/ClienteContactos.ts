import { ClienteTabsValida } from "./Cliente"

export class ClienteContactos {

    constructor() {
        this.id = 0
        this.nombres=""
        this.apellidos=""
        this.documento=""
        this.documentoTipoID=0
        this.email = ""
        this.telefono = ""
        this.celular = ""
        this.clienteId = 0
        this.puestoId  = 0
        this.otros =""
        this.cargando=false
    }


    id: number
    nombres: string
    apellidos : string
    documento : string
    documentoTipoID: number
    email : string
    telefono: string
    celular: string
    clienteId: number
    puestoId: number
    otros: string
    cargando:boolean;
}
export class ClienteContactosRequest {

    constructor() {
        this.clienteId = 0
        this.CantRegistrados=0;
        this.contactos=[]
    }


    clienteId: number;
    usuarioId: number;
    CantRegistrados:number;
    contactos: ClienteContactos[];
}
export class ContactosResponse {

    constructor() {
        this.id = 0;
        this.clienteTabsValida = new ClienteTabsValida()
    }

    id: number;
    clienteTabsValida: ClienteTabsValida;

}
