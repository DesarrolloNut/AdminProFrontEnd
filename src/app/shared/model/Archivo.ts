export interface Archivo {
    id: number;
    nombre: string;
    extension: string;
    tamanio: number;
    ubicacion: string;
}

export class FilesUploaded {
     constructor() {
        this.id = 0
        this.name=""
        this.extension=""
        this.size=0
        this.url = ""
        this.uploaded=false
        this.loading=false
    }
    id: number;
    name: string;
    extension: string;
    size: number;
    url: string;
    uploaded:boolean;
    documentoTipoAnexoId:number;
    documentoTipoAnexo :string;
    loading:boolean;
}


export class DocumentosTipoAnexoSelected {
    constructor() {
       this.documentoTipoAnexoId = 0
       this.fileName=""
   }
   documentoTipoAnexoId: number;
   fileName: string;
}




export enum TipoAnexoEnum {
    CLIENTE_FINANZA  = 1,
    CLIENTE_COMERCIO = 2,
    CLIENTE_NEGOCIO = 3,
  }