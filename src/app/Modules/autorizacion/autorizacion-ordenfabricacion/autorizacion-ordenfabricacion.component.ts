import { OrdenFabricacionDetalleEstadoEnum, OrdenFabricacionEstadoEnum } from './../../produccion/ordenfabricacion/models/OrdenFabricacionEstadoEnum';
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
import { OrdenFabricacionVista } from '../../produccion/ordenfabricacion/models/OrdenFabricacionVista';
import { OrdenFabricacion } from '../../produccion/ordenfabricacion/models/OrdenFabricacion';
import { Articulo } from '../../servicios/recepcion/models/Articulo';

@Component({
  selector: 'app-autorizacion-ordenfabricacion',
  templateUrl: './autorizacion-ordenfabricacion.component.html',
  styleUrls: ['./autorizacion-ordenfabricacion.component.scss']
})
export class AutorizacionOrdenfabricacionComponent implements OnInit {

  // COPIAR AL CREAR UN LISTADO NUEVO
  Search: string = "";
  paginaNumeroActual = 1;
  Cargando: boolean = false;
  totalPaginas: number = 0;
  paginaSize: number = 10;
  paginaTotalRecords: number = 0;
  data: OrdenFabricacionVista[] = [] //tu modelo

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
  ModelSelected: OrdenFabricacionVista;
  CargandoDetalle: boolean;
  dataDetalle: OrdenFabricacionVista[];
  // IsComsumido: boolean = false;
  ordenfabricacion: OrdenFabricacion =  new OrdenFabricacion();
  articulo: Articulo = new Articulo();
  porcentajeDesviacion: number = 0;
  btnGuardarCargando: boolean;

  public get ValidOrden(): typeof OrdenFabricacionEstadoEnum {
    return OrdenFabricacionEstadoEnum;
  }

  public get ValidOrdenDetalle(): typeof OrdenFabricacionDetalleEstadoEnum {
    return OrdenFabricacionDetalleEstadoEnum;
  }

  constructor(private toastService: ToastrService,
    private httpService: BackendService,
    private authService: AuthenticationService,
    private modalService: NgbModal,
    public permissionsService: NgxPermissionsService,
  ) { }


  ngOnInit(): void {
    this.getEstadoAutorizacionUsuario();
  }

