import { LotesOrdenFabricacion } from './../models/LotesOrdenFabricacion';
import { Component, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FocusEventArgs } from '@syncfusion/ej2-angular-calendars';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'src/app/core/authentication/service/authentication.service';
import { Parametro } from 'src/app/core/http/model/Parametro';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { Articulo } from 'src/app/Modules/servicios/recepcion/models/Articulo';
import { Usuario } from 'src/app/Modules/servicios/recepcion/models/Usuario';
import { BalanzaPesajeSignalrService } from 'src/app/Services/balanza-pesaje-signalr.service';
import { OrdenfabricacionPesajeService } from 'src/app/Services/ordenfabricacion-pesaje.service';
import { BalanzaPesoGrupoSignalREnum } from 'src/app/shared/enums/BalanzaPesoGrupoSignalREnum';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { EstadosGeneralesKeyEnum } from 'src/app/shared/enums/EstadosGeneralesKeyEnum';
import { ComboBox } from 'src/app/shared/model/ComboBox';
import { ArticuloPesaje } from '../../pesaje/models/ArticuloPesaje';
import { ArticuloPesosExtras } from '../../pesaje/models/ArticuloPesosExtras';
import { ArticuloPesosExtrasViewModel } from '../../pesaje/models/ArticuloPesosExtrasViewModel';
import { LoteAlmacen } from '../../pesaje/models/LoteAlmacen';
import { OrdenFabricacionVista } from '../models/OrdenFabricacionVista';
import { OrdenFabricacionDetalleEstadoEnum, OrdenFabricacionEstadoEnum } from '../models/OrdenFabricacionEstadoEnum';
import { Configuraciones } from 'src/app/shared/enums/Configuraciones';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { OrdenFabricacionDetalle } from '../models/OrdenFabricacionDetalle';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

@Component({
  selector: 'app-ordenfabricacion-pesaje',
  templateUrl: './ordenfabricacion-pesaje.component.html',
  styleUrls: ['./ordenfabricacion-pesaje.component.scss']
})
export class OrdenfabricacionPesajeComponent implements OnInit, OnDestroy {

  readonly PESO_BALANZA_DEFAULT_VALUE: string = "0.00 KG";
  readonly KILOGRAMO_A_LIBRA: number = 2.20462;

  articulo: Articulo;
  pesoArticuloBalanza: number
  pesoCanastos: number = 0;
  pesoNeto: number = 0;
  almacenID: number;

  cargando: boolean;
  search: string;
  searching: boolean;
  loadingArticulosExtras: boolean;
  articulosExtrasComboBox: ArticuloPesosExtras[];
  articulosExtras: ArticuloPesosExtrasViewModel[];
  cantidades: number[] = [];

  fechaActual: Date;

  fechaVencimiento: Date = new Date();
  btnGuardarCargando: boolean;

  pesoBalanza: string = "0.00 KG";

  pesoBalanzaUltimaFecha: Date = new Date();
  pesoBalanzaLBNumber: number = 0;

  random: number;
  almecenes: any[];
  ordenfabricacionvista: OrdenFabricacionVista = null;
  // almacenesDesde: ComboBox[];
  // loadingAlmacenesDesde: boolean;

  // almacenesHasta: ComboBox[];
  // loadingAlmacenesHasta: boolean;
  // almacenesDesdeSeleccionado: number;
  // almacenesHastaSeleccionado: number;

  usuario: Usuario;
  loadingPeso: boolean = false;

  loteSearch: string = "";
  lote: LotesOrdenFabricacion = new LotesOrdenFabricacion();
  loadingLote: boolean;
  loadingAlmacenes: boolean;
  batch: number = 0;
  ListaArticuloDetalle: OrdenFabricacionVista[] = [];

  isTerminalReport: boolean = false;
  ORDENFABRICACION_CONSUMO_MINIMO: number = 0;
  ORDENFABRICACION_CONSUMO_MAXIMO: number = 0;
  pesoNetoOrden: number;
  modalAutorizarArticulo: NgbModalRef;

  constructor(
    private toastService: ToastrService,
    private httpService: BackendService,
    private authService: AuthenticationService,
    private signalRService: BalanzaPesajeSignalrService,
    private modalService: NgbModal,
    private router: Router,
    private ordenfabriService: OrdenfabricacionPesajeService,
    private route: ActivatedRoute,
    private renderer: Renderer2) { }

