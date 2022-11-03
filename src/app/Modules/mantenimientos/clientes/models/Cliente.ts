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
        this.clienteNombre = ""
        this.documento = ""
        this.email = ""
        this.fechaNacimiento =  new Date()
        this.fechaRegistrado = new Date()
        this.codigoReferencia = ""
        this.calle = ""
        this.numero = ""
        this.residencial = ""
        this.apartamento = ""
        this.referencia = ""
        this.ciudadID = 0
        this.sectorID = 0
        this.subSectorID = 0
        this.limiteCredito = 0
        this.balance=0
        this.condicionPagoId = 0
        this.condicionPago = ""
        this.plazoId=0
        this.plazo =""
        this.rutaId = 0
        this.listaPrecioId = 0
        this.sexo = ""
        this.longitud = ""
        this.latitud = ""
        this.tipoComprobante=0
        this.sucursalId=0

        this.clientePadreId=0
        this.isClientPrincipal=0
        this.salario=0
        this.updateMobile=0
        this.companiaId=0

    }



    id: number;
    clienteTipoID: number;
    documentoTipoID: number;
    nombres: string;
    apellidos: string;
    clienteNombre: string;
    documento: string;
    email: string;
    fechaNacimiento: Date;
    fechaRegistrado: Date;
    estadoID: number;
    sucursalID: number;
    codigoReferencia: string;
    calle: string;
    numero: string;
    residencial: string;
    apartamento: string;
    referencia: string;
    provinciaID: number;
    ciudadID: number;
    sectorID: number;
    subSectorID: number;
    limiteCredito: number;
    balance:number;
    condicionPagoId: number;
    condicionPago :string;
    plazoId:number
    plazo :string;
    rutaId: number;
    listaPrecioId: number;
    sexo: string;
    longitud: string;
    latitud: string;
    tipoComprobante: number;
    sucursalId: number;
    clientePadreId: number;
    isClientPrincipal: number;
    clientePadreTipoId :number;
    salario: number;
    usuarioId: number;
    updateMobile: number;
    companiaId:number


    // contactos: Array<ClienteContactos>
}

export class ClienteViewModelCustomized {

    constructor() {
        this.id = 0
        this.clienteTipoID = 0
        this.clienteTipo =""

        this.nombres = ""
        this.apellidos = ""
        this.clienteNombre = ""


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
        this.balance=0
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

        this.telefono=""
        this.estadoERPID =0
        this.estadoERP ="";
        this.estadoColorERP="";
        this.clientePadreId = 0;
    }


    id: number;
    clienteTipoID: number;
    clienteTipo: string;

    nombres: string;
    apellidos: string;
    clienteNombre: string;

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
    balance: number;

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

    telefono:string;
    estadoERPID:number;
    estadoERP:string;
    estadoColorERP:string;
    clientePadreId: number;
    loadingAutorizarCambios: boolean;


}



export class Coordenadas {

    constructor() {
        this.longitud = 0.0
        this.latitud =0.0
    }
    latitud: number;
    longitud: number;
}




export class ClienteTabsValida {

    constructor() {
        this.clienteId = 0
        this.tabsValida = []
    }
    clienteId: number;
    tabsValida: TabsValida[];
}
export class TabsValida {

    constructor() {
        this.keyName = ""
        this.ok = false
    }
    keyName: string;
    ok: boolean;
}
export class ClientePedidoEmpleadoVM {

  constructor() {
      this.id = 0
      this.clienteTipoID = 0
      this.documentoTipoID = 0
      this.estadoID = 0
      this.sucursalId = 0
      this.nombres = ""
      this.apellidos = ""
      this.clienteNombre = ""
      this.documento = ""
      this.email = ""
      this.fechaRegistrado = ""
      this.codigoReferencia = ""
      this.limiteCredito = 0
      this.balance=0
      this.condicionPagoId = 0
      this.condicionPago = ""
      this.plazoId=0
      this.plazo =""
      this.rutaId = 0
      this.listaPrecioId = 0
      this.sexo = ""
      this.tipoComprobante=0
      this.sucursalId=0

      this.clientePadreId=0
      this.salario=0

  }



  id: number;
  clienteTipoID: number;
  documentoTipoID: number;
  nombres: string;
  apellidos: string;
  clienteNombre: string;
  documento: string;
  email: string;
  // fechaNacimiento: string;
  fechaRegistrado: string;
  estadoID: number;
  // sucursalID: number;
  codigoReferencia: string;
  limiteCredito: number;
  balance:number;
  condicionPagoId: number;
  condicionPago :string;
  plazoId:number
  plazo :string;
  rutaId: number;
  listaPrecioId: number;
  sexo: string;
  tipoComprobante: number;
  sucursalId: number;
  clientePadreId: number;
  salario: number;
  usuarioId: number;


  // contactos: Array<ClienteContactos>
}
export class ValidaExisteClienteViewModel{
  id: number;
  clienteTipoID: number;
  clienteTipo: string;
  nombres: string;
  clienteNombre: string;
  apellidos: string;
  documento: string;
  email: string;
  telefono: string;
  documentoTipoID: number;
  fechaNacimiento: string;
  sexo: string;
  estadoID: number;
  existeEnWebAdmin:number;
}
