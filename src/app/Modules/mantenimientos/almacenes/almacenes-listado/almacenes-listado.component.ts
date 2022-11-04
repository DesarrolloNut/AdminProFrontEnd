import { Component, OnInit } from '@angular/core';
import { Parametro } from 'src/app/core/http/model/Parametro';
import { ToastrService } from 'ngx-toastr';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { NgxPermissionsService } from 'ngx-permissions';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { ResponseContenido } from 'src/app/core/http/model/ResponseContenido';
import { AlmacenListadoViewModel } from '../models/AlmacenListadoViewModel';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DualListComponent } from 'angular-dual-listbox';
import { ComboBox } from 'src/app/shared/model/ComboBox';
import { AuthenticationService } from 'src/app/core/authentication/service/authentication.service';

@Component({
  selector: 'app-almacenes-listado',
  templateUrl: './almacenes-listado.component.html',
  styleUrls: ['./almacenes-listado.component.scss']
})
export class AlmacenesListadoComponent implements OnInit {

  tab = 1;
  keepSorted = true;
  key: string;
  display: string;
  filter = true;
  source: Array<any>;
  confirmed: Array<any>=[];
  userAdd = '';
  disabled = false;

  sourceLeft = true;
  // format: any = DualListComponent.DEFAULT_FORMAT;
  format = {
    add: 'Agregar', remove: 'Remover', all: 'Seleccionar Todos', none: 'Deseleccionar',
    direction: DualListComponent.LTR, draggable: true, locale: 'da'
  };
  // COPIAR AL CREAR UN LISTADO NUEVO
  Search: string = "";
  paginaNumeroActual = 1;
  Cargando: boolean = false;
  CargandoBar: boolean = false;
  totalPaginas: number = 0;
  paginaSize: number = 5;
  paginaTotalRecords: number = 0;
  data: AlmacenListadoViewModel[] = [] //tu modelo
  loadingAlmacenes: boolean;
  almacenOrigin: number;
  btnGuardarAsignacionCargando: boolean;
  loadingTransferenciaInventarioAlmacenEnrroll: boolean;
 

  constructor(private toastService: ToastrService,
    private httpService: BackendService,
    public permissionsService: NgxPermissionsService,
    private modalService: NgbModal,
    private auth:AuthenticationService,
  ) { }


  ngOnInit(): void {
    this.getData()
    this.configDualList()
    this.getAlmacenes()
  }
  getData() {
    this.Cargando = true;

    let parametros: Parametro[] = [{ key: "Search", value: this.Search }]

    this.httpService.GetAllWithPagination<AlmacenListadoViewModel>(DataApi.Almacen, "GetAlmacenListado", "ID", this.paginaNumeroActual,
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

  getAlmacenes() {
    this.loadingAlmacenes = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetAlmacenes", null).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.source = response.records.map(x => {
            return { "AlmacenDestinoId": x.codigo, "nombre": x.nombre }
          });
        }
        this.loadingAlmacenes = false;
      }, error => {
        this.loadingAlmacenes = false;
        this.toastService.error("No se pudo obtener los almacenes", "Error conexion al servidor");
        setTimeout(() => {
          this.getAlmacenes()
        }, 1000);

      });
  }
  configDualList() {
    this.key = 'AlmacenDestinoId';
    this.display = 'nombre';
    this.keepSorted = true;
  }
  openModal(content, almacenOrigen: number) {
   
    this.modalService.open(content, { size: 'lg', backdrop  : 'static',keyboard  : false });
    this.almacenOrigin = almacenOrigen;
    this.GetTransferenciaInventarioAlmacenEnrroll();
    
  }
  GetTransferenciaInventarioAlmacenEnrroll() {
    this.loadingTransferenciaInventarioAlmacenEnrroll = true;
    let param: Parametro[] = [{ key: "AlmacenOrigenId", value: Number(this.almacenOrigin )},{ key: "CompaniaId", value: Number(this.auth.tokenDecoded.primarygroupsid) }]
    this.httpService.DoPost<ComboBox>(DataApi.Almacen,
      "GetTransferenciaInventarioAlmacenEnrroll", param).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.confirmed = response.records.map(x => {
            return { "AlmacenDestinoId": x.codigo, "nombre": x.nombre }
          });
         
         
        }
        this.loadingTransferenciaInventarioAlmacenEnrroll = false;
      }, error => {
        this.loadingTransferenciaInventarioAlmacenEnrroll = false;
        this.toastService.error("No se pudo obtener los almacenes", "Error conexion al servidor");
        setTimeout(() => {
          this.getAlmacenes()
        }, 1000);

      });
    }

 
   
  


  guardarAlmacenesSeleccionados(){

    if(this.confirmed.length <= 0)
    {
      this.toastService.error("Agrega un almacén destino.");
      return;
    }

    for (var i = 0; i < this.confirmed.length; i++) {
      this.confirmed[i] = Object.assign(this.confirmed[i], {
        CompaniaId: Number(this.auth.tokenDecoded.primarygroupsid),  
          AlmacenOrigenId:Number(this.almacenOrigin)
      });
    }
    let parametro: any = {
      "AsignacionAlmacenes": this.confirmed,
    }
    let metodo: string = "AsignacionDeAlmacen" ;
    this.btnGuardarAsignacionCargando = true;
    this.httpService.DoPostAny<any>(DataApi.Almacen,
      metodo, parametro).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0], "Error");
        } else {
          this.toastService.success("Realizado", "OK");
          this.modalService.dismissAll();
        }
        this.btnGuardarAsignacionCargando = false;
      }, error => {
        this.btnGuardarAsignacionCargando = false;
        this.toastService.error("Error conexion al servidor");
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
