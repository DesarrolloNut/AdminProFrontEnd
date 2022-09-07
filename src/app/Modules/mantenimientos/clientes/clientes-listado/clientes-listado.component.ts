import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { NgxPermissionsService } from 'ngx-permissions';
import { Parametro } from 'src/app/core/http/model/Parametro';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { ResponseContenido } from 'src/app/core/http/model/ResponseContenido';
import { Cliente, ClienteViewModelCustomized } from '../models/Cliente';
import { ParametrosCita } from 'src/app/Modules/turno/models/ParametrosCita';
import { ComboBox } from 'src/app/shared/model/ComboBox';
import { AuthenticationService } from 'src/app/core/authentication/service/authentication.service';
import { EstadosGeneralesKeyEnum } from 'src/app/shared/enums/EstadosGeneralesKeyEnum';

@Component({
  selector: 'app-clientes-listado',
  templateUrl: './clientes-listado.component.html',
  styleUrls: ['./clientes-listado.component.scss']
})
export class ClientesListadoComponent implements OnInit {

  // COPIAR AL CREAR UN LISTADO NUEVO
  Search: string = "";
  paginaNumeroActual = 1;
  Cargando: boolean = false;
  totalPaginas: number = 0;
  paginaSize: number = 5;
  paginaTotalRecords: number = 0;
  arrayLoading = new Array(this.paginaSize);
  clientes: Cliente[] = [] //tu modelo
  tipos:ComboBox[]=[];
  tipo:number=1;
  usuarioId:number=0;
  showButtonAutorizar = false;


  estadosERP:ComboBox[]=[];
  estadoERPSelected=4

  constructor(private toastService: ToastrService,
    private httpService: BackendService,
    public permissionsService: NgxPermissionsService,
    private authService: AuthenticationService
  ) { }


  ngOnInit(): void {
    this.fillComboTipos();
    this.getEstadosERP();
    this.getClientes()

  }


  fillComboTipos(){
    this.tipos.push({codigo:1,nombre:"Todos",grupo:'',grupoID:''})
    this.tipos.push({codigo:2,nombre:"Principales",grupo:'',grupoID:''})
    this.tipos.push({codigo:3,nombre:"Sucursales",grupo:'',grupoID:''})
  }

  getEstadosERP() {
    let parametros: Parametro[] = [{
      key: "NameKey",
      value: EstadosGeneralesKeyEnum.ESTADOSERP
    }]

    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetEstadoForKeyComboBox", parametros).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
          console.error(response.errores[0]);
        } else {
          this.estadosERP = response.records;
          this.estadosERP.unshift({codigo:4,nombre:"Todos",grupo:"gray",grupoID:"4"})
        }
      }, error => {
        this.toastService.error("No se pudo obtener los estados.", "Error conexion al servidor");
        setTimeout(() => {
          this.getEstadosERP()
        }, 5000);

      });
  }
  
  getClientes() {
    this.showButtonAutorizar=false;
    this.Cargando = true;
    this.usuarioId = Number(this.authService.tokenDecoded.nameid) ;
    let parametros: Parametro[] = [
    { key: "Search", value: this.Search },
    { key: "UsuarioId", value:this.usuarioId},
    { key: "Tipo", value: this.tipo },
  ]
    this.httpService.GetAllWithPagination<ClienteViewModelCustomized>(DataApi.Cliente, "GetClientesListadoCustomized", "ID", this.paginaNumeroActual,
      this.paginaSize, false, parametros).subscribe(x => {

        if (x.ok) {
          this.clientes = x.valores[0];
          this.asignarPagination(x);
        } else {
          this.toastService.error(x.errores[0]);
          console.error(x.errores[0]);
        }
        this.arrayLoading = new Array(0);
        this.Cargando = false;
      }, error => {
        console.error(error);
        this.toastService.error("Error conexion al servidor");
        this.Cargando = false;
        this.arrayLoading = new Array(0);
      });

  }

  onChangeTipo(tipo:ComboBox){
    this.getClientes()
  }
  asignarPagination(x: ResponseContenido<any>) {

    if (x.pagina != null) {
      this.totalPaginas = x.pagina.totalPaginas == null ? 0 : x.pagina.totalPaginas;
      this.paginaTotalRecords = x.pagina.totalRecords == null ? 0 : x.pagina.totalRecords;
      this.paginaSize = x.pagina.paginaSize == null ? 0 : x.pagina.paginaSize;
    } else {
      this.totalPaginas = 0;
      this.paginaTotalRecords = 0;
      this.paginaSize = 0;
    }

  }

  autorizarCambiosCliente(cliente:ClienteViewModelCustomized){

   cliente.loadingAutorizarCambios=true;

    this.httpService.DoPostAny<Cliente>(DataApi.Cliente,
      'AutorizaCambiosDeCliente', cliente.id).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0], "Error");
          cliente.loadingAutorizarCambios=false;
        } else {
            this.getClientes();
            if(response.valores?.length>0){
               this.toastService.success("Realizado", "OK");
            }
        }
        cliente.loadingAutorizarCambios=false;

      }, error => {
        cliente.loadingAutorizarCambios=false;
        this.toastService.error("Error conexion al servidor");
      });



}


  buscarCodigoReferenciaClienteSmart(clienteID) {
    // console.log(clienteID)
    this.Cargando = true;
    this.httpService.DoPostSmartWebService("BuscaClienteSmart", "BuscaClientesSmart", { "IdCliente": clienteID }).subscribe(response => {
      let mensajeRespuesta = response.d + '';
      console.log(response)

      if (mensajeRespuesta.includes("Error")) {
        this.Cargando = false;
        this.toastService.error(mensajeRespuesta, "Smart Servicio");
        return;
      }
      this.toastService.success("Código de cliente obtenido.", "Smart Servicio");
      this.asignarCodigoReferenciaCliente(Number(clienteID), mensajeRespuesta);

    }, error => {
      this.Cargando = false;
      console.error(error)
      this.toastService.error("Error conexion al servidor", "Smart Servicio");
    });
  }

  asignarCodigoReferenciaCliente(clienteId: number, codigoReferencia: string) {

    let params = new ParametrosCita();
    params.clienteDocumento = codigoReferencia;
    params.servicioID = clienteId;

    // this.loadingBtnGuardarTecnico = true;

    this.httpService.DoPostAny<any>(DataApi.Cliente,
      "AsignarCodigoReferenciaCliente", params).subscribe(response => {
        this.Cargando = false;

        if (!response.ok) {
          this.toastService.error(response.errores[0], "Error");
        } else {
          this.toastService.success("Código de orden asignado", "OK");
          this.getClientes()
        }
        // this.loadingBtnGuardarTecnico = false;
      }, error => {
        // this.loadingBtnGuardarTecnico = false;
        this.Cargando = false;
        this.toastService.error("Asignar CodigoReferencia Cliente", "Error conexion al servidor");
      });
  }

  sendClientsToSap() {


    // this.loadingBtnGuardarTecnico = true;

    this.httpService.DoPostAny<any>(DataApi.Cliente,
      "GetClientesToSAP", null).subscribe(response => {
        this.Cargando = false;

        if (!response.ok) {
          this.toastService.error(response.errores[0], "Error");
        } else {
          this.toastService.success("", "OK");
        }
        // this.loadingBtnGuardarTecnico = false;
      }, error => {
        // this.loadingBtnGuardarTecnico = false;
        this.Cargando = false;
        this.toastService.error("Asignar CodigoReferencia Cliente", "Error conexion al servidor");
      });
  }


}
