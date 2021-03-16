import { Component, OnInit } from '@angular/core';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { DualListComponent } from 'angular-dual-listbox';
import { timeHours } from 'd3-time';
import { NgxPermissionsService } from 'ngx-permissions';
import { ToastrService } from 'ngx-toastr';
import { Parametro } from 'src/app/core/http/model/Parametro';
import { ResponseContenido } from 'src/app/core/http/model/ResponseContenido';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { Articulo } from 'src/app/Modules/servicios/recepcion/models/Articulo';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { EstadoGeneralesKey } from 'src/app/shared/enums/EstadoGeneralesKey';
import { ComboBox } from 'src/app/shared/model/ComboBox';
import { ListaPrecio } from '../models/ListaPrecio';

@Component({
  selector: 'app-lista-precios-listado',
  templateUrl: './lista-precios-listado.component.html',
  styleUrls: ['./lista-precios-listado.component.scss']
})
export class ListaPreciosListadoComponent implements OnInit {

  // COPIAR AL CREAR UN LISTADO NUEVO
  Search: string = "";
  paginaNumeroActual = 1;
  Cargando: boolean = false;
  CargandoBar: boolean = false;
  totalPaginas: number = 0;
  paginaSize: number = 5;
  paginaTotalRecords: number = 0;
  data: ListaPrecio[] = [] //tu modelo

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

  loadingArticulos: boolean;
  listaSeleccionada: number;
  loadingArticulosSeleccionados: boolean;
  guardandoArticulos: boolean;
  searchText: string;
  estadoIDAutorizacionDefault: number;
  estadosAutorizacion: ComboBox[];
  IsArticuloSeleccionado: boolean;


  constructor(private toastService: ToastrService,
    private httpService: BackendService,
    private modalService: NgbModal,
    public permissionsService: NgxPermissionsService,
  ) { }


  ngOnInit(): void {

    this.getData()
    this.configDualList()
    this.getArticulos()
    this.getEstadoAutorizacionDefault()
  }



  getData() {
    this.Cargando = true;

    let parametros: Parametro[] = [{ key: "Search", value: this.Search }]

    this.httpService.GetAllWithPagination<ListaPrecio>(DataApi.ListaPrecio, "GetListaPrecioListado", "ID", this.paginaNumeroActual,
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



  openModal(content, listaId: number) {
    this.listaSeleccionada = listaId;
    this.getArticulosSeleccionadosLista(listaId);
    this.modalService.open(content, { size: 'lg', backdrop: "static", });
  }

  getArticulosSeleccionadosLista(listaId: number) {
    this.loadingArticulosSeleccionados = true;
    let param: Parametro[] = [{ key: "listaID", value: listaId }]

    this.httpService.DoPost<any>(DataApi.Articulo,
      "GetArticulosAsignadosListaPrecio", param).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.confirmed = response.records;
          //  response.records.map(x => {
          //   return { "id": x.id, "nombre": x.nombre }
          // });
          console.table(this.confirmed)
        }
        this.loadingArticulosSeleccionados = false;
      }, error => {
        this.loadingArticulosSeleccionados = false;
        this.toastService.error("No se pudo obtener los articulos seleccionados", "Error conexion al servidor");

        setTimeout(() => {
          this.getArticulosSeleccionadosLista(listaId)
        }, 1000);

      });
  }

  configDualList() {
    this.key = 'id';
    this.display = 'nombre';
    this.keepSorted = true;
  }

  //#region MODAL ASIGNACION ARTICULOS


  getArticulos() {
    this.loadingArticulos = true;
    this.httpService.DoPost<Articulo>(DataApi.Articulo,
      "GetArticulos", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          // this.articulos = response.records;
          this.source = response.records.map(x => {
            return { "id": x.id, "nombre": x.nombre }
          });

          console.table(this.source)
        }
        this.loadingArticulos = false;
      }, error => {
        this.loadingArticulos = false;
        this.toastService.error("No se pudo obtener todos los articulos", "Error conexion al servidor");

        setTimeout(() => {
          this.getArticulos()
        }, 1000);

      });
  }

  guardarArticulosSeleccionados() {

    if (this.confirmed.length < 1) {
      this.toastService.warning("Selecciona uno o más artículos");
      return;
    }

    let param = this.confirmed.map(x => {
      return { "ArticuloID": x.id, "ListaPrecioID": this.listaSeleccionada }
    })
    this.guardandoArticulos = true;
    this.httpService.DoPostAny<any>(DataApi.Articulo,
      "RegistrarArticulosAListaPrecio", param).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
          console.error(response.errores[0]);
        } else {
          this.modalService.dismissAll();
          this.toastService.success("Realizado", "OK");
        }
        this.guardandoArticulos = false;
      }, error => {
        this.guardandoArticulos = false;
        this.toastService.error("No se pudo guardar", "Error conexion al servidor");
        console.error(error);
      });

  }



  //#endregion


  //#region MODAL ASIGNACION PRECIOS

  guardarArticulosSeleccionadosPrecios() {

    if (this.confirmed.length < 1) {
      this.toastService.warning("No hay artículos");
      return;
    }

    this.confirmed.filter(x => x.alterado).
      forEach(x => x.estadoID = this.estadoIDAutorizacionDefault)

    this.guardandoArticulos = true;
    this.httpService.DoPostAny<any>(DataApi.Articulo,
      "RegistrarPreciosArticulosAsignados", this.confirmed).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
          console.error(response.errores[0]);
        } else {
          this.modalService.dismissAll();
          this.toastService.success("Realizado", "OK");
        }
        this.guardandoArticulos = false;
      }, error => {
        this.guardandoArticulos = false;
        this.toastService.error("No se pudo guardar", "Error conexion al servidor");
        console.error(error);
      });

  }

  autorizarArticulosSeleccionados() {

    if (this.confirmed.filter(x => x.IsChecked).length < 1) {
      this.toastService.warning("Selecciona uno o más artículos para autorizar");
      return;
    }


  }

  toggleSelection() {


    this.IsArticuloSeleccionado = this.confirmed.filter(x => x.IsChecked).length > 0

    this.confirmed.forEach(x => x.IsChecked = !this.IsArticuloSeleccionado)

  }

  onfechaChange(item, event) {
    item.alterado = event.isInteracted
  }


  getEstadoAutorizacionDefault() {
    let parametros: Parametro[] = [{
      key: "NameKey",
      value: EstadoGeneralesKey.LISTAPRECIO
    }]

    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetEstadoForKeyComboBox", parametros).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.estadosAutorizacion = response.records;
          this.estadoIDAutorizacionDefault = response.records[0].codigo;
          // console.log("Estado default autorizacion: " + this.estadoIDAutorizacionDefault)
        }
      }, error => {
        this.toastService.error("No se pudo obtener el estado de autorización por defecto", "Error conexion al servidor");
        setTimeout(() => {
          this.getEstadoAutorizacionDefault()
        }, 1000);

      });
  }


  autorizar() {
    if (this.confirmed.filter(x => x.IsChecked).length < 1) {
      this.toastService.warning("No hay artículos seleccionados");
      return;
    }

  }


  //#endregion



}
