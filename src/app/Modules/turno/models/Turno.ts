export class Turno {
    constructor() {
        this.id = 0
        this.citaID = 0
        this.estadoID = 0
        this.llamadas = 0
        this.servicioTipoID = 0
        this.prioridadTipoID = 0
        this.posicionID = 0
        this.usuarioID = 0 //la pantalla donde se genera el turno
        this.turnoReservaID = 0
    }


    id: number
    citaID: number
    estadoID: number
    llamadas: number
    servicioTipoID: number
    prioridadTipoID: number
    posicionID: number
    fechaRegistro: string
    horaLlamada: string
    fechaFinalizado: string
    ////RELACIONES
    usuarioID: number
    turnoReservaID: number

}