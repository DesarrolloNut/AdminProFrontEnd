export class ListaMaterialesHeader {

  constructor() {
    this.id = 1;
    this.tipoId = 1;
    this.estadoId = 1;
    this.cantidadPlanificada = 1;
    this.almacenId = 0;
    this.fechaInicio = new Date;
    this.fechaCierre= new Date;
  }

  id: number;
  tipoId: number;
  estadoId: number;
  cantidadPlanificada: number;
  almacenId: number;
  fechaInicio: Date;
  fechaCierre: Date;
}
