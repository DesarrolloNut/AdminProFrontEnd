export interface FacturaDetalle {
    id: number;
    cotizacionId: number;
    articuloId: number;
    almacenId: number;
    cantidad: number;
    costo: number;
    precio: number;
    subtotal: number;
    porcientoDescuento: number;
    porcientoDescuentoBase: number;
    totalDescuento: number;
    totalImpuesto: number;
    totalNeto: number;
    codigoReferenciaArticulo:string
    inventario:number;
    hayErroresCantidad:boolean;
    hayErroresPorcientoDescuento:boolean;
    companiaId:number;
    porcientoImpuesto:number;
    porcientoDescuentoSol:number;
    estadoAutorizadoId:number;
    nombre:string;
    descuentoAutorizado:boolean;
    linea:number
   
}