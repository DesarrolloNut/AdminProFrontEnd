
export interface ArticuloListaPrecioViewModel {
    id: number;
    nombre: string;
    codigoReferencia: string;
    listaPrecioID: number;
    listaPrecio: string;
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
}