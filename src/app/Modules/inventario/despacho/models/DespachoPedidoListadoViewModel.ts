export class DespachoPedidoListadoViewModel {
    id: number;
    cotizador: string;
    sucursal: string;
    vendedor: string;
    fechaCreacion: string;
    clienteId: number;
    cliente: string;
    clienteDocumento: string;
    subTotal: number;
    descuentoTotal: number;
    impuestoTotal: number;
    totalNeto: number;
    estadoID: number;
    estado: string;
    estadoAutorizacionId: number;
    confirmado: number;
    loadingCancelPedido:boolean;


}
export class DespachoListadoPreventaVM  {
  fechaEntrega: string;
  canalId: number;
  distribuidorId: number;
  distribuidor: string;
  rutaId: number;
  finalizado: number;
  noEditable: number;
  inUse: boolean;
  pedido: number;
  despacho: number;
  almacen_Origen: number;
  almacen_Destino: number;
  estadoDespacho: number;
  rutasVendedoresDistribuidor:string;
}
