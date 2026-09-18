import { PedidoEmpleado } from "./PedidoEmpleado";

export interface PedidoEmpleadoDetalle {
    id: number;
    cotizacionId: number;
    articuloId: number;
    codigoReferencia: string;
    nombre: string;

    imagenUrl:string;
    almacenId: number;
    peso: number;

    cantidad: number;
    cantidadCalculada?: number;

    costo: number;
    precio: number;
    subtotal: number;
    porcientoDescuento: number;
    totalDescuento: number;
    totalImpuesto: number;
    totalNeto: number;
    unidadMedida:string;
}
export class PedidoEmpleadoRequest {
  pedido:PedidoEmpleado;
  pedidoDetalles?:PedidoEmpleadoDetalle[];
}
