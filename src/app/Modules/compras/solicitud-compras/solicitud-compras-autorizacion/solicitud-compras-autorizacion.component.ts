import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxPermissionsService } from 'ngx-permissions';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'src/app/core/authentication/service/authentication.service';
import { Parametro } from 'src/app/core/http/model/Parametro';
import { ResponseContenido } from 'src/app/core/http/model/ResponseContenido';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { ArticuloListaPrecioViewModel } from 'src/app/Modules/mantenimientos/articulos/models/ArticuloListaPrecioViewModel';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { EstadoGeneralesKey } from 'src/app/shared/enums/EstadoGeneralesKey';
import { ComboBox } from 'src/app/shared/model/ComboBox';
import { SolicitudCompraListadoViewModel } from '../models/SolicitudCompraListadoViewModel';

@Component({
  selector: 'app-solicitud-compras-autorizacion',
  templateUrl: './solicitud-compras-autorizacion.component.html',
  styleUrls: ['./solicitud-compras-autorizacion.component.scss']
})
export class SolicitudComprasAutorizacionComponent implements OnInit {
  // COPIAR AL CREAR UN LISTADO NUEVO
  Search: string = "";
  paginaNumeroActual = 1;
  Cargando: boolean = false;
  totalPaginas: number = 0;
  paginaSize: number = 10;
  paginaTotalRecords: number = 0;
  data: SolicitudCompraListadoViewModel[] = [] //tu modelo

  estadoAutorizacionComboModel: number = 0;
  estadoAutorizacionUsuario: number;
  estadosAutorizacion: ComboBox[];
  estadoIDAutorizacionDefault: number;
  estadoAutorizacionSiguiente: ComboBox;
  estadoAutorizacionAnterior: ComboBox;
  btnClicked: number;
  isAutorizando: boolean;
  cargandoAutorizacion: boolean;

  //comentarios
  itemSeleccionado: any;
  comentarios: any[];
  comentario: string;
  cargandoModal: boolean = false;

  keyModule = EstadoGeneralesKey.SOLICITUDCOMPRAS;

  constructor(private toastService: ToastrService,
    private httpService: BackendService,
    private authService: AuthenticationService,
    private modalService: NgbModal,
    public permissionsService: NgxPermissionsService,
  ) { }


  ngOnInit(): void {
    this.getEstadoAutorizacionUsuario()
    console.log(this.keyModule)

  }

