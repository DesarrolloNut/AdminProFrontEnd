export class TomaInventarioRuta {

  constructor() {
    this.id = 0
    // this.usuarioId = 0
    this.usuario = ""
    this.celular = ""
    this.cantidadCliente = 0
    this.clienteId = 0
    this.cliente = ""
    this.documento = ""
    this.direccion = ""
    this.provinciaId = 0
    this.sectorId = 0
    this.articuloId = 0
    this.cantidad = 0
    this.disponible = 0
    this.fecha = new Date();
    this.merchandising = ""
    this.ruta_Merchandising = 0
    this.vendedor = ""
    this.rutaRecogidaId = 0
    this.recogedor = ""
    this.zonaId = 0
    this.zona = ""
    this.rutaId = 0
    this.diaId = 0
    this.tipoRutaId = 0


  }

  id: number;
  // usuarioId: number;
  usuario: string;
  celular: string;
  cantidadCliente: number;
  clienteId: number;
  cliente: string;
  documento: string;
  direccion: string;
  provinciaId: number;
  sectorId: number;
  articuloId: number;
  cantidad: number;
  disponible: number;
  fecha: Date;
  merchandising: string;
  ruta_Merchandising: number;
  vendedor: string;
  rutaRecogidaId: number;
  recogedor: string;
  zonaId: number;
  zona: string;
  rutaId: number;
  diaId: number;
  tipoRutaId: number;
}
