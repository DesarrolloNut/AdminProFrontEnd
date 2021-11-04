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
import { ArticuloListaPrecioViewModel } from '../../mantenimientos/articulos/models/ArticuloListaPrecioViewModel';
import * as XLSX from 'xlsx';
import { CotizacionListadoViewModel } from '../../ventas/cotizaciones/models/CotizacionListadoViewModel';
import { CotizacionDetalleViewModel } from '../../ventas/cotizaciones/models/CotizacionDetalleViewModel';
import { Factura } from '../../ventas/facturas/models/Factura';

enum btnClickedEnum {
  AUTORIZAR = 1,
  DESAUTORIZAR = 2,
  COMENTAR = 3
}

@Component({
  selector: 'app-autorizacion-pedidos',
  templateUrl: './autorizacion-pedidos.component.html',
  styleUrls: ['./autorizacion-pedidos.component.scss']
})



export class AutorizacionPedidosComponent implements OnInit {

  // COPIAR AL CREAR UN LISTADO NUEVO
  Search: string = "";
  paginaNumeroActual = 1;
  Cargando: boolean = false;
  totalPaginas: number = 0;
  paginaSize: number = 10;
  paginaTotalRecords: number = 0;
  data: CotizacionListadoViewModel[] = [] //tu modelo

  MODULO: EstadosGeneralesKeyEnum = EstadosGeneralesKeyEnum.PEDIDO

  // AUTORIZACION
  estadosAutorizacion: ComboBox[];
  estadoAutorizacionComboModel: number = 0;

  estadoAutorizacionUsuario: number;
  estadoIDAutorizacionDefault: number;
  estadoAutorizacionSiguiente: ComboBox;
  estadoAutorizacionAnterior: ComboBox;

  btnClicked: number;
  isAutorizando: boolean;
  cargandoAutorizacion: boolean;
  itemSeleccionado: CotizacionListadoViewModel;

  //comentarios
  comentarios: any[];
  comentario: string;
  cargandoModal: boolean = false;
  loadingReporteExcel: boolean;
  fechaFiltro: Date = new Date();
  cotizacionDetalles: any[];
  cotizacionSeleccionada: CotizacionListadoViewModel;
  loadingCotizacionDetalle: boolean;

  ACTIONSenum = btnClickedEnum;
  facturasPendientesPago: Factura[];
  loadingFacturasPendientesPago: boolean;
  totalPendientePagar: number;

  constructor(private toastService: ToastrService,
    private httpService: BackendService,
    private authService: AuthenticationService,
    private modalService: NgbModal,
    public permissionsService: NgxPermissionsService,
  ) { }


  ngOnInit(): void {
    this.getEstadoAutorizacionUsuario()
  }


