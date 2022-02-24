export interface OrdenCompraListadoViewModel {
    id: number;
    codigoReferencia: string;
    tipo: string;
    tipoID: number;
    estadoID: number;
    departamentoDestino: string;
    sucursalDestino: string;
    departamentoSolicitante: string;
    sucursalSolicitante: string;
    solicitante: string;
    solicitanteID: number;
    estado: string;
    comprador: string;
    compradorID: number;
    proveedor: string;
    fechaSolicitud: string;
}