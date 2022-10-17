export class SolicitudDevolucionDetalle {
    id: number
    companiaId: number
    numeroFactura:string
    articuloId: string
    descripcion: number
    precio: number
    cantidad:number
    porcientoDescuento:number
    porcientoImpuesto:number
    linea:number
    tipoOperacionArticuloId:number
    almacenId:number
    totalNeto:number
    totalDescuento :number
    totalImpuesto :number
    subtotal:number
    destalleFacturaSelecionada:boolean
    usuarioId : number
    sucursalId: number
    facturaId:number
    cantidadFijo:number
    hayErrores: boolean
}


