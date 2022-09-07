export class LoteAlmacen {
    constructor() {
            this.id= 0,
            this.articuloID = 0,
            this.fechaExpira = new Date(),
            this.fechaResgistro = new Date(),
            this.cantidad = 0,
            this.recepcion = 0,
            this.cantidadEnvio = 0,
            this.almacenID = 0,
            this.inventario = 0,
            this.hayErrores=false,
            this.moduloId= 0
    }
           id:Number
           articuloID: number
           fechaExpira: Date
           cantidad: number
           inventario: number 
           almacenID : number  
           cantidadEnvio : number 
           lote : string 
           fechaResgistro: Date
           hayErrores:boolean
           moduloId: number
           recepcion: number
}


