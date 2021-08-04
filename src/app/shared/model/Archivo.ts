export interface Archivo {
    id: number;
    nombre: string;
    extension: string;
    tamanio: number;
    ubicacion: string;
}


export enum TipoAnexoEnum {
    CLIENTE_FINANZA  = 1,
    CLIENTE_COMERCIO = 2
  }