  getData() {
    this.Cargando = true;

    let parametros: Parametro[] = [
      { key: "EstadoAutorizacionID", value: this.estadoAutorizacionComboModel },
      { key: "Search", value: this.Search },
    ]

    this.httpService.GetAllWithPagination<SolicitudCompraListadoViewModel>(DataApi.SolicitudCompra,
      "GetSolicitudCompraListado", "ID", this.paginaNumeroActual,
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


  getEstadosAutorizacion() {
    let parametros: Parametro[] = [{
      key: "NameKey",
      value: this.keyModule
    }]

    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetEstadoForKeyComboBox", parametros).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
          console.error(response.errores[0]);
        } else {
          this.estadosAutorizacion = response.records;
          console.table(this.estadosAutorizacion)
          this.estadoIDAutorizacionDefault = response.records[0].codigo;
          this.getSiguienteEstado()//almacena en una variable el siguiente estado
          this.getAnteriorEstadoAutorizacion()//almacena en una variable el anterior estado
          this.getData()
        }
      }, error => {
        this.toastService.error("No se pudo obtener los estados.", "Error conexion al servidor");
        setTimeout(() => {
          this.getEstadosAutorizacion()
        }, 1000);

      });
  }

  getEstadoAutorizacionUsuario() {
    let parametro = {
      "UsuarioID": Number(this.authService.tokenDecoded.nameid),
      "KeynameModule": this.keyModule
    }

    this.httpService.DoPostAny<any>(DataApi.NivelAutorizacion,
      "GetEstadoAutorizacionUsuario", parametro).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
          console.error(response.errores[0]);
        } else {
          this.estadoAutorizacionUsuario = response.valores[0];
          this.getEstadosAutorizacion()
        }
      }, error => {
        this.toastService.error("No se pudo obtener el estado de autorización del usuario", "Error conexion al servidor");
        setTimeout(() => {
          this.getEstadoAutorizacionUsuario()
        }, 1000);

      });

  }

  getSiguienteEstado() {
    let estadoUsuario = this.estadosAutorizacion.find(x => x.codigo == this.estadoAutorizacionUsuario);
    let estadoActualPosicion = this.estadosAutorizacion.indexOf(estadoUsuario);
    this.estadoAutorizacionSiguiente = this.estadosAutorizacion[estadoActualPosicion + 1]
  }

  getAnteriorEstadoAutorizacion() {
    let estadoUsuario = this.estadosAutorizacion.find(x => x.codigo == this.estadoAutorizacionUsuario);
    let estadoActualPosicion = this.estadosAutorizacion.indexOf(estadoUsuario);
    console.log(estadoUsuario)
    console.log(estadoActualPosicion)
    this.estadoAutorizacionAnterior = this.estadosAutorizacion[estadoActualPosicion - 1]
    if (this.estadoAutorizacionAnterior) {
      this.estadoAutorizacionComboModel = this.estadoAutorizacionAnterior.codigo;
    }
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

  openModal(content, btnClicked: number, item: any) {
    this.modalService.open(content, { size: 'sm' });
    this.btnClicked = btnClicked
    // this.articuloSeleccionado = item
  }

  onBtnModalOk() {

    if (this.btnClicked == 1) {
      // this.autorizar()
      // this.desautorizar()
      return;
    }
    if (this.btnClicked == 2) {
      // this.solicitarAutorizacion()
      return;
    }
    if (this.btnClicked == 3) {
      return;
    }

    this.modalService.dismissAll()



  }

  autorizar(item: SolicitudCompraListadoViewModel) {
    this.isAutorizando = true;
    this.actualizarEstadoArticulos(item)
  }

  desautorizar(item: any) {
    this.isAutorizando = false;
    this.actualizarEstadoArticulos(item)
  }

  autorizarMasiva() {

    this.httpService.DoPostAny<any>(DataApi.NivelAutorizacion,
      "AutorizarArticulosMasivoSegunNivelUsuario", Number(this.authService.tokenDecoded.nameid)).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
          console.error(response.errores[0]);
        } else {
          this.toastService.success("Realizado", "OK");
          this.getData()
        }
      }, error => {
        this.toastService.error("No se pudo realizar", "Error conexion al servidor");
        console.error(error)
      });

  }


  actualizarEstadoArticulos(item: SolicitudCompraListadoViewModel) {
    item.cargando = true;
    // if (this.confirmed.filter(x => x.IsChecked).length < 1) {
    //   this.toastService.warning("Selecciona uno o más artículos para actualizar");
    //   return;
    // }

    let EstadoUsuariosNotificacion: number;

    if (this.isAutorizando) {
      EstadoUsuariosNotificacion = this.estadoAutorizacionSiguiente ? this.estadoAutorizacionSiguiente.codigo : 0
    } else {
      EstadoUsuariosNotificacion = this.estadoIDAutorizacionDefault
    }

    let ultimoEstado = this.estadosAutorizacion[this.estadosAutorizacion.length - 1].codigo;
    let articulos = []
    articulos.push(item)
    let param = {
      "IsAprobado": this.estadoAutorizacionUsuario == ultimoEstado && this.isAutorizando,
      "IsAutorizando": this.isAutorizando,
      "EstadoAutorizacion": this.isAutorizando ? this.estadoAutorizacionUsuario : this.estadoIDAutorizacionDefault,
      "EstadoDefault": this.estadoIDAutorizacionDefault,
      "EstadoUsuariosNotificacion": EstadoUsuariosNotificacion,
      "Seleccion": articulos.
        map(x => { return { "ListaPrecioID": x.listaPrecioID, "ArticuloID": x.id } })
    }
    this.httpService.DoPostAny<any>(DataApi.SolicitudCompra,
      "NOMBRE_METODO", param).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
          console.error(response.errores[0]);

        } else {
          this.toastService.success("Realizado", "OK");
          this.getData()
        }

      }, error => {
        this.toastService.error("No se pudo actualizar el estado.",
          "Error conexion al servidor");
      });

  }


  openModalComments(content, item: any) {
    console.table(item)
    this.itemSeleccionado = item;
    this.getComentarios()
    this.modalService.open(content, { size: 'lg', scrollable: true });
    // this.articuloSeleccionado = item
  }


  getComentarios() {
    this.comentarios = []
    this.comentario = ""
    let parametros = { "ArticuloID": this.itemSeleccionado.id, "ListaPrecioID": this.itemSeleccionado.listaPrecioID }
    this.cargandoModal = true;
    this.httpService.DoPostAny<ComboBox>(DataApi.ListaPrecio,
      "GetListaPrecioArticuloComentarios", parametros).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
          console.error(response.errores[0]);
        } else {
          this.comentarios = response.records;
        }
        this.cargandoModal = false;

      }, error => {
        this.cargandoModal = false;
        this.toastService.error("No se pudo obtener los comentarios.", "Error conexion al servidor");
        setTimeout(() => {
          this.getEstadosAutorizacion()
        }, 1000);

      });

  }


}
