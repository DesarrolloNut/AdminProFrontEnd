export class SolicitudArticuloDetalle {
    constructor() {
       
            this.almacenId = 0,
            this.articuloId = 0,
            this.codigoReferencia = "",
            this.companiaID = 0,
            this.costo = 0,
            this.enTransito= 0,
            this.inventario= 0,
            this.inventarioTipoId= 0,
            this.nombre= "",
            this.unidadMedida= "",
            this.envio= 0,
            this.hayErrores=false,
            this.gestionado =false,    
            this.lotesSeleccionado=false
            this.usuarioIdRecibe=0
            this.fechaRecepcion= new Date()
            this.solicitado= 0
            this.recepcion=0
            this.estado=0
            this.codigoreferenciaAlmacenDestino = ""
    }
    almacenId: number
    articuloId: number
    codigoReferencia: string
    companiaID: number
    costo: number
    enTransito: number
    inventario: number
    inventarioTipoId: number
    nombre: string
    unidadMedida: string
    envio: number
    hayErrores:boolean
    gestionado:boolean
    lotesSeleccionado:boolean
    usuarioIdRecibe:number
    fechaRecepcion:Date
    solicitado:number
    recepcion:number
    estado:number
    codigoreferenciaAlmacenDestino:string
    

}