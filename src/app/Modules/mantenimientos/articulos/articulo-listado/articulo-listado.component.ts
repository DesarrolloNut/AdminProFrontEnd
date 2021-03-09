import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxPermissionsService } from 'ngx-permissions';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'src/app/core/authentication/service/authentication.service';
import { Parametro } from 'src/app/core/http/model/Parametro';
import { ResponseContenido } from 'src/app/core/http/model/ResponseContenido';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { Articulo } from 'src/app/Modules/servicios/recepcion/models/Articulo';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { ComboBox } from 'src/app/shared/model/ComboBox';

@Component({
  selector: 'app-articulo-listado',
  templateUrl: './articulo-listado.component.html',
  styleUrls: ['./articulo-listado.component.scss']
})
export class ArticuloListadoComponent implements OnInit {


  // COPIAR AL CREAR UN LISTADO NUEVO
  Search: string = "";
  paginaNumeroActual = 1;
  Cargando: boolean = false;
  CargandoBar: boolean = false;
  totalPaginas: number = 0;
  paginaSize: number = 5;
  paginaTotalRecords: number = 0;
  data: Articulo[] = [] //tu modelo


  clientes: ComboBox[] = [];
  clienteSeleccionado: number;
  vehiculoSeleccionado: number;
  vehiculoClientePropietarios: any[] = []
  loadingClientesPropietarios: boolean;
  loadingClientes: boolean;
  loadingBtnGuardandoVehiculoClienteEnrroll: boolean;

  constructor(private toastService: ToastrService,
    private httpService: BackendService,
    private modalService: NgbModal,
    private authService: AuthenticationService,
    public permissionsService: NgxPermissionsService,
  ) { }


  ngOnInit(): void {
    this.getData()
  }
  getData() {
    this.Cargando = true;

    let parametros: Parametro[] = [{ key: "Search", value: this.Search }]

    this.httpService.GetAllWithPagination<Articulo>(DataApi.Articulo, "GetArticuloListado", "id", this.paginaNumeroActual,
      this.paginaSize, false, parametros).subscribe(x => {

        if (x.ok) {
          this.data = x.records;
          this.asignarPagination(x);
        } else {
          this.toastService.error(x.errores[0]);
          console.error(x.errores[0]);
        }
        this.Cargando = false;
      }, error => {
        console.error(error);
        this.toastService.error("Error conexion al servidor");
        this.Cargando = false;
      });

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

  getClientesPropietarios(vehiculoID: number) {
    this.loadingClientesPropietarios = true;
    this.httpService.DoPostAny<any>(DataApi.Articulo,
      "GetVehiculoClientesPropietarios", vehiculoID).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.vehiculoClientePropietarios = response.records;
        }
        this.loadingClientesPropietarios = false;
      }, error => {
        this.loadingClientesPropietarios = false;
        this.toastService.error("No se pudo obtener los propietarios", "Error conexion al servidor");

        setTimeout(() => {
          this.getClientesPropietarios(vehiculoID)
        }, 1000);

      });
  }

  abrirModalClientesPropietarios(vehiculoID: number, nombreModal: any) {
    this.vehiculoSeleccionado = vehiculoID;
    this.modalService.open(nombreModal, {});
    this.clienteSeleccionado = 0;
    this.getClientes();
    this.getClientesPropietarios(vehiculoID)
  }


  getClientes(searchObj: any = null, clienteID: number = 0) {
    let search = ""

    if (searchObj)
      search = searchObj.term;

    this.loadingClientes = true;
    let parametros: Parametro[] = [
      { key: "CompaniaID", value: this.authService.tokenDecoded.primarygroupsid },
      { key: "Search", value: search },
      { key: "clienteID", value: clienteID },
    ];
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetClientesComboBox", parametros).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.clientes = response.records;
        }

        this.loadingClientes = false;
      }, error => {
        this.loadingClientes = false;
        this.toastService.error("Error conexion al servidor");
      });
  }


  registrarVehiculoClienteEnrroll() {

    this.loadingBtnGuardandoVehiculoClienteEnrroll = true;
    let parametro = {
      "Id": 0, "ClienteID": this.clienteSeleccionado, "VehiculoID": this.vehiculoSeleccionado, "Fecha": new Date()
    }
    this.httpService.DoPostAny<ComboBox>(DataApi.Articulo,
      "RegistrarVehiculoClienteEnrroll", parametro).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.toastService.success("Realizado", "OK");
          this.getClientesPropietarios(this.vehiculoSeleccionado);
        }
        this.loadingBtnGuardandoVehiculoClienteEnrroll = false;
      }, error => {
        this.loadingBtnGuardandoVehiculoClienteEnrroll = false;
        this.toastService.error("Error conexion al servidor");
      });
  }


}
