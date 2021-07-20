import { Component, OnInit } from '@angular/core';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { DualListComponent } from 'angular-dual-listbox';
import { timeHours } from 'd3-time';
import { NgxPermissionsService } from 'ngx-permissions';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'src/app/core/authentication/service/authentication.service';
import { Parametro } from 'src/app/core/http/model/Parametro';
import { ResponseContenido } from 'src/app/core/http/model/ResponseContenido';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { Articulo } from 'src/app/Modules/servicios/recepcion/models/Articulo';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { EstadosGeneralesKeyEnum } from 'src/app/shared/enums/EstadosGeneralesKeyEnum';
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
  estadoAutorizacionUsuario: number;

  estadosAutorizacion: ComboBox[];
  IsArticuloSeleccionado: boolean;
  estadoAutorizacionSiguiente: ComboBox;
  estadoAutorizacionAnterior: ComboBox;

  mostrarBtnCancelarAceptar: boolean
  isAutorizando: boolean
  fechaActual: Date;

  constructor(private toastService: ToastrService,
    private httpService: BackendService,
    private modalService: NgbModal,
    private authService: AuthenticationService,
    public permissionsService: NgxPermissionsService,
  ) { }


  ngOnInit(): void {

    this.getData()
    this.configDualList()
    this.getArticulos()
    this.getEstadoAutorizacionDefault()
    this.getHoraActual()
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
    this.modalService.open(content, { windowClass: "myCustomModalClass", backdrop: "static", });
    this.listaSeleccionada = listaId;
    this.getArticulosSeleccionadosLista(listaId);
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

    this.confirmed.filter(x => x.estadoID < this.estadoIDAutorizacionDefault).forEach(x => x.estadoID = this.estadoIDAutorizacionDefault)

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

  toggleSelection() {

    let articulosAutorizables = this.isAutorizando ?
      this.confirmed.filter(x =>
        x.estadoID == this.estadoAutorizacionAnterior.codigo
      ) :
      this.confirmed.filter(x =>
        x.estadoID == this.estadoAutorizacionUsuario
      );

    this.IsArticuloSeleccionado = articulosAutorizables.filter(x => x.IsChecked).length > 0

    articulosAutorizables.forEach(x => x.IsChecked = !this.IsArticuloSeleccionado)

  }

  getSiguienteEstado() {
    let estadoUsuario = this.estadosAutorizacion.find(x => x.codigo == this.estadoAutorizacionUsuario);
    let estadoActualPosicion = this.estadosAutorizacion.indexOf(estadoUsuario);
    this.estadoAutorizacionSiguiente = this.estadosAutorizacion[estadoActualPosicion + 1]
  }

  getAnteriorEstadoAutorizacion() {
    let estadoUsuario = this.estadosAutorizacion.find(x => x.codigo == this.estadoAutorizacionUsuario);
    let estadoActualPosicion = this.estadosAutorizacion.indexOf(estadoUsuario);
    this.estadoAutorizacionAnterior = this.estadosAutorizacion[estadoActualPosicion - 1]
  }


  getEstadoAutorizacionDefault() {
    let parametros: Parametro[] = [{
      key: "NameKey",
      value: EstadosGeneralesKeyEnum.LISTAPRECIO
    }]

    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetEstadoForKeyComboBox", parametros).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.estadosAutorizacion = response.records;
          this.estadoIDAutorizacionDefault = response.records[0].codigo;

          this.getEstadoAutorizacionUsuario()

          // console.log("Estado default autorizacion: " + this.estadoIDAutorizacionDefault)
        }
      }, error => {
        this.toastService.error("No se pudo obtener el estado de autorización por defecto", "Error conexion al servidor");
        setTimeout(() => {
          this.getEstadoAutorizacionDefault()
        }, 1000);

      });
  }


  getEstadoAutorizacionUsuario() {
    let parametro = {
      "UsuarioID": Number(this.authService.tokenDecoded.nameid),
      "KeynameModule": EstadosGeneralesKeyEnum.LISTAPRECIO,
    }
    this.httpService.DoPostAny<any>(DataApi.NivelAutorizacion,
      "GetEstadoAutorizacionUsuario", parametro).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.estadoAutorizacionUsuario = response.valores[0];
          this.getSiguienteEstado()//almacena en una variable el siguiente estado
          this.getAnteriorEstadoAutorizacion()//almacena en una variable el anterior estado

        }
      }, error => {
        this.toastService.error("No se pudo obtener el estado de autorización del usuario", "Error conexion al servidor");
        setTimeout(() => {
          this.getEstadoAutorizacionUsuario()
        }, 1000);

      });

  }



  onBtnAutorizarClick() {
    this.mostrarBtnCancelarAceptar = true;
    this.isAutorizando = true;
    this.confirmed.forEach(x => x.IsChecked = false)
  }

  onBtnDesautorizarClick() {
    this.mostrarBtnCancelarAceptar = true;
    this.isAutorizando = false;
    this.confirmed.forEach(x => x.IsChecked = false)
  }

  onBtnCancelarClick() {
    this.mostrarBtnCancelarAceptar = false;
  }

  onBtnAceptarClick() {

    this.actualizarEstadoArticulos();

  }

  actualizarEstadoArticulos() {

    if (this.confirmed.filter(x => x.IsChecked).length < 1) {
      this.toastService.warning("Selecciona uno o más artículos para actualizar");
      return;
    }

    let EstadoUsuariosNotificacion: number;

    if (this.isAutorizando) {
      EstadoUsuariosNotificacion = this.estadoAutorizacionSiguiente ? this.estadoAutorizacionSiguiente.codigo : 0
    } else {
      EstadoUsuariosNotificacion = this.estadoIDAutorizacionDefault
    }

    let ultimoEstado = this.estadosAutorizacion[this.estadosAutorizacion.length - 1].codigo;

    let param = {
      "IsAprobado": this.estadoAutorizacionUsuario == ultimoEstado && this.isAutorizando,
      "IsAutorizando": this.isAutorizando,
      "EstadoAutorizacion": this.isAutorizando ? this.estadoAutorizacionUsuario : this.estadoIDAutorizacionDefault,
      "EstadoDefault": this.estadoIDAutorizacionDefault,
      "EstadoUsuariosNotificacion": EstadoUsuariosNotificacion,
      "Seleccion": this.confirmed.filter(x => x.IsChecked).
        map(x => { return { "ListaPrecioID": x.listaPrecioID, "ArticuloID": x.id } })
    }

    this.httpService.DoPostAny<any>(DataApi.NivelAutorizacion,
      "ActualizarArticuloPrecioEstadoID", param).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.getArticulosSeleccionadosLista(this.listaSeleccionada);
          this.toastService.success("Realizado", "OK");
          this.mostrarBtnCancelarAceptar = false;
        }

      }, error => {
        this.toastService.error("No se pudo actualizar el estado.",
          "Error conexion al servidor");
      });


  }

  //#endregion


  getHoraActual() {
    this.Cargando = true;
    this.httpService.DoPost<ComboBox>(DataApi.Public,
      "GetHoraActual", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.fechaActual = new Date(response.valores[0]);
        }

        this.Cargando = false;
      }, error => {
        this.Cargando = false;
        this.toastService.error("Error conexion al servidor");
      });
  }




}
