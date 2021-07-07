export class TomaInventarioRuta {
  constructor() {
    this.clienteId = 0;
    this.cliente = '';
    this.direccion = '';
    this.cantidad = 0;
    this.disponible = 0;
    this.fecha = '';
    this.merchandising = '';
    this.vendedor = '';
    this.rutaRecogidaId = 0;
    this.usuarioId = 0;
    this.recogedor = '';
    this.diaId = 0;
    this.ordenVisita = 0;
    this.zona = '';
    this.editarUsuarioConfirmado = true;
    this.cancelarUsuarioConfirmado = false;
    this.cambioUsuarioConfirmado = false;
  }

  clienteId: number;
  cliente: string;
  direccion: string;
  cantidad: number;
  disponible: number;
  fecha: string;
  merchandising: string;
  vendedor: string;
  rutaRecogidaId: number;
  usuarioId: number;
  recogedor: string;
  diaId: number;
  ordenVisita: number;
  zona: string;
  editarUsuarioConfirmado: boolean;
  cancelarUsuarioConfirmado: boolean;
  cambioUsuarioConfirmado: boolean;

}






