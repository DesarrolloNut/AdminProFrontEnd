


export class Promocion {

    constructor() {
        this.id = 0;
        this.nombre = ""
        this.descripcion = ""
        this.estadoID = 0
        this.articuloPromocionID = 0
        this.cantidadPromocion = 0
        this.articuloEntregaID = 0
        this.cantidadEntrega = 0
        this.listaPrecioID = 0
        this.canalID = 0
        this.fechaDesde = new Date()
        this.fechaHasta = new Date()
    }
    id: number;
    nombre: string;
    descripcion: string
    estadoID: number
    articuloPromocionID: number;
    cantidadPromocion: number;
    articuloEntregaID: number;
    cantidadEntrega: number;
    fechaDesde: Date;
    fechaHasta: Date;
    listaPrecioID: number;
    canalID: number;

}
