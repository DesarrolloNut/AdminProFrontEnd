import { OrdenFabricacionDetalle } from "./../models/OrdenFabricacionDetalle";
import { OrdenFabricacionVista } from "./../models/OrdenFabricacionVista";
import { Component, OnInit } from "@angular/core";
import { NgxPermissionsService } from "ngx-permissions";
import { ToastrService } from "ngx-toastr";
import { Parametro } from "src/app/core/http/model/Parametro";
import { ResponseContenido } from "src/app/core/http/model/ResponseContenido";
import { BackendService } from "src/app/core/http/service/backend.service";
import { DataApi } from "src/app/shared/enums/DataApi.enum";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { Articulo } from "src/app/Modules/servicios/recepcion/models/Articulo";
import { OrdenFabricacion } from "../models/OrdenFabricacion";
import { ListaMaterialesHeader } from "../models/ListaMaterialesHeader";
import { Router, ActivatedRoute } from "@angular/router";
import { OrdenfabricacionPesajeService } from "src/app/Services/ordenfabricacion-pesaje.service";
import { OrdenFabricacionDetalleEstadoEnum, OrdenFabricacionEstadoEnum } from "../models/OrdenFabricacionEstadoEnum";
import { EstadosGeneralesKeyEnum } from "src/app/shared/enums/EstadosGeneralesKeyEnum";
import { ComboBox } from "src/app/shared/model/ComboBox";
import { LotesOrdenFabricacion } from "../models/LotesOrdenFabricacion";
import { Console } from "console";
import { Configuraciones } from "src/app/shared/enums/Configuraciones";

@Component({
  selector: "app-ordenfabricacion-listado",
  templateUrl: "./ordenfabricacion-listado.component.html",
  styleUrls: ["./ordenfabricacion-listado.component.scss"],
})
export class OrdenfabricacionListadoComponent implements OnInit {
  // COPIAR AL CREAR UN LISTADO NUEVO
  Search: string = "";
  paginaNumeroActual = 1;
  Cargando: boolean = false;
  btnGuardarCargando: boolean = false;
  CargandoBar: boolean = false;
  totalPaginas: number = 0;
  paginaSize: number = 5;
  paginaTotalRecords: number = 0;
  data: OrdenFabricacionVista[] = []; //tu modelo
  ofheader: ListaMaterialesHeader = new ListaMaterialesHeader();
  loadingArticulosExtras: boolean;
  articulosExtras: OrdenFabricacionVista[] = [];
  searching: boolean;
  articulo: Articulo = new Articulo();
  ordenfabricacion: OrdenFabricacion = new OrdenFabricacion();
  ordenfabricaciondetalle: OrdenFabricacionDetalle =
    new OrdenFabricacionDetalle();

  //Eliminar cuando el pesaje este listo
  IsPesaje: boolean = false;
  loadingSaveConsumido: boolean;
  // IsClose: boolean = false;
  IsPesajeProducida: boolean;
  loadingSaveProducida: boolean;
  validOrdenList: OrdenFabricacionEstadoEnum;
  estadosAutorizacion: any[];
  OrdenFilterEstadoId: number = 0;
  loadingEnviando: boolean;
  loadingLote: boolean;
  lote: LotesOrdenFabricacion = new LotesOrdenFabricacion();
  selectOrden: OrdenFabricacionVista = new OrdenFabricacionVista();
  ORDENFABRICACION_CONSUMO_MAXIMO: number = 0;
  ORDENFABRICACION_CONSUMO_MINIMO: number = 0;
  selectMaterial: OrdenFabricacionVista;
  ModalAutorizarArticulo: NgbModalRef;


  public get ValidOrden(): typeof OrdenFabricacionEstadoEnum {
    return OrdenFabricacionEstadoEnum;
  }


  public get ValidOrdenDetalle(): typeof OrdenFabricacionDetalleEstadoEnum {
    return OrdenFabricacionDetalleEstadoEnum;
  }