  ngOnInit(): void {

    this.getHoraActual();
    // this.getAlmacenesUsuarioEnrroll()
    this.getAlmacenes();
    this.subscribirPesoBalanzaCambios();
    this.getUsuarioLogueado();
    this.getOrdenFabMaximo();
    this.getOrdenFabMinimo();

    for (let i = 0; i <= 100; i++) {
      this.cantidades.push(i)
    }

    if(this.ordenfabriService.OrdenFabricacion.id > 0 && this.ordenfabriService.ListaArticulo.length > 0){
      this.ordenfabricacionvista = this.ordenfabriService.OrdenFabricacion;
      this.ListaArticuloDetalle = this.ordenfabriService.ListaArticulo;
    }else{
      this.ordenfabriService.OrdenFabricacionChange.subscribe(x =>{
        // console.log(x);
        this.ordenfabricacionvista = x;
      });

      this.ordenfabriService.ListaArticuloChange.subscribe(x => {
        this.ListaArticuloDetalle = x;
      });
    }

    // console.log("###########################################");
    // console.log(this.ordenfabricacionvista);
    // console.log(this.ListaArticuloDetalle);
    // console.log("###########################################");

    if (this.ordenfabricacionvista.almacen == null) {
      this.isTerminalReport = true;
    }
    this.getArticuloByCodigoReferencia(this.ordenfabricacionvista.articulo);
    this.almacenID = Number(this.ordenfabricacionvista.almacenId);





    // this.route.queryParams.subscribe(params => {
    //   console.log(params);
    //   this.getArticuloByCodigoReferencia(params.articulo);
    //   this.almacenID = Number(params.almacenId);
    // });


    //this.startPingingBalanza();
    this. empezarAmbientePrueba();


  }


  @ViewChild('default')
  public datepickerObj: any;

  onFocus(args: FocusEventArgs): void {
    this.datepickerObj.show();
  }

  startPingingBalanza() {

    setInterval(() => {

      if (!this.loadingPeso && this.usuario) {
        this.loadingPeso = true;
        this.signalRService.getPesajeFromBalanza(Number(this.usuario.puertoEquipo),
          this.usuario.ipEquipo)
      }

    }, 2000);
  }


  empezarAmbientePrueba() {

    setInterval(() => {
      this.pesoBalanza = this.getRandomInt(1, 100) + 'KGZ';
      this.pesoBalanzaUltimaFecha = new Date();

      this.formatStringFromBalanza();
      this.getKilogramosNumberFromPesoBalanza();
      this.calcularTotales();
    }, 5000);

  }


