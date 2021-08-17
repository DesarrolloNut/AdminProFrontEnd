import { AuthenticationService } from 'src/app/core/authentication/service/authentication.service';
import { RecepcionActivo } from './../models/RecepcionActivo';
import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxPermissionsService } from 'ngx-permissions';
import { ToastrService } from 'ngx-toastr';
import { Parametro } from 'src/app/core/http/model/Parametro';
import { ResponseContenido } from 'src/app/core/http/model/ResponseContenido';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { ComboBox } from 'src/app/shared/model/ComboBox';
import { RecepcionActivoDetalle } from '../models/RecepcionActivoDetalle';

@Component({
  selector: 'app-recepcion-activo-listado',
  templateUrl: './recepcion-activo-listado.component.html',
  styleUrls: ['./recepcion-activo-listado.component.scss']
})
export class RecepcionActivoListadoComponent implements OnInit {
// COPIAR AL CREAR UN LISTADO NUEVO
Search: string = "";
paginaNumeroActual = 1;
Cargando: boolean = false;
CargandoDetalle: boolean = false;
btnGuardarCargando: boolean = false;
CargandoBar: boolean = false;
totalPaginas: number = 0;
paginaSize: number = 5;
paginaTotalRecords: number = 0;
data: RecepcionActivo[] = [] //tu modelo
dataDdetalle: RecepcionActivoDetalle[] = [] //tu modelo
dataSelect: RecepcionActivo; //tu modelo
loadingSucursal: boolean = false;
Sucursales: Array<any> = [];
SucursalId: number = 0;
  loadingDataDetalle: boolean;
  btnEnviarCargando: boolean;
  constructor(private toastService: ToastrService,
    private httpService: BackendService,
    private modalService: NgbModal,
    private auth: AuthenticationService,
    public permissionsService: NgxPermissionsService) { }

    ngOnInit(): void {
      this.getSucursalByUsuarioId();
    }
    getData() {
      this.Cargando = true;

      let parametros: Parametro[] = [
        { key: "Search", value: this.Search },
        { key: "SucursalId", value: this.SucursalId },
      ]

      this.httpService.GetAllWithPagination<RecepcionActivo>(DataApi.Devolucion, "GetListadoUsuariosConCanastosDevueltos", "UsuarioId", this.paginaNumeroActual,
        this.paginaSize, true, parametros).subscribe(x => {

          if (x.ok) {
            this.data = x.records;
            //console.log(this.data);
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
    getDataDetalle(UsuarioId: number ) {
      this.loadingDataDetalle = true;
      // let parametros: Parametro[] = [
      //   { key: "UsuId", value: UsuarioId },
      // ]

      this.httpService.DoPostAny<RecepcionActivoDetalle>(DataApi.Devolucion, "GetListadoRecepcionDetalle", UsuarioId).subscribe(x => {

          if (x.ok) {
            this.dataDdetalle = x.records;
          } else {
            this.toastService.error(x.errores[0]);
            console.error(x.errores[0]);
          }
          this.loadingDataDetalle = false;
        }, error => {
          console.error(error);
          this.toastService.error("Error conexion al servidor");
          this.loadingDataDetalle = false;
        });

    }

    getSucursalByUsuarioId() {
      let UsuarioId = Number(this.auth.tokenDecoded.nameid);
      let parametros: Parametro[] = [
        { key: "UsuarioId", value: UsuarioId },
      ]

      this.loadingSucursal = true;
      this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
        "GetSucursalesByUsuarioId", parametros).subscribe(response => {

          if (!response.ok) {
            this.toastService.error(response.errores[0]);
          } else {
            this.SucursalId = response.records[0].codigo;
            this.Sucursales = response.records;
            this.getData();

          }
          this.loadingSucursal = false;
        }, error => {
          this.loadingSucursal = false;
          this.toastService.error("No se pudo obtener los supervisores", "Error conexion al servidor");

          setTimeout(() => {
            this.getSucursalByUsuarioId()
          }, 1000);

        });
    }

    openModal(content, model: RecepcionActivo) {
      this.dataSelect = model;
      this.getDataDetalle(model.usuarioId);
      this.modalService.open(content, { size: 'xl', backdrop: "static", });
    }


    SendAutorizar() {
      this.btnEnviarCargando = true;

      this.httpService.DoPostAny<any>(DataApi.Devolucion, "UpdateEstadoDevolucion", this.dataSelect.usuarioId).subscribe(x => {

          if (x.ok) {
            this.modalService.dismissAll();
            this.getData();
            this.toastService.success("Procesado");
          } else {
            this.toastService.error(x.errores[0]);
            console.error(x.errores[0]);
          }
          this.btnEnviarCargando = false;
        }, error => {
          console.error(error);
          this.toastService.error("Error conexion al servidor");
          this.btnEnviarCargando = false;
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

}
