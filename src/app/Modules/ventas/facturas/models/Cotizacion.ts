export class Cotizacion {
    constructor() {
        this.id = 0;
        this.sucursalId = 0;
        this.condicionPagoId = 0;
        this.almacenId=null;
        this.codigoReferencia = "";
        this.clienteId = null;
        this.direccion="";
        this.fechaCreacion = new Date();
        this.fechaEntrega = new Date();
        this.vendedorId = null;
        this.plazoId = 0;
        this.costoTotal = 0;
        this.subtotal = 0;
        this.descuentoTotal = 0;
        this.impuestoTotal = 0;
        this.totalNeto = 0;
        this.monedaId = 0;
        this.tasa = 0;
        this.estadoId = 0;
        this.usuarioId = 0;
        this.listaPrecioID = 0;
        this.estadoAutorizacionID = 0;
        this.clientePlazo = 0;
        this.companiaId=0;
        this.estadoERPID = 1;
    }

    id = 0;
    sucursalId = 0;
    condicionPagoId = 0;
    almacenId:number;
    codigoReferencia: string;
    clienteId = 0;
    direccion:string;
    fechaCreacion: Date;
    fechaEntrega: Date;
    vendedorId = 0;
    plazoId = 0;
    costoTotal = 0;
    subtotal = 0;
    descuentoTotal = 0;
    impuestoTotal = 0;
    totalNeto = 0;
    monedaId = 0;
    tasa = 0;
    estadoId = 0;
    usuarioId = 0;
    listaPrecioID = 0;
    estadoAutorizacionID = 0;
    estadoERPID = 1;
    estadoDespachoID = 0;
    clientePlazo = 0;
    companiaId:number;
   

}