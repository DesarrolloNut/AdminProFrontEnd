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
  this.estadoId = 0;
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
  estadoId: number;
}
