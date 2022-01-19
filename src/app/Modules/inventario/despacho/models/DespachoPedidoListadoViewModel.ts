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
  ruta: number;
  rutaId: number;
  finalizado: number;
  noEditable: number;
  inUse: boolean;
  pedido: number;
  despacho: number;
  totalMontoPedido: number;
  totalMontoPedidoERP: number;
  totalMontoDespacho: number;
  almacen_Origen: number;
  almacen_Destino: number;
  estadoDespacho: number;
  rutasVendedoresDistribuidor:string;
  totales:DespachoListadoPreventaVMTotales = new DespachoListadoPreventaVMTotales();
}
export class DespachoListadoPreventaVMTotales {
  fechaEntrega: string;
  sucursalId: number;
  totalPedido: number;
  totalDespacho: number;
  totalERP: number;
}
