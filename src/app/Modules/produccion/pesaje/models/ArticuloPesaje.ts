
export class ArticuloPesaje {
    constructor() {
        this.id = 0;
        this.articuloID = 0;
        this.almacenDesde = 0
        this.almacenHasta = 0;
        this.pesoCanastos = 0;
        this.pesoNeto = 0;
        this.detalleJSON = "";
        this.pesoBalanza = 0;
        this.usuarioID = 0;
        this.fechaVencimiento = new Date();
        this.estadoID = 0;
        this.lote = "";
    }

    id: number;
    articuloID: number;
    almacenDesde: number;
    almacenHasta: number;
    pesoCanastos: number;
    pesoNeto: number;
    detalleJSON: string;
    pesoBalanza: number;
    usuarioID: number;
    fechaVencimiento: Date;
    estadoID: number;
    lote: string;
}