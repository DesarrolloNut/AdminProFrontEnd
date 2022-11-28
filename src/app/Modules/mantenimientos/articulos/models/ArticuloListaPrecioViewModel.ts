
export class ArticuloListaPrecioViewModel {

  constructor() {
    this.id = 0
    this.nombre = ''
    this.codigoReferencia = ''
    this.costo = 0
    this.unidadMedida = ''
    this.cant=0
}

  id: number;
    nombre: string;
    codigoReferencia: string;
    listaPrecioID: number;
    listaPrecio: string;
    articuloId:number;
    precioSugerido: number;
    precioActual: number;
    precioAnterior: number;
    precioConfirmado: number;
    costo: number;
    fechaAplicacion: string;
    estadoID: number;
    estado: string;
    diasRestantes: number;
    usuarioAutorizacion: string;
    colorEstado: string;

    cargando: boolean;
    imagenUrl: string;
    unidadMedida: string;
    peso:number;
    cant:number;
    cartAdded:boolean;
}
