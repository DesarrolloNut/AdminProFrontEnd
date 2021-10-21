export class OrdenFabricacion {

constructor(){
  this.id = 0;
  this.ordenFabricacionTipoId = 0;
  this.codigoReferencia = "";
  this.articuloId = 0;
  this.almacenId = 0;
  this.fechaCreacion = new Date();
  this.fechaInicio = new Date();
  this.fechaCierre = new Date();
  this.cantidad = 0;
  this.costoReal = 0;
  this.cantidadProducida = 0;
  this.lote = "";
  this.batch = 0;
  this.turno = 1;
  this.estadoId = 0;
  this.estadoERPExternoId = 0;
  this.usuarioId = 0;
}


  id: number;
  ordenFabricacionTipoId: number;
  codigoReferencia: string;
  articuloId: number;
  almacenId: number;
  fechaCreacion: Date;
  fechaInicio: Date;
  fechaCierre: Date;
  cantidad: number;
  costoReal: number;
  cantidadProducida: number;
  lote: string;
  batch: number;
  turno: number;
  estadoId: number;
  estadoERPExternoId: number;
  usuarioId: number;
}