  constructor(
    private toastService: ToastrService,
    private httpService: BackendService,
    public permissionsService: NgxPermissionsService,
    private modalService: NgbModal,
    private router: Router,
    private ordenfabriService: OrdenfabricacionPesajeService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.getData();
    this.getEstadosAutorizacion();
    this.getOrdenFabMaximo();
    this.getOrdenFabMinimo();
  }

GetNameEstado(estadoId: number){
  let data = OrdenFabricacionEstadoEnum[estadoId] ;
  return data;
}

  getData() {
    this.Cargando = true;

    let parametros: Parametro[] = [
      { key: "Search", value: this.Search },
      { key: "OrdenFilterEstadoId", value: this.OrdenFilterEstadoId ?? 0 },

    ];

    this.httpService
      .GetAllWithPagination<OrdenFabricacionVista>(
        DataApi.OrdenFabricacion,
        "GetOrdenFabricacionListado",
        "ID",
        this.paginaNumeroActual,
        this.paginaSize,
        false,
        parametros
      )
      .subscribe(
        (x) => {
          // console.log(x);
          if (x.ok) {
            this.data = x.records;
            this.asignarPagination(x);
          } else {
            this.toastService.error(x.errores[0]);
            console.error(x.errores[0]);
          }
          this.Cargando = false;
        },
        (error) => {
          console.error(error);
          this.toastService.error("Error conexion al servidor");
          this.Cargando = false;
        }
      );
  }

  OnChangeIsPesaje(articulosExtras: OrdenFabricacionVista) {
    articulosExtras.isPesaje = !articulosExtras.isPesaje;
  }

  OnChangeProducida() {
    this.IsPesajeProducida = !this.IsPesajeProducida;
  }

  OnChangePagePesaje(content, articulosExtras, isTerminalReport) {
    //this.modalService.dismissAll();
    let data = <OrdenFabricacionVista> articulosExtras;
    if(isTerminalReport){
      data.articulo = this.articulo.codigoReferencia;
    }

    this.ordenfabriService.SaveOrdenFabricacion(articulosExtras);
    this.ordenfabriService.SaveListArticulosDetalles(this.articulosExtras);
    this.modalService.open(content, {
      windowClass: "myCustomModalClass",
      backdrop: "static",
    });
    //this.router.navigateByUrl("/produccion/ordenfabricacionpesaje");
  }

  OnSubmitConsumido(model: OrdenFabricacionVista, content){
    // console.log(model);
    this.selectMaterial = model;
    let maximo = (model.cantidadRequerida * this.ORDENFABRICACION_CONSUMO_MAXIMO)
    let minimo = ((model.cantidadRequerida * this.ORDENFABRICACION_CONSUMO_MINIMO) - 1)

    // console.log("maximo", maximo)
    // console.log("minimo", minimo)

    if (model.lote == "" && model.gestionado == true) {
      this.toastService.warning("Digita el lote.");
      return;
    }

    if (model.consumido < model.cantidadRequerida) {
      this.ModalAutorizarArticulo = this.modalService.open(content, { size:'lg'});
      return;
    }

    if (this.lote.cantidad <= 0 && model.gestionado == true) {
      this.toastService.warning("No a digitado un lote disponible.");
      return;
    }

    if (this.lote.cantidad < maximo && model.gestionado == true) {
      this.toastService.warning("El lote no tiene disponible la cantidad que desea consumir.");
      return;
    }

    if (model.consumido <= 0) {
      this.toastService.warning("No a digitado una cantidad valida.");
      return;
    }

 


    if (model.consumido > maximo) {
      this.toastService.warning("Esta consumiendo mas del parametro permitido.");
      return;
    }

    // if (model.consumido < minimo) {
    //   this.toastService.warning("Esta consumiendo menos del parametro permitido.");
    //   return;
    // }

    this.OnSaveConsumido(model);
  }

