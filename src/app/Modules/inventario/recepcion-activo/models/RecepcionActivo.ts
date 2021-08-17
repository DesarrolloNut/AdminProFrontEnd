export class RecepcionActivo {

  construtor() {
    this.usuarioId = 0;
    this.usuario = "";
    this.documento = "";
    this.celular = "";
    this.recogidos = 0;
    this.sucursalId = 0;
    this.sucursal = "";
  }

  usuarioId: number;
  usuario: string;
  documento: string;
  celular: string;
  recogidos: number;
  sucursalId: number;
  sucursal: string;
}
