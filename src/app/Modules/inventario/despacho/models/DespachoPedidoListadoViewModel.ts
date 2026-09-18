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
  sync:boolean;
  estadoERP: number;
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
  fechacreacion: string;
  totales:DespachoListadoPreventaVMTotales = new DespachoListadoPreventaVMTotales();

  sucursalID:number;
  despachador?:string;
  validador?:string;
  // despachoDispositivo:boolean;
  // fechaInicioDespachador:string;
  // fechaFinDespachador:string;
  // fechainicioValidador:string;
  // fechaFinalizacionValidador:string;
  // // Tiempo_Picking:string;
  // // Tiempo_Validacion:string;
  // // Tiempo_Total:string;


}



export class DespachoListadoPreventaAsignacionVM  {
  fechaEntrega: string;
  canalId: number;
  distribuidorId: number;
  distribuidor: string;
  ruta: number;
  rutaId: number;
  finalizado: number;
  sync:boolean;
  estadoERP: number;
  noEditable: number;
  inUse: boolean;
  pedido: number;
  despacho: number;
  almacen_Origen: number;
  almacen_Destino: number;
  estadoDespacho: number;

  totalMontoPedido: number;
  totalMontoPedidoERP: number;
  totalMontoDespacho: number;
  sucursalID:number;
  despachador?:string;
  validador?:string;
  despachoDispositivo:boolean;
  fechaInicioDespachador:string;
  fechaFinDespachador:string;
  fechainicioValidador:string;
  fechaFinalizacionValidador:string;
  prioridadOrden:number;
  // Tiempo_Picking:string;
  // Tiempo_Validacion:string;
  // Tiempo_Total:string;


  estadoAsignacion:number;
  estadoAsignacionMsg:string;

}

export class DespachoListadoPreventaVMTotales {
  fechaEntrega: string;
  sucursalId: number;
  totalPedido: number;
  totalDespacho: number;
  totalERP: number;
}
export class DepachoHorasVM   {
  diaNombre: string;
  horaDesde: HoraTimeObject;
   horaDesdeSTR: string;
  horaHasta: HoraTimeObject;
  horaHastaSTR: string;
  horaActual: HoraTimeObject;
  horaActualSTR: string;
  puedeDespachar: boolean;
  HorarioEstablecido: boolean;
  id :number;
  hayHorario:boolean;
}
export class HoraTimeObject   {
  hours: number;
  minutes: number;
  seconds: number;
  ticks: number;
}