  OnSaveConsumido(model: OrdenFabricacionVista) {
    // if((model.lote == null || model.lote.trim() == "") && model.gestionado == true){
      //   this.toastService.warning("Debe poner un lote.");
      //   return;
      // }
      model.loadingSaveConsumido = true;
      
      this.httpService
        .DoPostAny<OrdenFabricacionVista>(
          DataApi.OrdenFabricacionDetalle,
          "UpdateConsumido",
          model
        )
        .subscribe( (response) => {
            if (!response.ok) {
              this.toastService.error(response.errores[0]);
            } else {
              model.isPesaje = !model.isPesaje;
              model.estadoHijoId = OrdenFabricacionDetalleEstadoEnum.CONSUMIDO;
              this.updateEstadoOrdenFabricacionDetalle(model);
              this.getOrdenFabricacion(model.ordenFabricacionId);
              this.updateEstadoOrden();
              this.getData();


            }
            model.loadingSaveConsumido = false;
          },
          (error) => {
            model.loadingSaveConsumido = false;
            this.toastService.error(
              "No se pudo obtener los articulos extras",
              "Error conexion al servidor"
            );

            setTimeout(() => {
              //this.getOrdenFabricacion();
            }, 1000);
          }
        );

  }

  OnSaveConsumidoParaAutorizar(model: OrdenFabricacionVista, estado:OrdenFabricacionDetalleEstadoEnum) {
    // if((model.lote == null || model.lote.trim() == "") && model.gestionado == true){
      //   this.toastService.warning("Debe poner un lote.");
      //   return;
      // }
      model.loadingSaveConsumido = true;
      model.estadoHijoId = estado;
      this.httpService
        .DoPostAny<OrdenFabricacionVista>(
          DataApi.OrdenFabricacionDetalle,
          "UpdateConsumido",
          model
        )
        .subscribe(
          async (response) => {
            if (!response.ok) {
              this.toastService.error(response.errores[0]);
            } else {
              model.isPesaje = !model.isPesaje;
              await this.getOrdenFabricacion(model.ordenFabricacionId);
              await this.updateEstadoOrden();
              await this.getData();
              this.ModalAutorizarArticulo.dismiss();

            }
            model.loadingSaveConsumido = false;
          },
          (error) => {
            model.loadingSaveConsumido = false;
            this.toastService.error(
              "No se pudo obtener los articulos extras",
              "Error conexion al servidor"
            );

            setTimeout(() => {
              //this.getOrdenFabricacion();
            }, 1000);
          }
        );

  }

  updateEstadoOrden(){

    // console.log(this.articulosExtras);
    let ArtCantidad = this.articulosExtras.length;
    let ArtCunsumido = this.articulosExtras.filter(x => x.estadoHijoId == OrdenFabricacionDetalleEstadoEnum.CONSUMIDO).length;
    let EstaPendiente = this.articulosExtras.filter(x => x.estadoHijoId == OrdenFabricacionDetalleEstadoEnum.PENDIENTEAUTORIZAR).length;

    //  console.log(ArtCantidad)
    //  console.log(ArtCunsumido)
    //  console.log(EstaPendiente)

      if(ArtCunsumido >= 1 && ArtCantidad > 1 && this.selectOrden.estadoId == OrdenFabricacionEstadoEnum.PENDIENTECONSUMO){
        this.updateOrdenFabricacionEstado(this.ofheader.id, OrdenFabricacionEstadoEnum.PROCESANDOCONSUMO);
      }

    // SI TODOS LOS ARTICULOS ESTAN COSUMIDO
    if (ArtCantidad == ArtCunsumido) {
      this.updateOrdenFabricacionEstado(this.ofheader.id, OrdenFabricacionEstadoEnum.PENDIENTETERMINALREPORT);
        this.modalService.dismissAll();
    }

    if (ArtCantidad == (ArtCunsumido + EstaPendiente) && ArtCantidad != ArtCunsumido) {
      this.updateOrdenFabricacionEstado(this.ofheader.id, OrdenFabricacionEstadoEnum.PENDIENTEAUTORIZARCONSUMO);
        this.modalService.dismissAll();
    }



  }

  OnSubmitProducida(){


    if (this.ordenfabricacion.cantidadProducida <= 0) {
      this.toastService.warning("No a digitado una cantidad valida.");
      return;
    }

    if (this.ordenfabricacion.batch <= 0) {
      this.toastService.warning("No a digitado el batch.");
      return;
    }

    this.OnSaveProducida();
  }


