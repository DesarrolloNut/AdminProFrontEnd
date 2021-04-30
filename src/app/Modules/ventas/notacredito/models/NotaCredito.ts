export class NotaCreditoArticulos {
  constructor() {
      this.CodigoCliente = ""
      this.CodigoArticulo = ""
      this.CodigoReferencia = ""
      this.Cantidad = 0
      this.SinMovimientoInventario = 0
      this.Comentario = ""
  }
 CodigoCliente: string;
 CodigoArticulo: string;
 CodigoReferencia: string;
 Cantidad: number;
 SinMovimientoInventario: number;
 Comentario: string;
}
export class NotaCreditoServicios {
  constructor() {
      this.CodigoCliente = ""
      this.CodigoCuentaMayor = ""
      this.Cantidad = 0
      this.SinMovimientoInventario = 0
      this.Descripcion = ""
      this.Comentario = ""
   }
 CodigoCliente: string;
 CodigoCuentaMayor: string;
 CodigoReferencia: string;
 Cantidad: number;
 SinMovimientoInventario: number;
 Descripcion: string;
 Comentario: string;
}

export class NotaCredito {
  constructor() {
      this.id = 0;
      this.CodigoCliente = ""
      this.CodigoArticulo = ""
      this.CodigoCuentaMayor = ""
      this.CodigoReferenciaDeudor = ""
      this.Cantidad = 0
      this.SinMovimientoInventario = 0
      this.Descripcion = ""
      this.Comentario = ""
      this.TipoNotaCredito = ""
  }
  id: number;
 CodigoCliente: string;
 CodigoArticulo: string;
 CodigoCuentaMayor: string;
 CodigoReferenciaDeudor: string;
 Cantidad: number;
 SinMovimientoInventario: number;
 Descripcion: string;
 Comentario: string;
 TipoNotaCredito: string;
}