  getEstadoAutorizacionUsuario() {
    let parametro = {
      "UsuarioID": Number(this.authService.tokenDecoded.nameid),
      "KeynameModule": this.MODULO,
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


  getData() {
    this.Cargando = true;

    let parametros: Parametro[] = [
      { key: "EstadoAutorizacionID", value: this.estadoAutorizacionComboModel },
      { key: "Search", value: this.Search },
    ]

    this.httpService.GetAllWithPagination<CotizacionListadoViewModel>(DataApi.Cotizacion, "GetPedidosListadoAutorizacion", "Id", this.paginaNumeroActual,
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


  getEstadosAutorizacion() {


    let parametros: Parametro[] = [{
      key: "NameKey",
      value: this.MODULO
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


  getSiguienteEstado() {
    let estadoUsuario = this.estadosAutorizacion.find(x => x.codigo == this.estadoAutorizacionUsuario);
    let estadoActualPosicion = this.estadosAutorizacion.indexOf(estadoUsuario);
    this.estadoAutorizacionSiguiente = this.estadosAutorizacion[estadoActualPosicion + 1]
  }

  getAnteriorEstadoAutorizacion() {
    let estadoUsuario = this.estadosAutorizacion.find(x => x.codigo == this.estadoAutorizacionUsuario);

    console.log(estadoUsuario)


    let estadoActualPosicion = this.estadosAutorizacion.indexOf(estadoUsuario);
    this.estadoAutorizacionAnterior = this.estadosAutorizacion[estadoActualPosicion - 1]

    console.log(this.estadoAutorizacionAnterior)



    if (this.estadoAutorizacionAnterior) {
      // this.estadoAutorizacionComboModel = this.estadoAutorizacionAnterior.codigo;
      this.estadoAutorizacionComboModel = 1;

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

  openModalConfirm(content, btnClicked: number, item: CotizacionListadoViewModel) {
    this.comentario = null;
    this.getFacturasPendientesPago(item.clienteId);
    this.modalService.open(content, { size: 'lg', backdrop: 'static' });
    this.btnClicked = btnClicked;
    this.itemSeleccionado = item;
  }

  onBtnModalOk() {

    if (!this.comentario || this.comentario.length < 10) {
      this.toastService.warning("Ingresar comentario válido");
      return;
    }

    if (this.btnClicked == this.ACTIONSenum.AUTORIZAR) {
      this.autorizar()
      console.log("autorizando")
      return;
    }
    if (this.btnClicked == this.ACTIONSenum.DESAUTORIZAR) {
      console.log("Desautorizando")
      this.desautorizar();
      return;
    }
    if (this.btnClicked == 3) {
      return;
    }

    this.modalService.dismissAll()

  }

  autorizar() {

    this.isAutorizando = true;
    this.actualizarEstadoArticulos();

  }

  desautorizar() {
    this.isAutorizando = false;
    this.actualizarEstadoArticulos()
  }

  // autorizarMasiva() {

  //   this.httpService.DoPostAny<any>(DataApi.NivelAutorizacion,
  //     "AutorizarArticulosMasivoSegunNivelUsuario", Number(this.authService.tokenDecoded.nameid)).subscribe(response => {

  //       if (!response.ok) {
  //         this.toastService.error(response.errores[0]);
  //         console.error(response.errores[0]);
  //       } else {
  //         this.toastService.success("Realizado", "OK");
  //         this.getData()
  //       }
  //     }, error => {
  //       this.toastService.error("No se pudo realizar", "Error conexion al servidor");
  //       console.error(error)
  //     });

  // }


  actualizarEstadoArticulos() {

    this.cargandoAutorizacion = true;

    let ultimoEstado = this.estadosAutorizacion[this.estadosAutorizacion.length - 1].codigo;

    let param = {
      "IsAprobado": this.estadoAutorizacionUsuario == ultimoEstado && this.isAutorizando,
      "UsuarioID": Number(this.authService.tokenDecoded.nameid),
      "IsAutorizando": this.isAutorizando,
      "EstadoAutorizacion": this.isAutorizando ? this.estadoAutorizacionUsuario : this.estadoIDAutorizacionDefault,
      "EstadoDefault": this.estadoIDAutorizacionDefault,
      "EstadoUsuariosNotificacion": this.getEstadoUsuariosEnviarCorreoNotificacion(),
      "Pedido": this.itemSeleccionado,
      "Comentario": this.comentario,
    }

    this.httpService.DoPostAny<any>(DataApi.Cotizacion,
      "UpdateEstadoAutorizacionPedido", param).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
          console.error(response.errores[0]);

        } else {
          this.toastService.success("Realizado", "OK");
          this.enviarNotificacionCorreoUsuarios(param);
          this.getData()
        }
        this.cargandoAutorizacion = false;
        this.modalService.dismissAll()
      }, error => {
        this.toastService.error("No se pudo actualizar el estado.",
          "Error conexion al servidor");
      });

  }

  getEstadoUsuariosEnviarCorreoNotificacion(): number {

    return this.isAutorizando && this.estadoAutorizacionSiguiente ?
      this.estadoAutorizacionSiguiente.codigo : 0

  }


  enviarNotificacionCorreoUsuarios(param: any) {
    this.httpService.DoPostAny<any>(DataApi.Cotizacion,
      "EnviarCorreoAutorizacionPedido", param).subscribe(response => {
        if (!response.ok) {
          console.error(response.errores[0]);
        } else {
          console.log("Correo enviado");
        }
      }, error => {
        console.error(error);
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
    let parametros = {
      "ArticuloID": this.itemSeleccionado.id,
      // "ListaPrecioID": this.itemSeleccionado.listaPrecioID
    }
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



  guardarComentario() {

    if (this.comentario.trim().length < 3) {
      return
    }

    let parametros = {
      "Id": 0,
      "Comentario": this.comentario,
      // "ListaPrecioID": this.itemSeleccionado.listaPrecioID,
      "ArticuloID": this.itemSeleccionado.id,
      "UsuarioID": Number(this.authService.tokenDecoded.nameid),
      "Fecha": new Date(),
      "Usuario": this.authService.tokenDecoded.given_name,
      // "ListaPrecio": this.itemSeleccionado.listaPrecio,
      // "Articulo": this.itemSeleccionado.nombre
    }

    this.cargandoModal = true;
    this.httpService.DoPostAny<any>(DataApi.ListaPrecio,
      "InsertarListaPrecioArticuloComentario", parametros).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
          console.error(response.errores[0]);

        } else {
          this.toastService.success("Realizado", "OK");
          this.comentario = ""
          this.enviarNotificacionCorreoNuevoComentario(parametros)
          this.getComentarios()
        }
      }, error => {
        this.cargandoModal = false;
        this.toastService.error("No se pudo actualizar el estado.",
          "Error conexion al servidor");
      });
  }

  enviarNotificacionCorreoNuevoComentario(param: any) {

    this.httpService.DoPostAny<any>(DataApi.ListaPrecio,
      "EnviarCorreoNotificacionArticuloComentario", param).subscribe(response => {

        if (!response.ok) {
          // this.toastService.error(response.errores[0]);
          console.error(response.errores[0]);
        } else {
          // this.toastService.success("Notificaciones enviadas", "OK");
        }
      }, error => {
        console.error(error)
      });

  }


  exportarReporteExcel() {
    this.loadingReporteExcel = true;

    this.httpService.DoPostAny<ArticuloListaPrecioViewModel>(DataApi.Articulo,
      "GetArticulosAutorizacionExcelExport", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {

          const ws2: XLSX.WorkSheet = XLSX.utils.json_to_sheet(response.records);

          /* generate workbook and add the worksheet */
          const wb: XLSX.WorkBook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws2, 'Autorizaciones');

          /* save to file */
          XLSX.writeFile(wb, "Autorización listado | Reporte.xlsx");
        }


        this.loadingReporteExcel = false;
      }, error => {
        this.loadingReporteExcel = false;
        this.toastService.error("No se pudo obtener el reporte", "Error conexion al servidor");
      });
  }


  //DETALLE PEDIDOS 

  openModalDetalle(content, cotizacion: CotizacionListadoViewModel) {
    this.cotizacionDetalles = [];
    this.getCotizacionDetalle(cotizacion.id);
    this.cotizacionSeleccionada = cotizacion;
    this.modalService.open(content, { size: 'lg', });
  }


  getCotizacionDetalle(cotizacionID: number) {
    this.loadingCotizacionDetalle = true;
    this.httpService.DoPostAny<CotizacionDetalleViewModel>(DataApi.Cotizacion,
      "GetCotizacionDetalles", cotizacionID).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.cotizacionDetalles = response.records;
        }
        this.loadingCotizacionDetalle = false;
      }, error => {
        this.loadingCotizacionDetalle = false;
        this.toastService.error("No se pudo obtener el detalle", "Error conexion al servidor");
      });
  }


  getFacturasPendientesPago(clienteID: number) {
    this.loadingFacturasPendientesPago = true;
    this.httpService.DoPostAny<Factura>(DataApi.Factura,
      "GetFacturasPendientePago", clienteID).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
          console.error(response.errores[0])
        } else {
          this.facturasPendientesPago = response.records;
          this.totalPendientePagar = this.facturasPendientesPago.reduce((sum, current) => sum + (current.total - current.pagos), 0)
        }
        this.loadingFacturasPendientesPago = false;
      }, error => {
        this.loadingFacturasPendientesPago = false;
        this.toastService.error("No se pudo obtener las facturas pendientes", "Error conexion al servidor");
      });
  }




}
