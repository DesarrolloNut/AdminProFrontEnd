

export class Articulo {
  id: number;
  nombre: string;
  descripcion: string;
  codigoReferencia: string;
  marcaID: number;
  tipoArticuloID: number;
  estado: boolean;
  categoriaID: number;
  familiaID: number;
  impuestoId: number;
  precio: number;
  costo: number;
  costoObjetivo: number;
  articuloDeCompra: boolean;
  articuloDeVenta: boolean;
  articuloDeInventario: boolean;
  articuloActivoFijo: boolean;
  unidadMedida: string;
  unidadMedidaId: number;
  codigoBarra: string;
  articuloDeReproceso: boolean;
  peso: number;
  ubicacion: number;
  imagenUrl: string;
  gestionado: boolean;
  companiaID: number;
}


export class ArticuloListadoViewModel  {
  id: number;
  nombre: string;
  descripcion: string;
  codigoReferencia: string;
  codigoBarra: string;
  tipoArticuloID: number;
  marcaID: number;
  categoriaID: number;
  familiaID: number;
  impuestoId: number;
  tipo: string;
  marca: string;
  categoria: string;
  familia: string;
  impuesto: string;
  unidadMedida: string;
  unidadMedidaId: number;
  imagenUrl: string;
  estado: boolean;
  companiaID: number;
}
