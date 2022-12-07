import { AuthenticationService } from './../../../../core/authentication/service/authentication.service';
import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DualListComponent } from 'angular-dual-listbox';
import { NgxPermissionsService } from 'ngx-permissions';
import { ToastrService } from 'ngx-toastr';
import { TreeItem, TreeviewItem } from 'ngx-treeview';
import { Parametro } from 'src/app/core/http/model/Parametro';
import { ResponseContenido } from 'src/app/core/http/model/ResponseContenido';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { Permisos } from '../../permisos/models/Permisos';
import { Roles } from '../models/Roles';

@Component({
  selector: 'app-roles-listado',
  templateUrl: './roles-listado.component.html',
  styleUrls: ['./roles-listado.component.scss']
})
export class RolesListadoComponent implements OnInit {
  // COPIAR AL CREAR UN LISTADO NUEVO
  Search: string = "";
  paginaNumeroActual = 1;
  Cargando: boolean = false;
  CargandoBar: boolean = false;
  totalPaginas: number = 0;
  paginaSize: number = 5;
  paginaTotalRecords: number = 0;
  data: Roles[] = [] //tu modelo
  RolID: number = 0;
  loadingRolesSeleccionados: boolean;
  guardandoPermisos: boolean;


  loadingPermisos: boolean;
  permisos: Array<Permisos>;

  // Dual List options
  tab = 1;
  keepSorted = true;
  key: string;
  display: string;
  filter = true;
  source: Array<any>;
  confirmed: Array<any>;
  userAdd = '';
  disabled = false;

  sourceLeft = true;
  // format: any = DualListComponent.DEFAULT_FORMAT;
  format = {
    add: 'Agregar', remove: 'Remover', all: 'Seleccionar Todos', none: 'Deseleccionar',
    direction: DualListComponent.LTR, draggable: true, locale: 'da'
  };



  constructor(private toastService: ToastrService,
    private httpService: BackendService,
    private modalService: NgbModal,
    private auth:AuthenticationService,
    public permissionsService: NgxPermissionsService,
    private authService: AuthenticationService
  ) { }

  
  ngOnInit(): void {
    this.getData();
    this.getPermisos();
    this.configDualList()
  }


  configDualList() {
    this.key = 'id';
    this.display = 'nombre';
    this.keepSorted = true;
  }

  getData() {
    this.Cargando = true;

    let parametros: Parametro[] = [{ key: "Search", value: this.Search }]

    this.httpService.GetAllWithPagination<Roles>(DataApi.Rol, "GetRolListado", "ID", this.paginaNumeroActual,
      this.paginaSize, true, parametros).subscribe(x => {

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
  openModal(content, rolID: number) {
    this.RolID = rolID;
    this.getPermisosSeleccionados();
    this.modalService.open(content, { size: 'xl', backdrop: "static", });
  }


  getPermisos() {
    let param: Parametro[] = [{ key: "companiaId", value: this.authService.tokenDecoded.primarygroupsid }]
  //  console.log(param);
    this.loadingPermisos = true;

    this.httpService.DoPost<Permisos>(DataApi.Permisos,
      "GetAllPermisos", param).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.permisos = response.records;
          this.source = response.records.map(x => {
            return { "id": x.id, "nombre": x.nameKey }
          });
        }
        this.loadingPermisos = false;
      }, error => {
        this.loadingPermisos = false;
        this.toastService.error("No se pudo obtener todos los Permisos", "Error conexion al servidor");

        setTimeout(() => {
          this.getPermisos()
        }, 1000);

      });
  }

  getPermisosSeleccionados() {
    let param: Parametro[] = [{ key: "rolID", value: this.RolID }]
    this.loadingPermisos = true;
    this.httpService.DoPost<Permisos>(DataApi.Permisos,
      "GetAllPermisosByRolID", param).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.permisos = response.records;
          this.confirmed = response.records.map(x => {
            return { "id": x.id, "nombre": x.nameKey }
          });
        }
        this.loadingPermisos = false;
      }, error => {
        this.loadingPermisos = false;
        this.toastService.error("No se pudo obtener todos los Permisos", "Error conexion al servidor");

        setTimeout(() => {
          this.getPermisosSeleccionados()
        }, 1000);

      });
  }




  guardarPermisosSeleccionados() {

    let param = { "RolID": this.RolID,"CompaniaID":parseInt(this.auth.tokenDecoded.primarygroupsid) , "Permisos": this.confirmed.map(x => x.id) }
    this.guardandoPermisos = true;
    this.httpService.DoPostAny<Permisos>(DataApi.Rol,
      "InsertRolPermisoEnrroll", param).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.modalService.dismissAll();
          this.toastService.success("Realizado", "OK");
        }
        this.guardandoPermisos = false;
      }, error => {
        this.guardandoPermisos = false;
        this.toastService.error("No se pudo guardar", "Error conexion al servidor");
      });

  }

}
