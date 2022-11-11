export class Oferta {
    constructor() {
        this.id = 0
        this.nombre = ""
        this.descripcion = ""
        this.margenPorciento = 0
        this.estadoID = 0
    }
    id: number
    nombre: string
    descripcion: string
    margenPorciento: number
    fechaInicio: string
    fechaFinal: string
    estadoID: number
}