export interface ArticuloListaPrecioViewModel {
    id: number;
    nombre: string;
    codigoReferencia: string;
    listaPrecioID: number;
    listaPrecio: string;
    precio: number;
    precioAnterior: number;
    costo: number;
    fechaAplicacion: string;
    estadoID: number;
    estado: string;
    diasRestantes: number;
    cargando: boolean;
    usuarioAutorizacion: string;
}