export class SolicitudArticuloDetalle {
    constructor() {
    this.id=0
    this.companiaId=0
    this.numeroFactura=""
    this.articuloId=0
   
    this.descripcion=""
    this.precio=0
    this.cantidad=0
    this.porcientoDescuento=0
    this.porcientoImpuesto=0
    this.linea=0
    this.tipoOperacionArticuloId=0
    this.almacenId=0
    this.totalNeto=0
    this.totalDescuento =0
    this.totalImpuesto =0
    this.subtotal=0
    this.destalleFacturaSelecionada=false
    this.usuarioId =0
    this.sucursalId=0
    this.facturaId=0
    this.cantidadFijo=0
    this.hayErrores=false 
    this.nombre="" 
    this.codigoReferencia=""
    this.almacenDestinoId=0
    this.estadoERPID=0
    }
   

    id: number
    companiaId: number
    numeroFactura:string
    articuloId: number
    descripcion: string
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
    nombre:string
    codigoReferencia:string
    almacenDestinoId:number
    estadoERPID:number
    

}