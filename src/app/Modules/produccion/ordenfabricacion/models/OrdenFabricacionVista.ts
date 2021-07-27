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
    this.metodoEmision = "";
    this.tipo = "";
    this.fechaCreacion = new Date();
    this.cantidadPlanificada = 0;
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
  almacenId: number;
  metodoEmision: string;
  tipo: string;
  fechaCreacion: Date;
  cantidadPlanificada: number;
}