  //prueba
  getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return (Math.floor(Math.random() * (max - min + 1)) + min)
  }


  subscribirPesoBalanzaCambios() {

    this.signalRService.startConnection(BalanzaPesoGrupoSignalREnum.Pantalla_Pesaje);

    this.signalRService.pesoBalanza.subscribe((peso: string) => {
      this.loadingPeso = false;

      this.pesoBalanza = peso;
      this.pesoBalanzaUltimaFecha = new Date();

      this.formatStringFromBalanza();
      this.getKilogramosNumberFromPesoBalanza();
      this.calcularTotales();

    })

  }

  formatStringFromBalanza() {

    if (!this.pesoBalanza) {
      this.pesoBalanza = this.PESO_BALANZA_DEFAULT_VALUE
      return;
    }

    let valores = this.pesoBalanza.split(" ")
    // .filter(x => x.includes("KG") || x.includes("LB"))

    if (!valores || valores.length == 0) {
      this.pesoBalanza = this.PESO_BALANZA_DEFAULT_VALUE
      return;
    }

    // console.table(valores)
    this.pesoBalanza = valores //filtro los que contengan libraje o kilogramo
      .reduce(//selecciono el de mayor length
        function (a, b) {
          return a.length > b.length ? a : b;
        }
      ).trim();

  }


  onSubmit(content) {
    let maximo = (this.ordenfabricacionvista.requerida * this.ORDENFABRICACION_CONSUMO_MAXIMO)
    let minimo = ((this.ordenfabricacionvista.requerida * this.ORDENFABRICACION_CONSUMO_MINIMO) - 1)
    //validaciones

    //if (
    //   !this.almacenesDesdeSeleccionado || this.almacenesDesdeSeleccionado <= 0 ||
    //   !this.almacenesHastaSeleccionado || this.almacenesHastaSeleccionado <= 0
    // ) {
    //   this.toastService.warning("Selecciona los almacenes.");
    //   return;
    // }

    // if (this.almacenesDesdeSeleccionado == this.almacenesHastaSeleccionado) {
    //   this.toastService.warning("El almacen no puede ser el mismo.");
    //   return;
    // }


    // if (!this.fechaVencimiento) {
    //   this.toastService.warning("Selecciona la fecha de vencimiento.");
    //   return;
    // }

    if ((this.pesoNeto < this.ordenfabricacionvista.requerida) && this.isTerminalReport == false ) {
      this.pesoNetoOrden = this.pesoNeto;
      this.modalAutorizarArticulo = this.modalService.open(content, { size:'lg'});
      //this.toastService.warning("Está consumiendo menos de la cantidad requerida.");
      return;
    }
    
    if (this.pesoCanastos >= this.pesoBalanzaLBNumber) {
      this.toastService.warning("El peso de los canastos no puede ser mayor o igual al de la balanza.");
      return;
    }

    if (!this.articulosExtras.some(x => x.cantidadSeleccionada > 0 && x.pesoSeleccionado)) {
      this.toastService.warning("No hay canastos con cantidad o peso seleccionados.");
      return;
    }

    if (this.loteSearch == "" && this.isTerminalReport == false && this.ordenfabricacionvista.gestionado == true) {
      this.toastService.warning("Digita el lote.");
      return;
    }

    if (this.lote.cantidad <= 0 && this.isTerminalReport == false && this.ordenfabricacionvista.gestionado == true) {
      this.toastService.warning("No a digitado un lote disponible.");
      return;
    }

    if (this.batch <= 0 && this.isTerminalReport == true) {
      this.toastService.warning("No a digitado un ningun batch.");
      return;
    }



    if ((this.pesoNeto > maximo) && this.isTerminalReport == false) {
      this.toastService.warning("Esta consumiendo mas del parametro permitido.");
      return;
    }

    // if (model.consumido < minimo) {
    //   this.toastService.warning("Esta consumiendo menos del parametro permitido.");
    //   return;
    // }

    if (this.lote.cantidad < this.pesoNeto && this.isTerminalReport == false) {
      this.toastService.warning(`No tiene lote disponible para hacer esta transferencia, favor verificar.`);
      return;
    }

    this.SaveConsumido()
  }

  SaveConsumido() {

 
    this.ordenfabricacionvista.consumido = this.pesoNetoOrden;
    this.ordenfabricacionvista.lote = this.lote.lote;
    this.ordenfabricacionvista.batch = this.batch;
    // console.log(this.ordenfabricacionvista);

    this.btnGuardarCargando = true;
        this.httpService.DoPostAny<ArticuloPesaje>(DataApi.OrdenFabricacionDetalle,
          "UpdateConsumido", this.ordenfabricacionvista).subscribe(response => {
            // console.log(response);
            if (response.ok) {
              this.toastService.success("Procesado");
              this.ordenfabricacionvista.estadoHijoId = OrdenFabricacionDetalleEstadoEnum.CONSUMIDO;
              this.updateEstadoOrdenFabricacionDetalle( this.ordenfabricacionvista);
              this.updateEstadoOrden();
              this.router.navigateByUrl('/produccion/ordenfabricacion');
            } else {
              this.toastService.error(response.errores[0], "Error");
            }

            this.btnGuardarCargando = false;
          }, error => {
            this.btnGuardarCargando = false;
            this.toastService.error("Error conexion al servidor");
          });

  }

  SaveConsumidoParaAutorizar(estado: OrdenFabricacionDetalleEstadoEnum) {

   

    this.ordenfabricacionvista.consumido = this.pesoNeto;
    this.ordenfabricacionvista.lote = this.lote.lote;
    this.ordenfabricacionvista.batch = this.batch;
    // console.log(this.ordenfabricacionvista);

    this.btnGuardarCargando = true;
        this.httpService.DoPostAny<ArticuloPesaje>(DataApi.OrdenFabricacionDetalle,
          "UpdateConsumido", this.ordenfabricacionvista).subscribe(response => {
            // console.log(response);
            if (response.ok) {
              this.toastService.success("Procesado");
              this.ordenfabricacionvista.estadoHijoId = estado;
              this.updateEstadoOrdenFabricacionDetalle( this.ordenfabricacionvista);
              this.updateEstadoOrden();
              this.modalAutorizarArticulo.dismiss();
            } else {
              this.toastService.error(response.errores[0], "Error");
            }

            this.btnGuardarCargando = false;
          }, error => {
            this.btnGuardarCargando = false;
            this.toastService.error("Error conexion al servidor");
          });
    


  }


  updateEstadoOrden(){

    let ArtCantidad = this.ListaArticuloDetalle.length;
    let ArtCunsumido = this.ListaArticuloDetalle.filter(x =>  x.estadoHijoId == OrdenFabricacionDetalleEstadoEnum.CONSUMIDO).length;
    let id = this.ordenfabricacionvista.ordenFabricacionId;
    let estadoOrden = this.ordenfabricacionvista.estadoId; //this.selectOrden.estadoId;
    let EstaPendiente = this.ListaArticuloDetalle.filter(x =>  x.estadoHijoId == OrdenFabricacionDetalleEstadoEnum.PENDIENTEAUTORIZAR).length;



        if(ArtCunsumido >= 1 && ArtCantidad > 1 && estadoOrden == OrdenFabricacionEstadoEnum.PENDIENTECONSUMO){
          this.updateOrdenFabricacionEstado(id, OrdenFabricacionEstadoEnum.PROCESANDOCONSUMO);
        }

      // SI TODOS LOS ARTICULOS ESTAN COSUMIDO
      if (ArtCantidad == ArtCunsumido) {
        this.updateOrdenFabricacionEstado(id, OrdenFabricacionEstadoEnum.PENDIENTETERMINALREPORT);
        this.modalService.dismissAll();
      }


      if (ArtCantidad == (ArtCunsumido + EstaPendiente) && ArtCantidad != ArtCunsumido) {
        this.updateOrdenFabricacionEstado(id, OrdenFabricacionEstadoEnum.PENDIENTEAUTORIZARCONSUMO);
          this.modalService.dismissAll();
      }


  }

  updateOrdenFabricacionEstado(id: number, estado: number) {
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

          }
        },
        (error) => {
          this.toastService.error(
            "No se pudo obtener los datos",
            "Error conexion al servidor"
          );

          setTimeout(() => {
          }, 1000);
        }
      );
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
          } else {

          }
        },
        (error) => {
          this.toastService.error(
            "No se pudo obtener los datos",
            "Error conexion al servidor"
          );

          setTimeout(() => {
          }, 1000);
        }
      );
  }

  getKilogramosNumberFromPesoBalanza() {

    this.pesoBalanzaLBNumber = 0

    if (this.pesoBalanza) {

      let indexKg = this.pesoBalanza.toLowerCase().indexOf("k") //donde empieza la k de kilogramo (kg)
      if (indexKg > 0) {

        let kilogramos = this.pesoBalanza.substring(0, indexKg)
        this.pesoBalanzaLBNumber = Number(kilogramos) * this.KILOGRAMO_A_LIBRA;
      }

      let indexLb = this.pesoBalanza.toLowerCase().indexOf("l") //donde empieza la k de kilogramo (kg)
      if (indexLb > 0) {

        let libras = this.pesoBalanza.substring(0, indexLb)
        this.pesoBalanzaLBNumber = Number(libras);
      }


    }

  }




  calcularTotales() {
    this.pesoCanastos = 0;

    if (this.articulosExtras) {
      this.articulosExtras.forEach(a => {
        if (a.cantidadSeleccionada && a.pesoSeleccionado) {
          this.pesoCanastos += a.cantidadSeleccionada * (a.pesoSeleccionado.valor * a.pesoSeleccionado.medidaValor)
        }
      })
    }

    this.pesoNeto = this.pesoBalanzaLBNumber - this.pesoCanastos;

  }







  onSearchChange() {

    if (this.search && this.search.length > 3) {
      this.pesoCanastos = 0;
      this.pesoNeto = 0
      this.getArticuloByCodigoReferencia(this.search)
      this.getArticulosDePesosExtras()
    } else {
      this.articulo = null;
    }

  }

  onClearSearch() {
    this.search = ""
    this.pesoCanastos = 0;
    this.pesoNeto = 0
    // this.focusInputSearch()
    this.onSearchChange()
  }


  getArticuloByCodigoReferencia(codigoRefencia: string) {
    this.searching = true;
    this.httpService.DoPostAny<Articulo>(DataApi.Articulo,
      "GetArticuloByCodigoReferencia", { codigoRefencia }).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          //validar que existe
          if (response != null && response.records != null && response.records.length > 0) {
            let record = response.records[0]
            this.articulo = record;

            this.getArticulosDePesosExtras();
          }
          else {
            this.articulo = null;
          }
          this.searching = false;
        }

      }, error => {
        this.searching = false;
        this.toastService.error("Error conexion al servidor");
      });
  }


  getArticulosDePesosExtras() {
    this.loadingArticulosExtras = true;
    this.httpService.DoPost<ArticuloPesosExtras>(DataApi.Articulo,
      "GetArticulosDePesosExtras", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.articulosExtrasComboBox = response.records;


          this.formatArticulosExtras()
        }
        this.loadingArticulosExtras = false;
      }, error => {
        this.loadingArticulosExtras = false;
        this.toastService.error("No se pudo obtener los articulos extras", "Error conexion al servidor");

        setTimeout(() => {
          this.getArticulosDePesosExtras();
        }, 1000);
      });
  }

  getLote() {
    this.loadingLote = true;

    let ap = new LotesOrdenFabricacion();
    ap.articulo = this.articulo.codigoReferencia;
    ap.almacen = this.ordenfabricacionvista.almacenCodigoReferencia;
    ap.lote = this.loteSearch;

    this.httpService.DoPostAny<LotesOrdenFabricacion>(DataApi.OrdenFabricacionDetalle,
      "GetLote", ap).subscribe(response => {

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

          }
          else {
            this.lote = new LotesOrdenFabricacion();
          }
          this.loadingLote = false;
        }

      }, error => {
        this.loadingLote = false;
        this.toastService.error("Error conexion al servidor");
      });
  }



  formatArticulosExtras() {
    this.articulosExtras = []
    this.articulosExtrasComboBox.forEach(a => {

      if (!this.articulosExtras.some(x => x.articuloID == a.articuloID)) {
        let item: ArticuloPesosExtrasViewModel = new ArticuloPesosExtrasViewModel();

        item.articuloID = a.articuloID
        item.codigoReferencia = a.codigoReferencia
        item.nombre = a.nombre
        item.cantidadSeleccionada = a.cantidadDefault;


        item.pesos = this.articulosExtrasComboBox.
          filter(ar => ar.articuloID == a.articuloID).
          map(art => {
            return {
              "nombre": `${art.valor} ${art.abreviatura}`,
              "valor": art.valor,
              "abreviatura": art.abreviatura,
              "medidaValor": art.medidaValor
            }
          });

        this.articulosExtras.push(item)
      }

    })
  }

  getAlmacenes() {
    this.loadingAlmacenes = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetAlmacenes", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.almecenes = response.records;
        }
        this.loadingAlmacenes = false;
      }, error => {
        this.loadingAlmacenes = false;
        this.toastService.error("No se pudo obtener los almacenes", "Error conexion al servidor");

        setTimeout(() => {
          this.getAlmacenes();
        }, 1000);

      });
  }


  // getAlmacenesUsuarioEnrroll() {

  //   let parametros: Parametro[] = [
  //     { key: "usuarioID", value: this.authService.tokenDecoded.nameid },
  //     { key: "ModuloKey", value: EstadosGeneralesKeyEnum.PRODUCCION },
  //   ]

  //   this.loadingAlmacenesDesde = true;
  //   this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
  //     "GetUsuarioAlmacenesModulo", parametros).subscribe(response => {

  //       if (!response.ok) {
  //         this.toastService.error(response.errores[0]);
  //       } else {
  //         this.almacenesDesde = response.records;
  //         this.almacenesHasta = response.records;

  //         if (this.almacenesDesde && this.almacenesDesde.length > 0) {
  //           this.almacenesDesdeSeleccionado = this.almacenesDesde[0].codigo
  //         }

  //       }
  //       this.loadingAlmacenesDesde = false;
  //     }, error => {
  //       this.loadingAlmacenesDesde = false;
  //       this.toastService.error("No se pudo obtener los almacenes", "Error conexion al servidor");

  //       setTimeout(() => {
  //         this.getAlmacenesUsuarioEnrroll();
  //       }, 1000);

  //     });
  // }


  getUsuarioLogueado() {
    let usuarioID: number = Number(this.authService.tokenDecoded.nameid)

    this.httpService.DoPostAny<Usuario>(DataApi.Usuario,
      "GetUsuarioByID", usuarioID).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          //validar que existe
          if (response != null && response.records != null && response.records.length > 0) {

            let usuario = response.records[0];
            this.usuario = usuario;

          } else {
            this.toastService.warning("Usuario no encontrado");
          }
        }

      }, error => {
        this.toastService.error("Error conexion al servidor");
      });
  }


  getHoraActual() {
    this.cargando = true;
    this.httpService.DoPost<ComboBox>(DataApi.Public,
      "GetHoraActual", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.fechaActual = new Date(response.valores[0]);
        }

        this.cargando = false;
      }, error => {
        this.cargando = false;
        this.toastService.error("Error conexion al servidor");
      });
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



  EnviarAutorizarModal(){

    this.SaveConsumidoParaAutorizar(OrdenFabricacionDetalleEstadoEnum.PENDIENTEAUTORIZAR);

  }

  updateEstadoOrdenFabricacionDetalle(model: OrdenFabricacionVista) {
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
          } 
        },
        (error) => {
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





  ngOnDestroy(): void {

    this.signalRService.ExitGroup(BalanzaPesoGrupoSignalREnum.Pantalla_Pesaje);

  }



}
