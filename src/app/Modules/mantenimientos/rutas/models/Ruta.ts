export class Ruta {
  constructor() {
      this.id = 0;
      this.nombre = "";
      this.tipoRuta = 0;
      this.encargado = "";
      this.supervisor = "";
      this.codigoReferencia = "";
      this.estado = false;
  }
  id: number;
  nombre: string;
  tipoRuta: number;
  encargado: string;
  supervisor: string;
  estado: boolean;
  codigoReferencia: string;

}

export class RutaFormulario {
  constructor() {
    this.id = 0;
    this.nombre = "";
    this.tipoRutaId = 0;
    this.supervisorId = 0;
    this.usuarioId = 0;
    this.codigoReferencia = "";
    this.estado = false;
  }
  id: number;
  nombre: string;
  tipoRutaId: number;
  supervisorId: number;
  usuarioId: number;
  codigoReferencia: string;
  estado: boolean;

}
