export class ReporteInventarioActivo{
  constructor() {
      this.codigo = ""
      this.cliente = ""
      this.direccion = ""
      this.zona = ""

      this.entregados = 0
      this.devueltos = 0
      this.disponible = 0
      this.balance = 0

  }

  codigo: string;
  cliente: string;
  direccion: string;
  zona: string;

  entregados: number;
  devueltos: number;
  disponible: number;
  balance: number;

}