  getData() {
    this.Cargando = true;

    let parametros: Parametro[] = [
      { key: "EstadoAutorizacionID", value: this.estadoAutorizacionComboModel },
      { key: "Search", value: this.Search },
    ]

    this.httpService.GetAllWithPagination<OrdenFabricacionVista>(DataApi.OrdenFabricacion, "GetOrdenFabricacionListadoAutorizacion", "Id", this.paginaNumeroActual,
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
      value: EstadosGeneralesKeyEnum.ORDENFABRICACION
    }]

    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetEstadoForKeyComboBox", parametros).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
          console.error(response.errores[0]);
        } else {
          this.estadosAutorizacion = response.records;
          this.estadoIDAutorizacionDefault = response.records[0].codigo;
          this.estadoAutorizacionComboModel = response.records[0].codigo;
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
      "KeynameModule": EstadosGeneralesKeyEnum.ORDENFABRICACION,
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

  autorizar(item: any, content: any) {
    this.isAutorizando = true;
    //let ultimoEstado = this.estadosAutorizacion[this.estadosAutorizacion.length - 1].codigo;
      this.itemSeleccionado = item;

    if (this.estadoAutorizacionUsuario > this.ValidOrden.PENDIENTECERRARSUPERVISORPRODUCCION && this.isAutorizando) {
          this.getOrdenFabricacion(item.id);
          this.modalService.open(content, { size: 'lg' });
          //this.getPorcentaje();
      }else if (this.estadoAutorizacionUsuario == this.ValidOrden.PENDIENTECERRARSUPERVISORPRODUCCION && this.isAutorizando) {
        this.actualizarEstadoArticulos(item, this.ValidOrden.CERRADA)
    }else{
        this.actualizarEstadoArticulos(item)
      }
  }

  autorizarModal(){
    // this.estadoAutorizacionUsuario = this.ValidOrden.CERRADA;
    this.actualizarEstadoArticulos(this.itemSeleccionado, this.ValidOrden.CERRADA)
  }
  autorizarModalDetalle(model:OrdenFabricacionVista){
    this.updateOrdenDetalle(model, true);
  }

  desautorizar(item: any) {
    this.isAutorizando = false;
    this.actualizarEstadoArticulos(item)
  }

  desautorizarModal() {
    this.isAutorizando = false;
    // this.estadoAutorizacionUsuario = this.ValidOrden.PLANIFICADA
    this.actualizarEstadoArticulos(this.itemSeleccionado, this.ValidOrden.PLANIFICADA)
  }

  desautorizarModalDetalle(model:OrdenFabricacionVista) {
    this.updateOrdenDetalle(model, false);
  }

  getPorcentaje():number{
      let costoUnitario = (this.ordenfabricacion.costoReal / this.ordenfabricacion.cantidad);
      let diferencia = (costoUnitario / this.articulo.costoObjetivo);
      let porcentajeDiferencia = (diferencia * 100);
      let porcentaje = (porcentajeDiferencia - 100);
      //this.porcentajeDesviacion = porcentaje;
      return porcentaje;

  }

  updateOrdenDetalle(model:OrdenFabricacionVista, IsAutorizado: boolean) {

    model.cargando = true;

    this.httpService.DoPostAny<any>(DataApi.OrdenFabricacionDetalle,
      "UpdateOrdenFabricacionDetalleEnAutorizacion", {OrdenDetalleId: model.id, Autorizado: IsAutorizado}).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
          console.error(response.errores[0]);
          model.cargando = false;

        } else {
          this.toastService.success("Realizado", "OK");
          this.getData()
          this.getDataDetalle(this.ModelSelected.id);
          model.cargando = false;

        }
      }, error => {
        this.toastService.error("No se pudo realizar", "Error conexion al servidor");
        console.error(error)
        model.cargando = false;

      });

  }


  actualizarEstadoArticulos(item: any, estado = null) {


    // this.getEstaComsumido(item.id);
    // if(this.IsComsumido && OrdenFabricacionEstadoEnum.PENDIENTECONSUMO == item.estadoId){
    //  this.toastService.warning("No se a consumido todos los materiales de la orden de fabricación. ");
    //   return;
    // }


    item.cargando = true;
    this.btnGuardarCargando = true;
    let EstadoUsuariosNotificacion: number;

    if (this.isAutorizando) {
      EstadoUsuariosNotificacion = this.estadoAutorizacionSiguiente ? this.estadoAutorizacionSiguiente.codigo : 1
    } else {
      EstadoUsuariosNotificacion = this.estadoIDAutorizacionDefault;
    }

    if(estado == null){
      estado = this.isAutorizando ? this.estadoAutorizacionUsuario : this.estadoIDAutorizacionDefault;
    }

    let ultimoEstado = this.estadosAutorizacion[this.estadosAutorizacion.length - 1].codigo;
    let articulos = []
    articulos.push(item)
    let param = {
      "IsAprobado": this.estadoAutorizacionUsuario == ultimoEstado && this.isAutorizando,
      "IsAutorizando": this.isAutorizando,
      "EstadoAutorizacion": estado,
      "EstadoDefault": this.estadoIDAutorizacionDefault,
      "EstadoUsuariosNotificacion": EstadoUsuariosNotificacion,
      "Seleccion": articulos.
        map(x => { return { "ArticuloID": x.id } })
    }




    item.cargando = false;
    this.btnGuardarCargando = false;
    this.modalService.dismissAll();
    this.httpService.DoPostAny<any>(DataApi.NivelAutorizacion,
      "ActualizarOrdenFabricacionEstadoID", param).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
          console.error(response.errores[0]);

        } else {
          if(estado == OrdenFabricacionEstadoEnum.CERRADA ){
            this.UpdateFechaCerrada(item.id);
            this.UpdateEstadoERPExterno(item.id);
          }
          this.toastService.success("Realizado", "OK");
          this.getData()
        }

      }, error => {
        this.toastService.error("No se pudo actualizar el estado.",
          "Error conexion al servidor");
      });

  }

  openModalDevolucionDetalle(content, model: OrdenFabricacionVista) {
    this.ModelSelected = model;
    this.getDataDetalle(model.id);
    this.modalService.open(content, { windowClass: "myCustomModalClass", backdrop: "static", });
  }

  getDataDetalle(Id:number) {
    this.CargandoDetalle = true;

    this.httpService.DoPostAny<OrdenFabricacionVista>(DataApi.OrdenFabricacionDetalle, "GetOrdenFabricacionDetalleVistaByID", Id).subscribe(x => {

        if (x.ok) {
          this.dataDetalle = x.records;
          // console.log(x.records);

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

  // getEstaComsumido(Id:number) {
  //   this.httpService.DoPostAny<any>(DataApi.OrdenFabricacion, "GetEstaComsumido", Id).subscribe(x => {
  //       if (x.ok) {
  //         // console.log(x.records);
  //         this.IsComsumido = x.records[0];
  //       } else {
  //         this.toastService.error(x.errores[0]);
  //         console.error(x.errores[0]);
  //       }
  //     }, error => {
  //       console.error(error);
  //       this.toastService.error("Error conexion al servidor");
  //     });

  // }

  UpdateFechaCerrada(Id:number) {

    this.httpService.DoPostAny<any>(DataApi.OrdenFabricacion, "UpdateFechaCerrada", Id).subscribe(x => {
        if (x.ok) {
          // console.log(x.records);
          // this.IsComsumido = x.records[0];
        } else {
          this.toastService.error(x.errores[0]);
          console.error(x.errores[0]);
        }
      }, error => {
        console.error(error);
        this.toastService.error("Error conexion al servidor");
      });

  }

  UpdateEstadoERPExterno(Id:number) {

    this.httpService.DoPostAny<any>(DataApi.OrdenFabricacion, "UpdateEstadoERPExterno", Id).subscribe(x => {
        if (x.ok) {
          // console.log(x.records);
          // this.IsComsumido = x.records[0];
        } else {
          this.toastService.error(x.errores[0]);
          console.error(x.errores[0]);
        }
      }, error => {
        console.error(error);
        this.toastService.error("Error conexion al servidor");
      });

  }

  getOrdenFabricacion(id: number) {

    this.httpService
      .DoPostAny<OrdenFabricacion>(
        DataApi.OrdenFabricacion,
        "GetOrdenFabricacionByID",
        id
      )
      .subscribe(
        (response) => {
          if (!response.ok) {
            this.toastService.error(response.errores[0]);
          } else {
            this.getArticuloById(response.records[0].articuloId);
            this.ordenfabricacion = response.records[0];

          }
        },
        (error) => {
          this.toastService.error(
            "No se pudo obtener la orden.",
            "Error conexion al servidor"
          );

          setTimeout(() => {
            //this.getOrdenFabricacion();
          }, 1000);
        }
      );
  }

  getArticuloById(ArticuloID: number) {
    this.httpService
      .DoPostAny<Articulo>(DataApi.Articulo, "GetArticuloByID", ArticuloID)
      .subscribe(
        (response) => {
          if (!response.ok) {
            this.toastService.error(response.errores[0]);
          } else {
            //validar que existe
            if (
              response != null &&
              response.records != null &&
              response.records.length > 0
            ) {
              let record = response.records[0];
              this.articulo = record;
              // console.log(record);
              //this.getOrdenFabricacionDetalle(record.codigoReferencia);
            } else {
              this.articulo = null;
            }
          }
        },
        (error) => {
          this.toastService.error("Error conexion al servidor");
        }
      );
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
