export class SolicitudCompraListadoViewModel {
    constructor() {

    }

    id: number
    solicitanteID: number
    compradorID: number
    codigoReferencia: string
    departamentoDestino: string
    sucursalDestino: string
    departamentoSolicitante: string
    sucursalSolicitante: string
    solicitante: string
    estado: string
    tipo: string
    tipoID: number
    estadoID: number
    comprador: string
    proveedor: string
    fechaSolicitud: Date
    // fechaEntrega: Date
    cargando: boolean

}