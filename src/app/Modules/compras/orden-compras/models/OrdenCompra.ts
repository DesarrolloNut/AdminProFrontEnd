 
export interface OrdenCompra {
    id: number;
    solicitudCompraID: number;
    codigoReferencia: string;
    departamentoID: number;
    solicitanteID: number;
    solicitanteDepartamentoID: number;
    solicitanteSucursalID: number;
    sucursalID: number;
    estadoID: number;
    fechaSolicitud: string;
    compradorID: number;
    fechaEntrega: Date;
    comentario: string;
    proveedorID: number;
    tipoSolicitudID: number;
    fechaConversion: Date;
    subTotal: number;
    descuentoTotal: number;
    totalNeto: number;
    monedaID: number;
    tasa: number;
}


