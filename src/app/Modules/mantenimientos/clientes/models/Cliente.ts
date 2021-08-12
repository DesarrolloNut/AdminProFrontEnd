import { DatePickerComponent } from '@syncfusion/ej2-angular-calendars';
import { ClienteContactos } from './ClienteContactos';
export class Cliente {

    constructor() {
        this.id = 0
        this.clienteTipoID = 0
        this.documentoTipoID = 0
        this.estadoID = 0
        this.sucursalID = 0
        this.provinciaID = 0

        this.nombres = ""
        this.apellidos = ""
        this.documento = ""
        this.email = ""
        this.fechaNacimiento =  ""
        this.fechaRegistrado = ""
        this.codigoReferencia = ""
        this.calle = ""
        this.numero = 0
        this.residencial = ""
        this.apartamento = ""
        this.referencia = ""
        this.ciudadID = 0
        this.sectorID = 0
        this.subSectorID = 0
        this.limiteCredito = 0
        this.condicionPagoId = 0
        this.condicionPago = ""
        this.plazoId=0
        this.plazo =""
        this.rutaId = 0
        this.listaPrecioId = 0
        this.sexo = ""
        this.longitud = ""
        this.latitud = ""
    }

    

    id: number;
    clienteTipoID: number;
    documentoTipoID: number;
    nombres: string;
    apellidos: string;
    documento: string;
    email: string;
    fechaNacimiento: string;
    fechaRegistrado: string;
    estadoID: number;
    sucursalID: number;
    codigoReferencia: string;
    calle: string;
    numero: number;
    residencial: string;
    apartamento: string;
    referencia: string;
    provinciaID: number;
    ciudadID: number;
    sectorID: number;
    subSectorID: number;
    limiteCredito: number;
    condicionPagoId: number;
    condicionPago :string;
    plazoId:number
    plazo :string;
    rutaId: number;
    listaPrecioId: number;
    sexo: string;
    longitud: string;
    latitud: string;
    // contactos: Array<ClienteContactos>
}

export class ClienteViewModelCustomized {

    constructor() {
        this.id = 0
        this.clienteTipoID = 0
        this.clienteTipo =""

        this.nombres = ""
        this.apellidos = ""


        this.documento = ""
        this.documentoTipoID = 0
        this.documentoTipo = ""

        this.estadoID = 0
        this.codigoReferencia = ""
        this.calle = ""
        this.numero = 0
        
        this.provinciaID = 0
        this.provincia =""
  
        this.ciudadID = 0
        this.ciudad =""

        this.sectorID = 0
        this.sector =""

        this.subSectorID = 0
        this.subSector =""

        this.limiteCredito = 0

        this.condicionPagoId = 0
        this.condicionPago = ""
        this.plazoId=0
        this.plazo =""

        this.rutaVendedorId =0;
        this.rutaVendedor ="";
        
        this.rutaEntregaId =0;
        this.rutaEntrega ="";

        this.rutaRecogidaId= 0;
        this.rutaRecogida =""

        this.rutaMerchandisingId =0;
        this.rutaMerchandising =""

        this.longitud = ""
        this.latitud = ""

    }


    id: number;
    clienteTipoID: number;
    clienteTipo: string;

    nombres: string;
    apellidos: string;

    documento: string;
    documentoTipoID: number;
    documentoTipo: string;

    estadoID: number;
    codigoReferencia: string;

    calle: string;
    numero: number;

    provinciaID: number;
    provincia: string;

    ciudadID: number;
    ciudad: string;

    sectorID: number;
    sector: string;
    
    subSectorID: number;
    subSector: string;

    limiteCredito: number;

    condicionPagoId: number;
    condicionPago: string;

    plazoId:number;
    plazo:string;

    rutaVendedorId:number;
    rutaVendedor:string;

    rutaEntregaId:number;
    rutaEntrega:string;

    rutaRecogidaId:number;
    rutaRecogida:string;

    rutaMerchandisingId:number;
    rutaMerchandising:string;


    longitud: string;
    latitud: string;
}

 
 
export class Coordenadas {

    constructor() {
        this.longitud = 0.0
        this.latitud =0.0
    }
    latitud: number;
    longitud: number;
}

