export class DespachoPedido {
    constructor() {
        this.id = 0;
        this.sucursalId = 0;
        this.condicionPagoId = 0;
        this.codigoReferencia = "";
        this.clienteId = 0;
        this.fechaCreacion = new Date;
        this.vendedorId = 0;
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
    }

    id = 0;
    sucursalId = 0;
    condicionPagoId = 0;
    codigoReferencia: string;
    clienteId = 0;
    fechaCreacion: Date;
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
}