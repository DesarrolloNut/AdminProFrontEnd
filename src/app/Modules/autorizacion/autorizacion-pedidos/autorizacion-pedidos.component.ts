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
import { AutorizacionHistoricoListadoViewModel } from '../models/AutorizacionHistoricoListadoViewModel';

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

  // btnClicked: number;
  isAutorizando: boolean;
  cargandoAutorizacion: boolean;
  // itemSeleccionado: CotizacionListadoViewModel;

  //comentarios
  comentario: string;

  cotizacionDetalles: any[];
  cotizacionSeleccionada: CotizacionListadoViewModel;
  loadingCotizacionDetalle: boolean;

  ACTIONSenum = btnClickedEnum;
  facturasPendientesPago: Factura[] = [];
  loadingFacturasPendientesPago: boolean;
  totalPendientePagar: number;
  porcentajeCalculado: number;

  cotizacionPromesaTipos: ComboBox[];
  cotizacionPromesaSelected: number = 1;
  fechaPromesaModel: any;
  autorizacionHistorico: AutorizacionHistoricoListadoViewModel[];
  promedioDias: number = 0;
  _math = Math;
  constructor(private toastService: ToastrService,
    private httpService: BackendService,
    private authService: AuthenticationService,
    private modalService: NgbModal,
    public permissionsService: NgxPermissionsService,
  ) { }


  ngOnInit(): void {
    this.getCotizacionPromesaTipo()
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
          // this.estadoIDAutorizacionDefault = response.records[0].codigo; //para cuando mande a rechazar
          this.estadoIDAutorizacionDefault = 1; //para cuando mande a rechazar
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

    let estadoActualPosicion = this.estadosAutorizacion.indexOf(estadoUsuario);
    this.estadoAutorizacionAnterior = this.estadosAutorizacion[estadoActualPosicion - 1]

    if (this.estadoAutorizacionAnterior) {
      // this.estadoAutorizacionComboModel = this.estadoAutorizacionAnterior.codigo;
      this.estadoAutorizacionComboModel = 0;
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

  openModalAutorizar(content, item: CotizacionListadoViewModel) {
    this.comentario = null;
    this.fechaPromesaModel = null;
    this.cotizacionPromesaSelected = 1
    this.cotizacionDetalles = [];
    this.promedioDias = 0

    this.cotizacionSeleccionada = item;

    this.getFacturasPendientesPago(item.clienteId);
    this.getCotizacionDetalle(item.id);
    this.getAutorizacionesHistorico();

    this.modalService.open(content, { windowClass: "myCustomModalClass" });

  }

  onBtnModalOk() {

    if (!this.comentario || this.comentario.length < 10) {
      this.toastService.warning("Ingresar comentario válido");
      return;
    }

    // if (this.btnClicked == this.ACTIONSenum.AUTORIZAR) {
    //   this.autorizar()
    //   console.log("autorizando")
    //   return;
    // }
    // if (this.btnClicked == this.ACTIONSenum.DESAUTORIZAR) {
    //   console.log("Desautorizando")
    //   this.desautorizar();
    //   return;
    // }
    // if (this.btnClicked == 3) {
    //   return;
    // }

    this.modalService.dismissAll()

  }

  autorizar() {

    //comentario obligatorioc cuando sea gestionar
    if (this.estadoAutorizacionComboModel == 1 && (!this.comentario || this.comentario.length < 10)) {
      this.toastService.warning("Ingresar comentario válido");
      return;
    }

    this.isAutorizando = true;
    this.actualizarEstadoArticulos();

  }

  desautorizar() {

    //comentario obligatorioc cuando sea gestionar
    if (this.estadoAutorizacionComboModel == 1 && (!this.comentario || this.comentario.length < 10)) {
      this.toastService.warning("Ingresar comentario válido");
      return;
    }

    this.isAutorizando = false;
    this.actualizarEstadoArticulos()
  }


  actualizarEstadoArticulos() {

    this.cargandoAutorizacion = true;

    let ultimoEstado = this.estadosAutorizacion[this.estadosAutorizacion.length - 1].codigo;

    let fechaPromesa = this.cotizacionPromesaSelected == 2 && this.isAutorizando ?
      this.fechaPromesaModel : null;

    this.cotizacionSeleccionada.fechaPromesa = fechaPromesa;
    this.cotizacionSeleccionada.tipoPromesaID = this.isAutorizando ? this.cotizacionPromesaSelected : 0;

    let param = {
      "IsAprobado": this.estadoAutorizacionUsuario == ultimoEstado && this.isAutorizando,
      "UsuarioID": Number(this.authService.tokenDecoded.nameid),
      "IsAutorizando": this.isAutorizando,
      "EstadoAutorizacion": this.isAutorizando ? this.estadoAutorizacionUsuario : this.estadoIDAutorizacionDefault,
      "EstadoDefault": this.estadoIDAutorizacionDefault,
      "EstadoUsuariosNotificacion": this.getEstadoUsuariosEnviarCorreoNotificacion(),
      "Pedido": this.cotizacionSeleccionada,
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

  //DETALLE PEDIDOS 

  getCotizacionDetalle(cotizacionID: number) {
    this.loadingCotizacionDetalle = true;
    this.httpService.DoPostAny<CotizacionDetalleViewModel>(DataApi.Cotizacion,
      "GetCotizacionDetalles", cotizacionID).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.cotizacionDetalles = response.records;
        }
        this.calcularPorcentaje();
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

          console.table(this.facturasPendientesPago)

          this.totalPendientePagar = this.facturasPendientesPago.reduce((sum, current) => sum + (current.total - current.pagos), 0)
          this.promedioDias = this.facturasPendientesPago.reduce((sum, current) => sum + current.diasVencimiento, 0) / this.facturasPendientesPago.length;

          this.promedioDias = this.promedioDias ? this.promedioDias : 0

        }
        this.calcularPorcentaje();
        this.loadingFacturasPendientesPago = false;
      }, error => {
        this.loadingFacturasPendientesPago = false;
        this.toastService.error("No se pudo obtener las facturas pendientes", "Error conexion al servidor");
      });
  }

  calcularPorcentaje() {

    this.porcentajeCalculado = 0

    if (this.cotizacionSeleccionada && this.cotizacionSeleccionada.limiteCredito > 0) {
      this.porcentajeCalculado = ((this.cotizacionSeleccionada.limiteCredito - this.cotizacionSeleccionada.totalNeto -
        this.totalPendientePagar) / this.cotizacionSeleccionada.limiteCredito) * 100;
    }

  }



  getCotizacionPromesaTipo() {
    let parametros: Parametro[] = []
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetCotizacionPromesaTipo", parametros).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
          console.error(response.errores[0]);
        } else {
          this.cotizacionPromesaTipos = response.records;
        }

      }, error => {
        this.toastService.error("No se pudo obtener los tipos promesa.", "Error conexion al servidor");
        setTimeout(() => {
          this.getCotizacionPromesaTipo()
        }, 1000);

      });
  }


  getAutorizacionesHistorico() {

    this.httpService.DoPostAny<AutorizacionHistoricoListadoViewModel>(DataApi.AutorizacionHistorico,
      "GetAutorizacionesHistoricoByPedidoID", Number(this.cotizacionSeleccionada.id)).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
          console.error(response.errores[0]);
        } else {
          this.autorizacionHistorico = response.records;
          if (this.autorizacionHistorico) {
            this.autorizacionHistorico.forEach(a => a.jsonInfo = JSON.parse(a.jsonInfo)[0]);
          }

        }

      }, error => {
        this.toastService.error("No se pudo obtener el historial de autorizaciones.", "Error conexion al servidor");
        setTimeout(() => {
          this.getAutorizacionesHistorico()
        }, 1000);

      });
  }




}
