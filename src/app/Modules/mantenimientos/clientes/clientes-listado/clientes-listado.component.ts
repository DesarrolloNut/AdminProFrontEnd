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
  tipo:number=0;
  constructor(private toastService: ToastrService,
    private httpService: BackendService,
    public permissionsService: NgxPermissionsService,
  ) { }


  ngOnInit(): void {
    this.fillComboTipos();
    this.getClientes()
    
  }

  fillComboTipos(){
    this.tipos.push({codigo:0,nombre:"Todos",grupo:'',grupoID:''})
    this.tipos.push({codigo:1,nombre:"Principales",grupo:'',grupoID:''})
    this.tipos.push({codigo:2,nombre:"Sucursales",grupo:'',grupoID:''})
  }
  getClientes() {
    this.Cargando = true;

    let parametros: Parametro[] = [
    { key: "Search", value: this.Search },
    { key: "tipo", value: this.tipo },]

    this.httpService.GetAllWithPagination<ClienteViewModelCustomized>(DataApi.Cliente, "GetClientesListadoCustomized", "ID", this.paginaNumeroActual,
      this.paginaSize, false, parametros).subscribe(x => {
          
        if (x.ok) {
          this.clientes = x.valores[0];
          console.log(this.clientes)
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
