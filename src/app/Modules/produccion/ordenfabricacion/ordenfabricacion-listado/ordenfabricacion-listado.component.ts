import { OrdenFabricacionDetalle } from "./../models/OrdenFabricacionDetalle";
import { OrdenFabricacionVista } from "./../models/OrdenFabricacionVista";
import { Component, OnInit } from "@angular/core";
import { NgxPermissionsService } from "ngx-permissions";
import { ToastrService } from "ngx-toastr";
import { Parametro } from "src/app/core/http/model/Parametro";
import { ResponseContenido } from "src/app/core/http/model/ResponseContenido";
import { BackendService } from "src/app/core/http/service/backend.service";
import { DataApi } from "src/app/shared/enums/DataApi.enum";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { Articulo } from "src/app/Modules/servicios/recepcion/models/Articulo";
import { OrdenFabricacion } from "../models/OrdenFabricacion";
import { ListaMaterialesHeader } from "../models/ListaMaterialesHeader";
import { Router, ActivatedRoute } from "@angular/router";
import { OrdenfabricacionPesajeService } from "src/app/Services/ordenfabricacion-pesaje.service";
import { OrdenFabricacionEstadoEnum } from "../models/OrdenFabricacionEstadoEnum";
import { EstadosGeneralesKeyEnum } from "src/app/shared/enums/EstadosGeneralesKeyEnum";
import { ComboBox } from "src/app/shared/model/ComboBox";

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


  public get ValidOrden(): typeof OrdenFabricacionEstadoEnum {
    return OrdenFabricacionEstadoEnum;
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

  OnChangePagePesaje(articulosExtras) {
    this.modalService.dismissAll();
    let data = <OrdenFabricacionVista> articulosExtras;
      data.articulo = this.articulo.codigoReferencia;

    this.ordenfabriService.SaveOrdenFabricacion(data);
    this.router.navigateByUrl("/produccion/ordenfabricacionpesaje");
  }

  OnSaveConsumido(articulosExtras: OrdenFabricacionVista) {
    // let requeridad = articulosExtras.cantidadRequerida;
    // let consumido = articulosExtras.consumido;

    // if (consumido < requeridad) {
    //   this.toastService.warning("El valor consumido es menor a la cantidad requerida");
    // }else if(consumido > requeridad){
    //   this.toastService.warning("El valor consumido es mayor a la cantidad requerida");
    // }
      articulosExtras.loadingSaveConsumido = true;
      this.httpService
        .DoPostAny<OrdenFabricacionVista>(
          DataApi.OrdenFabricacionDetalle,
          "UpdateConsumidoYCostoReal",
          articulosExtras
        )
        .subscribe(
          (response) => {
            if (!response.ok) {
              this.toastService.error(response.errores[0]);
            } else {
              articulosExtras.isPesaje = !articulosExtras.isPesaje;
              this.getOrdenFabricacion(articulosExtras.ordenFabricacionId);
            }
            articulosExtras.loadingSaveConsumido = false;
          },
          (error) => {
            articulosExtras.loadingSaveConsumido = false;
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
  OnSaveProducida() {
    this.loadingSaveProducida = true;
    this.httpService
      .DoPostAny<OrdenFabricacionVista>(
        DataApi.OrdenFabricacion,
        "Update",
        this.ordenfabricacion
      )
      .subscribe(
        (response) => {
          if (!response.ok) {
            this.toastService.error(response.errores[0]);
          } else {
            this.IsPesajeProducida = !this.IsPesajeProducida;
            //this.getOrdenFabricacion(articulosExtras.ordenFabricacionId);
          }
          this.loadingSaveProducida = false;
        },
        (error) => {
          this.loadingSaveProducida = false;
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

  openModalComfirm(content, modal: OrdenFabricacionVista) {
    this.getOrdenFabricacion(modal.id);
    this.modalService.open(content, { size:'lg'});
  }
  openModal(content, modal: OrdenFabricacionVista) {
    this.getOrdenFabricacion(modal.id);
    this.modalService.open(content, {
      windowClass: "myCustomModalClass",
      backdrop: "static",
    });
  }

  openModalProducida(content, modal: OrdenFabricacionVista) {
    this.getOrdenFabricacion(modal.id);
    this.modalService.open(content, {
      windowClass: "myCustomModalClass",
      backdrop: "static",
    });
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

  updateOrdenFabricacionEstado(id: number) {
    this.loadingEnviando = true;

    this.httpService
      .DoPostAny<OrdenFabricacionVista>(
        DataApi.OrdenFabricacion,
        "CambiarEstadoOrdenFabricacion",
        id
      )
      .subscribe(
        async (response) => {
          if (!response.ok) {
            this.toastService.error(response.errores[0]);
          } else {
            // console.log(response.records);
            this.toastService.success("Procesado");
            this.modalService.dismissAll();
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


}