  OnSaveProducida() {
    this.loadingSaveProducida = true;
    let data = this.ordenfabricacion ?? new OrdenFabricacion();
    // console.log(data);
    this.httpService
      .DoPostAny<OrdenFabricacionVista>(
        DataApi.OrdenFabricacion,
        "Update",
        data
      )
      .subscribe(
         async (response) => {
          // console.log(response);
          if (!response.ok) {
            this.toastService.error(response.errores[0]);
          } else {
            this.IsPesajeProducida = !this.IsPesajeProducida;
            await this.updateOrdenFabricacionEstadoPendiente(this.ofheader.id, this.ordenfabricacion.estadoId)
            // this.getOrdenFabricacion(this.ordenfabricacion.id);

          }
          this.loadingSaveProducida = false;
        },
        (error) => {
          this.loadingSaveProducida = false;
          this.toastService.error(
            "No se pudo obtener los articulos extras",
            "Error conexion al servidor"
          );

          // setTimeout(() => {
          //   //this.getOrdenFabricacion();
          // }, 1000);
        }
      );

  }

  openModalComfirm(content, modal: OrdenFabricacionVista) {
    this.getOrdenFabricacion(modal.id);
    this.modalService.open(content, { size:'lg'});
  }
  openModal(content, modal: OrdenFabricacionVista) {
    this.getOrdenFabricacion(modal.id);
    this.selectOrden = modal;
    this.modalService.open(content, {
      windowClass: "myCustomModalClass",
      backdrop: "static",
    });
  }

  openModalProducida(content, modal: OrdenFabricacionVista) {
    // console.log(modal)
    this.getOrdenFabricacion(modal.id);
    this.modalService.open(content, {
      windowClass: "myCustomModalClass",
      backdrop: "static",
    });
  }


  EnviarAutorizarModal(){
    this.btnGuardarCargando = true;

    const index =  this.articulosExtras.indexOf(this.selectMaterial);
    let ordendetalle = this.articulosExtras[index];
    // console.log(ordendetalle)
    this.OnSaveConsumidoParaAutorizar(ordendetalle, OrdenFabricacionDetalleEstadoEnum.PENDIENTEAUTORIZAR);
    this.btnGuardarCargando = false;
  }






