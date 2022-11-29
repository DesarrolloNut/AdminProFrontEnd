export class ComboBox {
    codigo: number;
    nombre: string;
    grupo: string;
 
    grupoID: string;
    disabled?:boolean;
    predeterminado?:boolean;
}
export class ComboBoxLote {
  codigo: string;
  nombre: string;
  grupo: string;
  grupoID: number;
  disabled?:boolean;
  predeterminado?:boolean;
}
export class ComboBoxTipoComprobante {
  codigo: number;
  nombre: string;
  otroProp: string;
  grupo: string
  grupoID: string;
  disabled?:boolean;
  predeterminado?:boolean;
}

export class ComboBoxAlmacenCotizacion {
  codigo: number;
  nombre: string;
  otroProp: any;
  grupo: string
  grupoID: string;
  disabled?:boolean;
  predeterminado?:boolean;
}
