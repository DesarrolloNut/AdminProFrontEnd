export interface Archivo {
    id: number;
    nombre: string;
    extension: string;
    tamanio: number;
    ubicacion: string;
}

export interface FilesUploaded {
    id: number;
    name: string;
    extension: string;
    size: number;
    url: string;
    uploaded:boolean;
}


export enum TipoAnexoEnum {
    CLIENTE_FINANZA  = 1,
    CLIENTE_COMERCIO = 2
  }