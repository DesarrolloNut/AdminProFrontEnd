export class OrdenFabricacionVista {

  constructor() {
    this.id = 0;
    this.articuloPadre = "";
    this.articulo = "";
    this.articuloId = 0;
    this.nombre = "";
    this.cantidadBase = 0;
    this.requerida = 0;
    this.disponible = 0;
    this.unidadMedida = "";
    this.almacen = "";
    this.almacenId = 0;
    this.almacenCodigoReferencia = "";
    this.metodoEmision = "";
    this.tipo = "";
    this.fechaCreacion = new Date();
    this.cantidadPlanificada = 0;
    this.consumido = 0;
    this.lote = "";
    this.merma = 0;
    this.costoReal = 0;
    this.costoArticulo = 0;
    this.ordenFabricacionId = 0;
    this.estadoId = 0;
    this.estadoHijoId = 0;
    this.estadoERPExternoId = 0;
    this.noConsumido = 0;
    this.batch = 0;
    this.gestionado = false;
    this.colorHEX = '';
    this.codigoReferencia = "";
    this.cantidadRequerida = 0;
    this.isPesaje = false;
    this.loadingSaveConsumido = false;
    this.cargando = false;
    this.isRPC = false;

  }

  id: number;
  articuloPadre: string;
  articulo: string;
  articuloId: number;
  nombre: string;
  cantidadBase: number;
  requerida: number;
  disponible: number;
  unidadMedida: string;
  almacen: string;
  almacenCodigoReferencia: string;
  almacenId: number;
  metodoEmision: string;
  tipo: string;
  fechaCreacion: Date;
  cantidadPlanificada: number;
  consumido: number;
  lote: string;
  merma: number;
  costoReal: number;
  costoArticulo: number;
  ordenFabricacionId: number;
  estadoId: number;
  estadoHijoId: number;
  estadoERPExternoId: number;
  noConsumido: number;
  batch: number;
  gestionado: boolean;
  colorHEX: String;
  codigoReferencia: String;
  cantidadRequerida: number;
  isPesaje: boolean;
  loadingSaveConsumido: boolean;
  cargando: boolean;
  isRPC: boolean;
}
