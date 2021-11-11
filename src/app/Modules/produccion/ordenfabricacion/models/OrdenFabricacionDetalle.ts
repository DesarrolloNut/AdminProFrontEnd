export class OrdenFabricacionDetalle {

  constructor(){
    this.id = 0;
    this.ordenFabricacionId = 0;
    this.articuloId = 0
    this.almacenId = 0;
    this.cantidadBase = 0;
    this.cantidadRequerida = 0;
    this.consumido = 0;
    this.lote = "";
    this.merma = 0;
    this.disponible = 0;
    this.unidadMedida = "";
    this.metodoEmisionId = 0;
    this.costoArticulo = 0;
    this.estadoId = 0;
  }

  id: number;
  ordenFabricacionId: number;
  articuloId: number;
  almacenId: number;
  cantidadBase: number;
  cantidadRequerida: number;
  consumido: number;
  lote: string;
  merma: number;
  disponible: number;
  unidadMedida: string;
  metodoEmisionId: number;
  costoArticulo: number;
  estadoId: number;
}
