export class SolicitudDevolucion {
    constructor() {
        this.id =0
        this.companiaId=0
        this.clienteId=0
        this.codigoreferenciaCliente=""
        this.cliente= ""
        this.codigoReferenciaFactura= ""
        this.facturaId= 0
        this.secuenciaFactura= "" 
        this.NCF=""
        this.fechaCreacion = ""  
        this.totalNetoFactura = 0 
        this.costoTotal = 0 
        this.subTotal= 0
        this.impuestoTotal=0
        this.monedaId=0
        this.numeroFactura=""
        this.sucursalId=0
        this.usuarioId=0
        this.estadoERPID =0
        this.fechaDocumento=new Date
        this.descuentoTotal =0
        this.subtotal =0
        this.totalNeto =0
        this.fechaRegistro = new Date
        this.estadoId =0
        this.comentario =""
        this.preFijo =""
        this.tasa =0
        this.archivoAnexo=null;
        this.tipoSolicitudDevolucionId=0;
        this.almacenId=0
        this.almacenDestinoId=0
        
           
    }
    id :number
    companiaId:number
    clienteId:number
    codigoreferenciaCliente:string
    cliente: string
    codigoReferenciaFactura: string
    facturaId: number
    secuenciaFactura: string 
    NCF:string
    fechaCreacion : string  
    totalNetoFactura : number 
    costoTotal : number 
    subTotal: number
    impuestoTotal:number
    monedaId:number
    numeroFactura:string
    sucursalId:number
    usuarioId:number
    estadoERPID :number
    fechaDocumento:Date
    descuentoTotal :number
    subtotal :number
    totalNeto :number
    fechaRegistro :Date
    estadoId :number
    comentario :string
    preFijo :string
    tasa :number
    archivoAnexo: File
    archivoAnexoURL:string;
    tipoSolicitudDevolucionId:number;
    almacenId:number
    almacenDestinoId:number
    
    
  
   




        
         
}