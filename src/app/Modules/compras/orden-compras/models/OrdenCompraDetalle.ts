export class OrdenCompraDetalle {
    constructor(){
        this.id = 0;
        this.articuloID = 0;
        // this.costo = 0;
        // this.cantidad = 0;
    }
    id: number;
    articuloID: number;
    nombre: string;
    costo: number;
    descuentoPorciento: number;
    cantidad: number;

    subTotal: number;
    descuentoTotal: number;
    totalImpuesto: number;
    totalNeto: number;

    unidadMedidaID: number;
    cantidadAprobada: number;

}