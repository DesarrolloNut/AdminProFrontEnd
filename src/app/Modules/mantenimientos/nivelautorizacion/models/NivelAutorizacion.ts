export class NivelAutorizacion {
  constructor() {
      this.id = 0;
      this.nombre = ""
      this.nombreModulo = ""
      this.estadoId = 0
  }
  id: number;
  nombre: string;
  nombreModulo: string;
  estadoId: number
}


export class NivelAutorizacionFormulario {
  constructor() {
      this.id = 0;
      this.nombre = ""
      this.nivelAutorizacionModuloId = 0
      this.estadoId = 0
  }
  id: number;
  nombre: string;
  nivelAutorizacionModuloId: number
  estadoId: number
}
