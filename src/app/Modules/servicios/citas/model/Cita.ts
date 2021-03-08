export class Cita {

    id: number
    citaTipoID: number
    sucursalID: number
    clienteID: number
    fechaRegistro: string
    fechaCita: string
    horaCita: string
    fechaRecepcion: string
    observaciones: string
    kilometraje: number
    combustible: string
    ////RELACIONES
    tagID: number
    asesorID: number
    servicioTipoID: number
    vehiculoID: number
    usuarioCreadorID: number
    usuarioRecibeID: number
    estadoID: number
    origenCitaID: number
    categoriaID: number

}
