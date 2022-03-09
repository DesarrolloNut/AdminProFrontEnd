export class ParametrosCita {


    constructor() {
        this.citaID = 0;
        this.sucursalID = 0;
        this.servicioID = 0;
        this.clienteDocumento = "";
        this.documentoTipoID=0;
        this.clienteID=0
    }

    citaID: number
    clienteID?: number
    sucursalID: number
    servicioID: number
    clienteDocumento: string
    documentoTipoID?:number;

}
