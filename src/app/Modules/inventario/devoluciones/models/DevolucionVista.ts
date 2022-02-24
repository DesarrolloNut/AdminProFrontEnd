export class DevolucionVista {

  constructor() {
    this.id = 0;
    this.cliente = '';
    this.vendedor = '';
    this.clienteDocumento = '';
    this.fechaCreacion = '';
    this.estado = '';
    this.estadoId = 0;
    this.sucursal = '';
    this.costoTotal = 0;
    this.subtotal = 0;
    this.descuento = 0;
    this.impuesto = 0;
    this.total = 0;
  }

  id: number;
  cliente: string;
  vendedor: string;
  clienteDocumento: string;
  fechaCreacion: string;
  estadoId: number;
  estado: string;
  sucursal: string;
  costoTotal: number;
  subtotal: number;
  descuento: number;
  impuesto: number;
  total: number;
  cargando: boolean;
}
