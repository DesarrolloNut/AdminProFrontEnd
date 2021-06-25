import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxPermissionsService } from 'ngx-permissions';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'src/app/core/authentication/service/authentication.service';
import { Parametro } from 'src/app/core/http/model/Parametro';
import { ResponseContenido } from 'src/app/core/http/model/ResponseContenido';
import { BackendService } from 'src/app/core/http/service/backend.service';
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
  estadoAutorizacionFinal: number;

  constructor(private toastService: ToastrService,
    private httpService: BackendService,
    private authService: AuthenticationService,
    private modalService: NgbModal,
    public permissionsService: NgxPermissionsService,
  ) { }


  ngOnInit(): void {
    this.getEstadoAutorizacionUsuario()
  }

  getData() {
    this.Cargando = true;

    let parametros: Parametro[] = [
      { key: "EstadoAutorizacionID", value: this.estadoAutorizacionComboModel },
      { key: "Search", value: this.Search },
    ]

    this.httpService.GetAllWithPagination<SolicitudCompraListadoViewModel>(DataApi.SolicitudCompra,
      "GetSolicitudCompraListadoAutorizacion", "ID", this.paginaNumeroActual,
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
          this.estadoIDAutorizacionDefault = response.records[0].codigo;

          this.getSiguienteEstado()//almacena en una variable el siguiente estado
          this.getAnteriorEstadoAutorizacion()//almacena en una variable el anterior estado
          this.getEstadoAutorizacionFinal()//almacena en una variable el final estado
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

    this.estadoAutorizacionAnterior = this.estadosAutorizacion[estadoActualPosicion - 1]
    if (this.estadoAutorizacionAnterior) {
      this.estadoAutorizacionComboModel = this.estadoAutorizacionAnterior.codigo;
    }
  }

  getEstadoAutorizacionFinal() {
    this.estadoAutorizacionFinal = this.estadosAutorizacion[this.estadosAutorizacion.length - 1].codigo;
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


  autorizar(item: SolicitudCompraListadoViewModel) {


    let parametro = {
      "SolicitudCompra": item,
      "EstadoAutorizacion": this.estadoAutorizacionUsuario,
      "EstadoAutorizacionSiguiente": this.estadoAutorizacionSiguiente ? this.estadoAutorizacionSiguiente.codigo : 0,
      "IsAutorizacionFinal": this.estadoAutorizacionUsuario == this.estadoAutorizacionFinal,
    }

    this.httpService.DoPostAny<any>(DataApi.SolicitudCompra,
      "AutorizaSolicitudCompra", parametro).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
          console.error(response.errores[0]);

        } else {
          this.toastService.success("Realizado", "OK");
          this.getData()
          if (!parametro.IsAutorizacionFinal) {
            this.enviarCorreoAutorizacionPendiente(this.estadoAutorizacionSiguiente.codigo)
          }
        }

      }, error => {
        this.toastService.error("No se pudo actualizar el estado.",
          "Error conexion al servidor");
      });

  }


  desautorizar(item: SolicitudCompraListadoViewModel) {

    let parametro = {
      "SolicitudCompra": item,
      "EstadoAutorizacion": this.estadoIDAutorizacionDefault,
      "EstadoAutorizacionSiguiente": 0,
      "IsAutorizacionFinal": false,
    }

    this.httpService.DoPostAny<any>(DataApi.SolicitudCompra,
      "AutorizaSolicitudCompra", parametro).subscribe(response => {

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

  enviarCorreoAutorizacionPendiente(estadoID: number) {
    console.log(estadoID)
    this.httpService.DoPostAny<any>(DataApi.SolicitudCompra,
      "EnviarCorreoAutorizacionPendiente", estadoID).subscribe(response => {

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



}
