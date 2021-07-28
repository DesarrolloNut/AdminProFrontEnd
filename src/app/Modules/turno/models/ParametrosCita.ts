export class ParametrosCita {


    constructor() {
        this.citaID = 0;
        this.sucursalID = 0;
        this.servicioID = 0;
        this.clienteDocumento = "";
        this.documentoTipoID=0;
    }

    citaID: number
    sucursalID: number
    servicioID: number
    clienteDocumento: string
    documentoTipoID?:number;

}