  getOrdenFabricacion(id: number) {
    this.loadingArticulosExtras = true;

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
            this.ofheader.tipoId = response.records[0].ordenFabricacionTipoId;
            this.ofheader.estadoId = response.records[0].estadoId;
            this.ofheader.cantidadPlanificada = response.records[0].cantidad;
            this.ofheader.almacenId = response.records[0].almacenId;
            this.ofheader.fechaInicio = response.records[0].fechaInicio;
            this.ofheader.fechaCierre = response.records[0].fechaCierre;
            this.ofheader.id = response.records[0].id;
            this.ordenfabricacion = response.records[0];
            this.getOrdenFabricacionDetalle(response.records[0].id);
          }
          this.loadingArticulosExtras = false;
        },
        (error) => {
          this.loadingArticulosExtras = false;
          this.toastService.error(
            "No se pudo obtener los articulos extras",
            "Error conexion al servidor"
          );

          setTimeout(() => {
            //this.getOrdenFabricacion();
          }, 1000);
        }
      );
  }

  getOrdenFabricacionDetalle(ordenFabricacionId: number) {
    this.loadingArticulosExtras = true;

    this.httpService
      .DoPostAny<OrdenFabricacionVista>(
        DataApi.OrdenFabricacionDetalle,
        "GetOrdenFabricacionDetalleVistaByID",
        ordenFabricacionId
      )
      .subscribe(
        async (response) => {
          if (!response.ok) {
            this.toastService.error(response.errores[0]);
          } else {
            // console.log(response.records);
            this.articulosExtras = response.records;
            this.articulosExtras.forEach(
              (x) =>
                (x.cantidadRequerida = Number(
                  (x.cantidadBase * this.ofheader.cantidadPlanificada).toFixed(
                    6
                  )
                ))
            );
            for (const key in this.articulosExtras) {
              let element = this.articulosExtras[key];
              let Balance = await this.getArticuloBalance(
                element.articulo,
                element.almacenCodigoReferencia
              );
              element.disponible = Balance;
            }

          }
          this.loadingArticulosExtras = false;
        },
        (error) => {
          this.loadingArticulosExtras = false;
          this.toastService.error(
            "No se pudo obtener los articulos extras",
            "Error conexion al servidor"
          );

          setTimeout(() => {
            //this.getOrdenFabricacionDetalle();
          }, 1000);
        }
      );
  }

  updateOrdenFabricacionEstado(id: number, estado: number) {
    this.loadingEnviando = true;

    this.httpService
      .DoPostAny<OrdenFabricacionVista>(
        DataApi.OrdenFabricacion,
        "CambiarEstadoOrdenFabricacion",
        {id,estado}
      )
      .subscribe(
        async (response) => {
          if (!response.ok) {
            this.toastService.error(response.errores[0]);
          } else {
            // console.log(response.records);
            // this.toastService.success("Procesado");
            // this.modalService.dismissAll();
            this.getData();

          }
          this.loadingEnviando = false;
        },
        (error) => {
          this.loadingEnviando = false;
          this.toastService.error(
            "No se pudo obtener los datos",
            "Error conexion al servidor"
          );

          setTimeout(() => {
            //this.getOrdenFabricacionDetalle();
          }, 1000);
        }
      );
  }

  updateEstadoOrdenFabricacionDetalle(model: OrdenFabricacionVista) {
    this.loadingEnviando = true;

    this.httpService
      .DoPostAny<OrdenFabricacionVista>(
        DataApi.OrdenFabricacionDetalle,
        "UpdateEstadoOrdenFabricacionDetalle",
        model
      )
      .subscribe(
        async (response) => {
          if (!response.ok) {
            this.toastService.error(response.errores[0]);
          } else {
            // console.log(response.records);
            // this.toastService.success("Procesado");
            // this.modalService.dismissAll();
            this.getData();

          }
          this.loadingEnviando = false;
        },
        (error) => {
          this.loadingEnviando = false;
          this.toastService.error(
            "No se pudo obtener los datos",
            "Error conexion al servidor"
          );

          setTimeout(() => {
            //this.getOrdenFabricacionDetalle();
          }, 1000);
        }
      );
  }

  async getArticuloBalance(
    codigoArticulo: string,
    codigoAlmacen: string
  ): Promise<number> {
    var Balance = null;
    var response = await this.httpService
      .DoPostAny<any>(DataApi.OrdenFabricacion, "GetArticuloBalance", {
        Codigo1: codigoArticulo,
        Codigo2: codigoAlmacen,
      })
      .toPromise();

    if (response.ok && response.records.length > 0) {
      Balance = response.records[0];
    }

    return Balance;
  }

  getArticuloById(ArticuloID: number) {
    this.searching = true;
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
            this.searching = false;
          }
        },
        (error) => {
          this.searching = false;
          this.toastService.error("Error conexion al servidor");
        }
      );
  }

  asignarPagination(x: ResponseContenido<any>) {
    if (x.pagina != null) {
      this.totalPaginas =
        x.pagina.totalPaginas == null ? 0 : x.pagina.totalPaginas;
      this.paginaTotalRecords =
        x.pagina.totalRecords == null ? 0 : x.pagina.totalRecords;
      this.paginaSize = x.pagina.paginaSize == null ? 0 : x.pagina.paginaSize;
    } else {
      this.totalPaginas = 0;
      this.paginaTotalRecords = 0;
      this.paginaSize = 0;
    }
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
          let estado = new ComboBox();
          estado.codigo = 0;
          estado.nombre = "Todos";
          estado.grupo = "";
          estado.grupoID = "";
          this.estadosAutorizacion.unshift(estado);
        }
      }, error => {
        this.toastService.error("No se pudo obtener los estados.", "Error conexion al servidor");
        setTimeout(() => {
          this.getEstadosAutorizacion()
        }, 1000);

      });
  }

  getLote(content, model: OrdenFabricacionVista) {
    model.loadingSaveConsumido = true;

      if (model.gestionado) {
        let ap = new LotesOrdenFabricacion();
        ap.articulo = model.articulo;
        ap.almacen = model.almacenCodigoReferencia;
        ap.lote = model.lote;

         this.httpService.DoPostAny<LotesOrdenFabricacion>(DataApi.OrdenFabricacionDetalle,
          "GetLote", ap).subscribe(response => {
            console.log(response);

            if (!response.ok) {
              this.toastService.error(response.errores[0]);
            } else {
              //validar que existe
              if (response != null && response.records != null && response.records.length > 0) {
                let record = response.records[0];
                if(record == null){
                  this.toastService.warning("No se encontro el lote.");
                }
                this.lote = record ?? new LotesOrdenFabricacion();

                this.OnSubmitConsumido(model, content);

              }
              else {
                this.lote = new LotesOrdenFabricacion();
              }
              model.loadingSaveConsumido = false;
            }

          }, error => {
            model.loadingSaveConsumido = false;
            this.toastService.error("Error conexion al servidor");
          });
      }else{
        this.OnSubmitConsumido(model, content);
        model.loadingSaveConsumido = false;
      }


  }

  updateOrdenFabricacionEstadoPendiente(id: number, estado: number) {
    this.httpService
      .DoPostAny<OrdenFabricacionVista>(
        DataApi.OrdenFabricacion,
        "CambiarEstadoOrdenFabricacionPendiente",
        {id,estado}
      )
      .subscribe(
        async (response) => {
          if (!response.ok) {
            this.toastService.error(response.errores[0]);
          }else{
            this.getData();
            this.modalService.dismissAll();
          }
        },
        (error) => {
          this.toastService.error(
            "No se pudo obtener los datos",
            "Error conexion al servidor"
          );

          // setTimeout(() => {
          // }, 1000);
        }
      );
  }

  getOrdenFabMaximo() {
    this.httpService.DoPostAny<any>(DataApi.Configuracion,
      "GetConfiguracionValor", Number(Configuraciones.ORDENFABRICACION_CONSUMO_MAXIMO)).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {

          if (response.records.length == 0 || response.records[0] < 1) {
            this.toastService.error("No hay ORDENFABRICACION_CONSUMO_MAXIMO configurado");
            console.error("No hay ORDENFABRICACION_CONSUMO_MAXIMO configurado")
          } else {
            this.ORDENFABRICACION_CONSUMO_MAXIMO = Number(response.records[0]);
          }

        }
      }, error => {
        this.toastService.error("No se pudo obtener las condiciones de pago", "Error conexion al servidor");
        setTimeout(() => {
          this.getOrdenFabMaximo();
        }, 1000);

      });
  }

  getOrdenFabMinimo() {
    this.httpService.DoPostAny<any>(DataApi.Configuracion,
      "GetConfiguracionValor", Number(Configuraciones.ORDENFABRICACION_CONSUMO_MINIMO)).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {

          if (response.records.length == 0 || response.records[0] < 1) {
            this.toastService.error("No hay .ORDENFABRICACION_CONSUMO_MINIMO configurado");
            console.error("No hay .ORDENFABRICACION_CONSUMO_MINIMO configurado")
          } else {
            this.ORDENFABRICACION_CONSUMO_MINIMO = Number(response.records[0]);
          }

        }
      }, error => {
        this.toastService.error("No se pudo obtener las condiciones de pago", "Error conexion al servidor");
        setTimeout(() => {
          this.getOrdenFabMinimo();
        }, 1000);

      });
  }

  MostrarBtnBalanza(model: OrdenFabricacionVista): boolean {
    if (model.unidadMedida.toLocaleUpperCase() == "LBS" || model.unidadMedida.toLocaleUpperCase() == "KILOGRAMOS") {
      return true;
    }

    return false;
  }



}
