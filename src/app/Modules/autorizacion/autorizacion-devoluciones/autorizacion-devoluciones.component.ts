import { DevolucionVista } from '../../inventario/devoluciones/models/DevolucionVista';
import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxPermissionsService } from 'ngx-permissions';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'src/app/core/authentication/service/authentication.service';
import { Parametro } from 'src/app/core/http/model/Parametro';
import { ResponseContenido } from 'src/app/core/http/model/ResponseContenido';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { EstadosGeneralesKeyEnum } from 'src/app/shared/enums/EstadosGeneralesKeyEnum';
import { ComboBox } from 'src/app/shared/model/ComboBox';
import { DevolucionDetalleVista } from '../../inventario/devoluciones/models/DevolucionDetalleVista';

@Component({
  selector: 'app-autorizacion-devoluciones',
  templateUrl: './autorizacion-devoluciones.component.html',
  styleUrls: ['./autorizacion-devoluciones.component.scss']
})
export class AutorizacionDevolucionesComponent implements OnInit {
  // COPIAR AL CREAR UN LISTADO NUEVO
  Search: string = "";
  paginaNumeroActual = 1;
  Cargando: boolean = false;
  totalPaginas: number = 0;
  paginaSize: number = 10;
  paginaTotalRecords: number = 0;
  data: DevolucionVista[] = [] //tu modelo

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
  devolucionSelected: DevolucionVista;
  CargandoDetalle: boolean;
  dataDetalle: DevolucionDetalleVista[];

  constructor(private toastService: ToastrService,
    private httpService: BackendService,
    private authService: AuthenticationService,
    private modalService: NgbModal,
    public permissionsService: NgxPermissionsService,
  ) { }


  ngOnInit(): void {
    // this.getData()
    this.getEstadoAutorizacionUsuario()
  }

  // onEstadoComboChange() {
  //   this.getData()
  // }


