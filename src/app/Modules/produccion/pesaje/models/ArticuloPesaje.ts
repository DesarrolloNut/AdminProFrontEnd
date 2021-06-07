export class ArticuloPesaje {
    constructor() {
        this.id = 0;
        this.articuloID = 0;
        this.fechaVencimiento = new Date();
        this.pesoNeto = 0;
        this.pesoBruto = 0;
        this.detalleJSON = "";
    }

    id: number
    articuloID: number
    almacenID: number
    fechaVencimiento: Date
    pesoBruto: number
    pesoNeto: number
    detalleJSON: string
}