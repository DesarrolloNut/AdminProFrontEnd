export class TransferenciaInventario {
    constructor() {
            this.Id= 0,
            this.ArticuloId = 0,
            this.Fecha = new Date(),
            this.AlmacenOrigenId = 0,
            this.AlmacenDestinoId = 0,
            this.Envio = 0,
            this.Recepcion= 0,
            this.Costo= 0,
            this.EstadoIdERP= null,
            this.Estado= null,
            this.SucursalId= 0,
            this.CompaniaId= 0
            this.UsuarioId= 0  
            this. disabled= false
           
    }
           Id:Number
           ArticuloId: number
           Fecha: Date
           AlmacenOrigenId: number
           AlmacenDestinoId: number
           Envio: number
           Recepcion: number
           Costo: number
           EstadoIdERP: number
           Estado: number
           SucursalId: number
           CompaniaId: number
           UsuarioId: number
           disabled: boolean
}