  getData() {
    this.Cargando = true;

    let parametros: Parametro[] = [
      { key: "EstadoAutorizacionID", value: this.estadoAutorizacionComboModel },
      { key: "Search", value: this.Search },
    ]

    this.httpService.GetAllWithPagination<DevolucionVista>(DataApi.Devolucion, "GetDevolucionListadoAutorizacion", "Id", this.paginaNumeroActual,
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
      value: EstadosGeneralesKeyEnum.DEVOLUCION
    }]

    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetEstadoForKeyComboBox", parametros).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
          console.error(response.errores[0]);
        } else {
          this.estadosAutorizacion = response.records;
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
      "KeynameModule": EstadosGeneralesKeyEnum.DEVOLUCION,
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
    // console.log(estadoUsuario)
    // console.log(estadoActualPosicion)
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

  autorizar(item: any) {
    this.isAutorizando = true;
    this.actualizarEstadoArticulos(item)
  }

  desautorizar(item: any) {
    this.isAutorizando = false;
    this.actualizarEstadoArticulos(item)
  }

  autorizarMasiva() {

    // this.httpService.DoPostAny<any>(DataApi.NivelAutorizacion,
    //   "AutorizarArticulosMasivoSegunNivelUsuario", Number(this.authService.tokenDecoded.nameid)).subscribe(response => {

    //     if (!response.ok) {
    //       this.toastService.error(response.errores[0]);
    //       console.error(response.errores[0]);
    //     } else {
    //       this.toastService.success("Realizado", "OK");
    //       this.getData()
    //     }
    //   }, error => {
    //     this.toastService.error("No se pudo realizar", "Error conexion al servidor");
    //     console.error(error)
    //   });

  }


  actualizarEstadoArticulos(item: any) {
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
        map(x => { return { "ArticuloID": x.id } })
    }

    item.cargando = false;
    this.httpService.DoPostAny<any>(DataApi.NivelAutorizacion,
      "ActualizarDevolucionesEstadoID", param).subscribe(response => {

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

  openModalDevolucionDetalle(content, DevolucionSelect: DevolucionVista) {
    this.devolucionSelected = DevolucionSelect;
    this.getDataDetalle(DevolucionSelect.id);
    this.modalService.open(content, { size: 'xl', backdrop: "static", });
  }

  getDataDetalle(DevolucionID:number) {
    this.CargandoDetalle = true;

    this.httpService.DoPostAny<DevolucionDetalleVista>(DataApi.DevolucionDetalle, "GetDevolucionDetalleVistaByID", DevolucionID).subscribe(x => {

        if (x.ok) {
          this.dataDetalle = [];
          x.records.forEach(x => {
            x.cantidadConfirmado == 0 ? x.cantidadConfirmado = x.cantidad : x.cantidadConfirmado;
            this.dataDetalle.push(x);
          });
        } else {
          this.toastService.error(x.errores[0]);
          console.error(x.errores[0]);
        }
        this.CargandoDetalle = false;
      }, error => {
        console.error(error);
        this.toastService.error("Error conexion al servidor");
        this.CargandoDetalle = false;
      });

  }


  // openModalComments(content, item: any) {
  //   console.table(item)
  //   this.itemSeleccionado = item;
  //   this.getComentarios()
  //   this.modalService.open(content, { size: 'lg', scrollable: true });
  //   // this.articuloSeleccionado = item
  // }


  // getComentarios() {
  //   this.comentarios = []
  //   this.comentario = ""
  //   let parametros = { "ArticuloID": this.itemSeleccionado.id, "ListaPrecioID": this.itemSeleccionado.listaPrecioID }
  //   this.cargandoModal = true;
  //   this.httpService.DoPostAny<ComboBox>(DataApi.ListaPrecio,
  //     "GetListaPrecioArticuloComentarios", parametros).subscribe(response => {

  //       if (!response.ok) {
  //         this.toastService.error(response.errores[0]);
  //         console.error(response.errores[0]);
  //       } else {
  //         this.comentarios = response.records;
  //       }
  //       this.cargandoModal = false;

  //     }, error => {
  //       this.cargandoModal = false;
  //       this.toastService.error("No se pudo obtener los comentarios.", "Error conexion al servidor");
  //       setTimeout(() => {
  //         this.getEstadosAutorizacion()
  //       }, 1000);

  //     });

  // }



  // guardarComentario() {

  //   if (this.comentario.trim().length < 3) {
  //     return
  //   }

  //   let parametros = {
  //     "Id": 0,
  //     "Comentario": this.comentario,
  //     "ListaPrecioID": this.itemSeleccionado.listaPrecioID,
  //     "ArticuloID": this.itemSeleccionado.id,
  //     "UsuarioID": Number(this.authService.tokenDecoded.nameid),
  //     "Fecha": new Date(),
  //     "Usuario": this.authService.tokenDecoded.given_name,
  //     "ListaPrecio": this.itemSeleccionado.listaPrecio,
  //     "Articulo": this.itemSeleccionado.nombre
  //   }

  //   this.cargandoModal = true;
  //   this.httpService.DoPostAny<any>(DataApi.ListaPrecio,
  //     "InsertarListaPrecioArticuloComentario", parametros).subscribe(response => {

  //       if (!response.ok) {
  //         this.toastService.error(response.errores[0]);
  //         console.error(response.errores[0]);

  //       } else {
  //         this.toastService.success("Realizado", "OK");
  //         this.comentario = ""
  //         this.enviarNotificacionCorreoNuevoComentario(parametros)
  //         this.getComentarios()
  //       }
  //     }, error => {
  //       this.cargandoModal = false;
  //       this.toastService.error("No se pudo actualizar el estado.",
  //         "Error conexion al servidor");
  //     });
  // }

  // enviarNotificacionCorreoNuevoComentario(param: any) {

  //   this.httpService.DoPostAny<any>(DataApi.ListaPrecio,
  //     "EnviarCorreoNotificacionArticuloComentario", param).subscribe(response => {

  //       if (!response.ok) {
  //         // this.toastService.error(response.errores[0]);
  //         console.error(response.errores[0]);
  //       } else {
  //         // this.toastService.success("Notificaciones enviadas", "OK");
  //       }
  //     }, error => {
  //       console.error(error)
  //     });

  // }

}
