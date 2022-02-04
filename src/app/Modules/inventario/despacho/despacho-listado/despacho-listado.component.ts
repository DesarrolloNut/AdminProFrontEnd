import { DepachoHorasVM, DespachoListadoPreventaVMTotales } from './../models/DespachoPedidoListadoViewModel';
import { ComboBoxLote } from './../../../../shared/model/ComboBox';
import { DespachoInUseVM, DespachoPreventaDetalleExcelVM, DespachoPreventaRequestModel, DespachoRangoHoraRequestModel, SAPLoteDespachoPedido } from './../models/DespachoPedidoDetalleViewModel';
import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { NgxPermissionsService } from 'ngx-permissions';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'src/app/core/authentication/service/authentication.service';
import { Parametro } from 'src/app/core/http/model/Parametro';
import { ResponseContenido } from 'src/app/core/http/model/ResponseContenido';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { Cliente } from 'src/app/Modules/mantenimientos/clientes/models/Cliente';
import { ArticuloPesosExtras } from 'src/app/Modules/produccion/pesaje/models/ArticuloPesosExtras';
import { ArticuloPesosExtrasViewModel } from 'src/app/Modules/produccion/pesaje/models/ArticuloPesosExtrasViewModel';
import { LoteAlmacen } from 'src/app/Modules/produccion/pesaje/models/LoteAlmacen';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { ComboBox } from 'src/app/shared/model/ComboBox';
import { DespachoPedidoDetalleArticuloViewModel, DespachoPedidoDetalleViewModel, DespachoPreventaDetalleViewModel } from '../models/DespachoPedidoDetalleViewModel';
import { DespachoListadoPreventaVM, DespachoPedidoListadoViewModel } from '../models/DespachoPedidoListadoViewModel';
import * as XLSX from 'xlsx';
@Component({
  selector: 'app-despacho-listado',
  templateUrl: './despacho-listado.component.html',
  styleUrls: ['./despacho-listado.component.scss']
})
export class DespachoListadoComponent implements OnInit {

  public config: PerfectScrollbarConfigInterface = {

  };

  // COPIAR AL CREAR UN LISTADO NUEVO
  Search: string = "";
  sucursalId: number = 0;
  paginaNumeroActual = 1;
  Cargando: boolean = false;
  CargandoRealtime =false;
  CargandoDespachoDetalle: boolean = false;

  CargandoBar: boolean = false;
  totalPaginas: number = 0;
  paginaSize: number = 5;
  paginaTotalRecords: number = 0;


  data: DespachoPedidoListadoViewModel[] = [] //tu modelo
  despachoSeleccionado: DespachoPedidoListadoViewModel;
  despachoDetalles: DespachoPedidoDetalleViewModel[];
  despachoPedidoArticuloDetalleSelected: DespachoPedidoDetalleViewModel;
  loadingDespachoDetalle:boolean;

  estados: ComboBox[] = []
  loadingEstados: boolean;
  loadingCanales: boolean = false;
  btnGuardarDespachoCargando =false;
  btnGuardarCanastoDespachoCargando=false;
  btnFinalizarDespachoCargando =false;
  btnCargandoPrint: boolean = false;
  canales:ComboBox[]=[];
  opcionesFecha:ComboBox[]=[{codigo:1,nombre:"Hoy en adelante",grupo:"",grupoID:"1"}];
  opcionFechaId:number=1;
  canalId:number=1;
  sucursales  : ComboBox[];
  loadingSucursales = false;


  //extra
  intervalRefreshData: NodeJS.Timeout

   fDesde = new Date();
   fHasta = new Date();
   dia : string;
   fahoraServidor = new Date();
   despachoOn = 1
   Diferencia_Minima_Despacho = 0


   despachoPuedeHorario = false;
   loadingRangosFechaDespacho =false;

  //PREVENTA
   despachoPreventaSeleccionado: DespachoListadoPreventaVM;
   dataPreventa: DespachoListadoPreventaVM[] = [] //tu modelo
   dataPreventaTotales: DespachoListadoPreventaVMTotales[] = [] //tu modelo

   despachoPreventaDetalles: DespachoPreventaDetalleViewModel[];
   despachoPreventaArticuloDetalleSelected: DespachoPreventaDetalleViewModel;
   loadingDespachoPreventaDetalle:boolean;
   despachoInUseVM= new DespachoInUseVM();
   lote: SAPLoteDespachoPedido = new SAPLoteDespachoPedido();

   fecha= new Date()
   primeraVez= 0;

   lotesDisponibles:SAPLoteDespachoPedido[]=[];

    //PAGINACION MODAL DETALLE DESPACHO
    paginateDataDetalleDespacho: DespachoPreventaDetalleViewModel[] = [];
    pageDetalleDespacho = 1;
    pageSizeDetalleDespacho= 6;
    collectionSizeDetalleDespacho = 0;


     confirmFinalizaModal: NgbModalRef;


    // MOVER A OTRO COMPONENTE
    loadingArticulosExtras: boolean;
    articulosExtrasComboBox: ArticuloPesosExtras[];
    articulosExtras: ArticuloPesosExtrasViewModel[];
    cantidades: number[] = [];

    loteSearch: string
    loadingLote: boolean;
    loadingAlmacenes: boolean;
    almacenes: any[];



    pesoBalanza: string = "0.00 KG";
    pesoBalanzaUltimaFecha: Date = new Date();
    pesoBalanzaLBNumber: number = 0;

    pesoArticuloBalanza: number
    pesoCanastos: number = 0;
    pesoNeto: number = 0;

    readonly PESO_BALANZA_DEFAULT_VALUE: string = "0.00 KG";
    readonly KILOGRAMO_A_LIBRA: number = 2.20462;

  constructor(private toastService: ToastrService,
    private httpService: BackendService,
    private modalService: NgbModal,
    private router: Router,

    public permissionsService: NgxPermissionsService,
    private authService: AuthenticationService,
  ) { }


  ngOnInit(): void {
    this.getDiferenciaMinima()
    this.getCanales();
    this.getSucursalByUsuarioId();
    // this.getArticulosDePesosExtras();
    this.getAlmacenes();
     this.validaHorarioDespacho();
  }

getAllData(){

  this.intervalRefreshData = setInterval(() => {
    this.getDataByCondicional(false,false)
  }, 13000)


}

 getDataByCondicional(showLoading=true,validaHorario=true){
   if(validaHorario){this.validaHorarioDespacho()}
  switch (this.canalId) {
    case 1:
         this.getDataPreventa(showLoading)
        break;
    case 2:
          this.getData()
          break;
    default:
            this.getData()
          break;
  }
 }





 validaHorarioDespacho() {
 this.loadingRangosFechaDespacho=true;
 let p= new DespachoRangoHoraRequestModel();
 p.fecha = this.fecha;

  this.httpService.DoPostAny<string>(DataApi.Despacho,
    "GetDespachoRangoValor", p).subscribe(response => {

      if (!response.ok) {
        this.toastService.error(response.errores[0]);
      } else {
         console.log(response)
          let h:DepachoHorasVM =  response.valores[0]
          this.despachoPuedeHorario=h.puedeDespachar;
          this.dia=h.diaNombre;

          this.fDesde.setHours(h.horaDesde.hours);
          this.fDesde.setMinutes(h.horaDesde.minutes);
          this.fHasta.setHours(h.horaHasta.hours);
          this.fHasta.setMinutes(h.horaHasta.minutes);

        if (this.despachoPuedeHorario) {
           this.getAllData()
        }else{
             window.clearInterval(this.intervalRefreshData);
        }
      }
      this.loadingRangosFechaDespacho=false;

    }, error => {
      this.loadingRangosFechaDespacho=false;
      console.error(error)
      this.toastService.error("ha ocurrido un error", "Error conexion al servidor");
    });
}

getDiferenciaMinima(){
  this.httpService.DoPostAny<string>(DataApi.Despacho,
    "GetDiferenciaMinimaDespacho", null).subscribe(response => {

      if (!response.ok) {
        this.toastService.error(response.errores[0]);
      } else {
           this.Diferencia_Minima_Despacho=parseFloat(response.valores[0])
      }
    }, error => {
      console.error(error)
      this.toastService.error("ha ocurrido un error", "Error conexion al servidor");
    });
}


getSucursalByUsuarioId() {
  let UsuarioId = Number(this.authService.tokenDecoded.nameid);
  let parametros: Parametro[] = [
    { key: "UsuarioId", value: UsuarioId },
  ]

  this.loadingSucursales = true;
  this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
    "GetSucursalesByUsuarioId", parametros).subscribe(response => {

      if (!response.ok) {

        this.toastService.error(response.errores[0]);
      } else {
        if(response.records.length> 0  && response.records!=null){
          this.sucursalId = response.records[0].codigo;
          this.getDataByCondicional()
        }
        this.sucursales = response.records;

      }
      this.loadingSucursales = false;
    }, error => {
      this.loadingSucursales = false;
      this.toastService.error("No se pudo obtener las sucursales", "Error conexion al servidor");

      setTimeout(() => {
        this.getSucursalByUsuarioId()
      }, 1000);

    });
}


  getData() {
    this.Cargando = true;

    let parametros: Parametro[] = [{ key: "Search", value: this.Search }, ]

    this.httpService.GetAllWithPagination<DespachoPedidoListadoViewModel>(DataApi.Despacho,
       "GetDespachoListado", "ID", this.paginaNumeroActual,
      this.paginaSize,true, parametros).subscribe(x => {

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

  validaDespachoEnUsoBeforeOpenModal(content, despacho: any){
    this.openModal(content,despacho,false)
  }

  openModal(content, despacho: any,onlyView:boolean) {
    switch (this.canalId) {
      case 1:
          this.despachoPreventaDetalles = [];
          this.despachoPreventaSeleccionado = despacho;
          this.getDespachoPreventaDetalleFromAPi(despacho.fechaEntrega,despacho.rutaId);
          console.log(onlyView)
          if(!onlyView){
            this.registraDespachoPreventaInUse();
          }
          break;
      case 2:
            this.despachoDetalles = [];
            this.getDespachoDetalle(despacho.id);
            this.despachoSeleccionado = despacho;
            break;
      default:
            this.despachoDetalles = [];
            this.getDespachoDetalle(despacho.id);
            this.despachoSeleccionado = despacho;
            break;
    }
    this.modalService.open(content, { windowClass: "myCustomModalClass", backdrop: "static", });
  }

  openModalAutorizar(content, despacho: DespachoPedidoListadoViewModel) {
    this.despachoDetalles = [];
    this.getDespachoDetalle(despacho.id);
    this.despachoSeleccionado = despacho;
    this.modalService.open(content, { size: 'lg', });
  }


  getDespachoDetalle(pedidoEmpleadoId: number) {
    this.loadingDespachoDetalle = true;
    this.httpService.DoPostAny<DespachoPedidoDetalleViewModel>(DataApi.Despacho,
      "GetDespachoDetalles", pedidoEmpleadoId).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.despachoDetalles = response.records;
          this.despachoDetalles[0].selected=true;
          this.despachoPedidoArticuloDetalleSelected=this.despachoDetalles[0];
        }
        this.loadingDespachoDetalle = false;
      }, error => {
        this.loadingDespachoDetalle = false;
        this.toastService.error("No se pudo obtener el detalle", "Error conexion al servidor");
      });
  }



  // CambiarEstadoAutorizacionCotizacion(cotizacionID: number) {
  //   this.loadingEstadoAutorizacionCotizacion = true;
  //   this.httpService.DoPostAny<PedidoEmpleadoDetalleViewModel>(DataApi.PedidosEmpleado,
  //     "CambiarEstadoAutorizacionCotizacion", cotizacionID).subscribe(response => {

  //       if (!response.ok) {
  //         this.toastService.error(response.errores[0]);
  //       } else {
  //         // this.cotizacionDetalles = response.records;
  //         this.modalService.dismissAll();
  //         this.getData()
  //       }
  //       this.loadingEstadoAutorizacionCotizacion = false;
  //     }, error => {
  //       this.loadingEstadoAutorizacionCotizacion = false;
  //       this.toastService.error("No se pudo obtener el detalle", "Error conexion al servidor");
  //     });
  // }





  cancelarDespacho() {
    this.modalService.dismissAll();
   this.despachoSeleccionado.loadingCancelPedido=true;
   let pedido={"Id":this.despachoSeleccionado.id
               ,"EstadoID": 4
               ,"ClienteId":this.despachoSeleccionado.clienteId
              }
    this.httpService.DoPostAny<ComboBox>(DataApi.Despacho,
      "CancelarDespacho",  pedido).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
          console.error(response.errores[0]);
        } else {
          this.getData();
          this.toastService.success("Despacho cancelado", "OK");
        }
        this.despachoSeleccionado.loadingCancelPedido=false;

      }, error => {
        this.despachoSeleccionado.loadingCancelPedido=false;

        this.getData()
        this.toastService.error("No se pudo cancelar el pedido", "Error conexion al servidor");
      });

  }
  // getClienteByUsuarioID(usuarioId: number) {
  //   this.Cargando=true;
  //   this.httpService.DoPostAny<Cliente>(DataApi.Cliente,
  //     "GetClienteByUsuarioID", usuarioId).subscribe(response => {
  //       if (!response.ok) {
  //         this.toastService.error(response.errores[0]);
  //         this.Cargando=false;
  //       } else {
  //         //validar que existe
  //         if (response != null && response.records != null && response.records.length > 0) {

  //           this.cliente = response.records[0];
  //           this.cliente.apellidos = this.cliente.apellidos==null?"":this.cliente.apellidos;
  //           this.clienteExiste=true;
  //           this.getData()
  //         } else {
  //           this.clienteExiste=false;
  //           this.Cargando=false;
  //         }
  //       }

  //     }, error => {
  //       this.Cargando=false;
  //        this.toastService.error("Error conexion al servidor");
  //     });
  // }



  // MOVER A OTRO COMPONENTE
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
  getAlmacenes() {
    this.loadingAlmacenes = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetAlmacenes", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.almacenes = response.records;
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

  onSelectArticulo(item:DespachoPedidoDetalleViewModel){
     this.despachoDetalles.map(x=>{x.selected=false})
     item.selected=true;
     this.despachoPedidoArticuloDetalleSelected=item;
     this.lote = new SAPLoteDespachoPedido();
  }

  onNextItemSubmit(){

    this.despachoDetalles.filter(
      d=>d.id ==this.despachoPedidoArticuloDetalleSelected.id
      ).map(x=>{x.estadoId=1,x.estado='Si',x.estadoColor='success',x.selected=false})
      let item=  this.despachoDetalles.filter(x=>x.estadoId!=1)[0];
      item.selected=true;
      this.despachoPedidoArticuloDetalleSelected=item;


  }
  onBackItem(){
    let backIndex=this.despachoDetalles.indexOf(this.despachoPedidoArticuloDetalleSelected)-1;
     if(backIndex<0){
        return;
     }
      let item= this.despachoDetalles[backIndex];
      this.despachoDetalles.map(x=>{x.selected=false})
      item.selected=true;

      this.despachoPedidoArticuloDetalleSelected=item;
      this.getLote();

  }

  GetDespachoDetalleByID(id: number) {
    this.CargandoDespachoDetalle = true;
    this.httpService.DoPostAny<DespachoPedidoDetalleArticuloViewModel>(DataApi.Despacho,
      "GetDespachoDetalleByID", id).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          //validar que existe
          if (response != null && response.valores != null && response.valores.length > 0) {
            let record = response.valores[0]
            this.despachoPedidoArticuloDetalleSelected = record;
            console.log( this.despachoPedidoArticuloDetalleSelected )
          } else {
            this.toastService.warning("Articulo no encontrado");
          }
        }
        this.CargandoDespachoDetalle = false;

      }, error => {
        this.CargandoDespachoDetalle = false;
        this.toastService.error("Error conexion al servidor");
      });
  }



  getLote() {
    if( this.despachoPreventaSeleccionado.finalizado==1 )
    {
         return;
    }
    this.lote = new SAPLoteDespachoPedido();
    this.lotesDisponibles=[];
    // if(this.btnFinalizarDespachoCargando){return;}

    console.log(this.despachoPreventaSeleccionado)

    this.loadingLote = true;
    let ap = new SAPLoteDespachoPedido();
    ap.articulo = this.despachoPreventaArticuloDetalleSelected.codigoArticulo;
    ap.almacen = this.despachoPreventaArticuloDetalleSelected.almacen_Origen.toString();
    ap.cantidadPedida = this.despachoPreventaArticuloDetalleSelected.pedido;
     console.log(ap)
    this.httpService.DoPostAny<SAPLoteDespachoPedido>(DataApi.Despacho,
      "GetLote", ap).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          //validar que existe
          if (response != null && response.valores != null && response.valores.length > 0) {
            if( response.valores == null || response.valores.length==0  || response.valores[0] == null ){
              this.toastService.warning("No se encontro el lote.");
              this.despachoPreventaArticuloDetalleSelected.noTieneLote=true;
              this.loadingLote = false;
              return;
            }

             this.lotesDisponibles=response.valores[0];
          }
          else {
            this.lote = new SAPLoteDespachoPedido();
          }
          this.loadingLote = false;
        }

      }, error => {
        this.loadingLote = false;
        this.toastService.error("Error conexion al servidor");
      });
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


  //prueba
  getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return (Math.floor(Math.random() * (max - min + 1)) + min)
  }





  getCanales() {
    this.loadingCanales = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetCanales", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.canales = response.records;
        }
        this.loadingCanales = false;
      }, error => {
        this.loadingCanales = false;
        this.toastService.error("No se pudo obtener los canales", "Error conexion al servidor");

        setTimeout(() => {
          this.getCanales()
        }, 1000);

      });
  }







  onChangeFechaDesdeFiltro(evento: any) {
    if(++this.primeraVez==1){return;}
    this.fecha = new Date(evento.value)
    this.getDataByCondicional()
  }
  // CANAL PREVENTA   CANAL PREVENTA   CANAL PREVENTA   CANAL PREVENTA   CANAL PREVENTA   CANAL PREVENTA

  getDataPreventa(showLoading=true) {

     if(this.Cargando){
       return;
     }
     if(showLoading){
      this.Cargando = true;

     }else{
      this.CargandoRealtime =true;
     }


    let parametros: Parametro[] = [
      { key: "Search", value: this.Search },
      {  key: "UsuarioId",value:Number(this.authService.tokenDecoded.nameid)},
      { key: "SucursalId", value: this.sucursalId },
      { key: "Fecha", value: this.fecha },
     ]
console.log(parametros)
    this.httpService.GetAllWithPagination<DespachoListadoPreventaVM>(DataApi.Despacho,
       "GetDespachoPreventaListado", "FechaEntrega", this.paginaNumeroActual,
      this.paginaSize,true, parametros).subscribe(x => {
        if (x.ok) {

          this.dataPreventa = x.valores[0];

          this.dataPreventaTotales= x.valores[1];
          this.asignarPagination(x);
        } else {
          this.toastService.error(x.errores[0]);
          console.error(x.errores[0]);
        }

     if(showLoading){
      this.Cargando = false;
     }
     this.CargandoRealtime =false;
      }, error => {
        console.error(error);
        this.toastService.error("Error conexion al servidor");

        if(showLoading){
          this.Cargando = false;
         }
         this.CargandoRealtime =false;

      });

  }



  getDespachoPreventaDetalleFromAPi(fecha:string,rutaId:number) {
    this.limpiarDataPreventa()
    this.loadingDespachoPreventaDetalle = true;

    let parametros={
     "Fecha":fecha
    ,"RutaId": rutaId
   }


    this.httpService.DoPostAny<DespachoPreventaDetalleViewModel>(DataApi.Despacho,
      "GetDespachoPreventaDetalles", parametros).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {


          this.despachoPreventaDetalles = response.valores[0];
          this.formatDespachoPreventaDetalles();

        }
        this.loadingDespachoPreventaDetalle = false;
      }, error => {
        console.log(error)
        this.loadingDespachoPreventaDetalle = false;
        this.toastService.error("No se pudo obtener el detalle", "Error conexion al servidor");
      });
  }

  formatDespachoPreventaDetalles() {


    if(this.despachoPreventaDetalles.length>0){

      // this.despachoPreventaDetalles.sort((left, right) => {
      //         if (left.estadoId < right.estadoId) return -1;
      //         if (left.estadoId > right.estadoId) return 1;
      //         return 0;
      //   })
      //   this.despachoPreventaDetalles.sort((left, right) => {
      //     if (left.ubicacion < right.ubicacion) return -1;
      //     if (left.ubicacion > right.ubicacion) return 1;
      //     return 0;
      // })

      this.despachoPreventaDetalles.sort((a, b) => a.estadoId - b.estadoId || a.ubicacion - b.ubicacion);


      this.despachoPreventaDetalles.filter(x=>x.codigoArticulo=='600124').map(x=>x.unidadMedida='CANASTO')


      this.despachoPreventaDetalles[0].selected=true;
      this.despachoPreventaArticuloDetalleSelected=this.despachoPreventaDetalles[0];

      this.collectionSizeDetalleDespacho = this.despachoPreventaDetalles.length;
      this.asignaPageToItme();
      this.paginateDataDetalleDespacho =  this.despachoPreventaDetalles
      .slice((this.pageDetalleDespacho - 1) * this.pageSizeDetalleDespacho,
       (this.pageDetalleDespacho - 1) * this.pageSizeDetalleDespacho + this.pageSizeDetalleDespacho);

       this.getLote();

    }
    this.collectionSizeDetalleDespacho = this.despachoPreventaDetalles.length;


    this.paginateDataDetalleDespacho =  this.despachoPreventaDetalles
    .slice((this.pageDetalleDespacho - 1) * this.pageSizeDetalleDespacho,
     (this.pageDetalleDespacho - 1) * this.pageSizeDetalleDespacho + this.pageSizeDetalleDespacho);

    this.paginateDataDetalleDespacho.map(x=>x.page=this.pageDetalleDespacho);

  }



  exportDespachoPreventaDetalle(despacho:any,tipo:number) {

    //TIPO 1 = PRINT
    //TIPO 2 = EXPORTAR EXCEL
    this.btnCargandoPrint=true;
    this.limpiarDataPreventa()
    this.despachoPreventaSeleccionado = despacho;

    let parametros={
     "Fecha":despacho.fechaEntrega
    ,"RutaId": despacho.rutaId
   }


    this.httpService.DoPostAny<DespachoPreventaDetalleViewModel>(DataApi.Despacho,
      "GetDespachoPreventaDetalles", parametros).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
          this.btnCargandoPrint=false;

        } else {

          this.despachoPreventaDetalles = response.valores[0];
          if(tipo==1){
             this.despachoPreventaDetalleToPrinter(this.despachoPreventaDetalles)
          }else if(tipo==2){
            this.despachoPreventaDetalleToExcel(this.despachoPreventaDetalles)
          }
        }
        this.btnCargandoPrint=false;
      }, error => {
        console.log(error)
        this.btnCargandoPrint=false;
        this.toastService.error("No se pudo obtener el detalle", "Error conexion al servidor");
      });
  }
  despachoPreventaDetalleToPrinter(data:DespachoPreventaDetalleViewModel[]) {
    data.sort((a, b) =>  a.codigoArticulo.localeCompare(b.codigoArticulo) );

    this.router.navigate(['/impresion/inventario/print-d-preventa-detalles'],
    { queryParams:

      {
        despachopreventa: JSON.stringify(this.despachoPreventaSeleccionado),
        despachopreventadetalles: JSON.stringify(this.despachoPreventaDetalles),
      },
      });
  }
  despachoPreventaDetalleToExcel(data:DespachoPreventaDetalleViewModel[]) {
    data.sort((a, b) =>  a.codigoArticulo.localeCompare(b.codigoArticulo) );

         let dataFormated:DespachoPreventaDetalleExcelVM[] = [];
         data.forEach(x=>{
            dataFormated.push({

              CodigoArticulo:x.codigoArticulo,
              Descripcion:x.articulo,
              Almacen_Desde:x.almacen_Origen,
              Almacen_Hasta:x.almacen_Destino,
              Pedido:x.pedido,
            })
         });

          const ws2: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataFormated);

          /* generate workbook and add the worksheet */
          const wb: XLSX.WorkBook = XLSX.utils.book_new();






        //Add Row and formatting

          XLSX.utils.book_append_sheet(wb, ws2, 'Despacho'+"-("+this.despachoPreventaSeleccionado.almacen_Destino+")");
           let nombreDistribuidor=this.despachoPreventaSeleccionado.distribuidor.split(" ").join("");
          /* save to file */
          XLSX.writeFile(wb, ""+nombreDistribuidor+"("+this.despachoPreventaSeleccionado.almacen_Destino+")-"+"Despacho.xlsx");
  }

  asignaPageToItme(){
    this.paginateDataDetalleDespacho.map(x=>x.page=this.pageDetalleDespacho);

   let countpages=  Math.trunc(
     this.despachoPreventaDetalles.length / this.pageSizeDetalleDespacho
      + (this.despachoPreventaDetalles.length % this.pageSizeDetalleDespacho > 0 ? 1 : 0));

      for (let index = 1; index <=countpages; index++) {
        let array =  this.despachoPreventaDetalles
        .slice((index - 1) * this.pageSizeDetalleDespacho,
         (index - 1) * this.pageSizeDetalleDespacho + this.pageSizeDetalleDespacho);
         array.map(x=>x.page=index);
      }
    }
  onSelectArticuloInDetallePreventa(item:DespachoPreventaDetalleViewModel){
    if(this.btnGuardarDespachoCargando){return;}
    if(this.loadingLote){return;}
    if(this.btnGuardarCanastoDespachoCargando){return;}

    // if(item.estadoId==1){
    //    item.lote="";
    // }
    this.despachoPreventaDetalles.map(x=>{x.selected=false})
    item.selected=true;
    this.despachoPreventaArticuloDetalleSelected=item;
    console.log(this.despachoPreventaArticuloDetalleSelected);
    if(this.despachoPreventaArticuloDetalleSelected.lote==null ||
      this.despachoPreventaArticuloDetalleSelected.lote==undefined ||
      this.despachoPreventaArticuloDetalleSelected.lote==''
      ){
        if(this.despachoPreventaArticuloDetalleSelected.unidadMedida!='CANASTO'){
          this.getLote()
        }
      }
 }




 onNextItemPreventaSubmit(){
   if( this.despachoPreventaSeleccionado.finalizado==0 && !this.despachoInUseVM.hasPermisoValidador)
   {
    if(this.despachoPreventaArticuloDetalleSelected.unidadMedida!='CANASTO'){
      if(this.lote.lote==undefined){
        this.toastService.warning("Debe digitar un lote existente");
        return;
      }
      if(this.lote.disponible<=0){
        this.toastService.warning("El lote especificado no tiene cantidad disponible");
        return;
      }
      if(this.lote.disponible<this.despachoPreventaArticuloDetalleSelected.despacho){
        this.toastService.warning("La cantidad a despachar excede la cantidad disponible del lote especificado.");
        return;
      }
    }
    if(this.despachoPreventaArticuloDetalleSelected.estadoId==3 || this.despachoPreventaArticuloDetalleSelected.estadoId==2){
      return;
    }

   }

  if(this.loadingLote){return;}
  if(this.btnFinalizarDespachoCargando){return;}
  if(this.btnGuardarCanastoDespachoCargando){return;}





  this.btnGuardarDespachoCargando = true;
  let p= new DespachoPreventaRequestModel();
  p.articuloId = this.despachoPreventaArticuloDetalleSelected.articuloId;
  p.almacen_Origen = this.despachoPreventaArticuloDetalleSelected.almacen_Origen;
  p.almacen_Destino = this.despachoPreventaArticuloDetalleSelected.almacen_Destino;
  p.ruta = this.despachoPreventaArticuloDetalleSelected.ruta;

  p.lote = this.despachoPreventaArticuloDetalleSelected.lote;
  p.pedido = this.despachoPreventaArticuloDetalleSelected.pedido;
  p.despacho = this.despachoPreventaArticuloDetalleSelected.despacho;
  p.fechaEntrega = this.despachoPreventaArticuloDetalleSelected.fechaEntrega;
  p.lote = this.lote.lote;



  p.precio= this.despachoPreventaArticuloDetalleSelected.precio;
  p.validado=  this.despachoPreventaArticuloDetalleSelected.validado;



  this.httpService.DoPostAny<DespachoPreventaDetalleViewModel>(DataApi.Despacho,
    'registra_o_actualiza_DespachoPreventa', p).subscribe(response => {
      if (!response.ok) {
        this.toastService.error(response.errores[0], "Error");
        this.btnGuardarDespachoCargando = false;
      } else {
        if(response.records?.length>0){
         if(this.lote.lote!=undefined){
          this.despachoPreventaArticuloDetalleSelected.lote=this.lote.lote;
         }

          let estadoId= this.getEstadoByInfoItem(this.despachoPreventaArticuloDetalleSelected);

          this.despachoPreventaDetalles.filter(
            d=>d.codigoArticulo ==this.despachoPreventaArticuloDetalleSelected.codigoArticulo
             && d.almacenOrigenId==this.despachoPreventaArticuloDetalleSelected.almacenOrigenId
             && d.almacenDestinoId==this.despachoPreventaArticuloDetalleSelected.almacenDestinoId
            ).map(x=>{x.estadoId=estadoId,x.selected=false})
            let item=  this.despachoPreventaDetalles.filter(x=>x.estadoId!=3 && x.estadoId!=2 && x.noTieneLote!=true)[0];
              console.log(item)
            if(item!=undefined && item!=null){
              item.selected=true;
              this.despachoPreventaArticuloDetalleSelected=item;
              this.pageDetalleDespacho=  this.despachoPreventaArticuloDetalleSelected.page;
            }
              this.formatDespachoPreventaDetalles();

              this.getLote()
             this.toastService.success("Realizado", "OK");
        }
      }
      this.btnGuardarDespachoCargando = false;

    }, error => {
    this.btnGuardarDespachoCargando = false;
  console.log(error)
      this.toastService.error("Error conexion al servidor");
    });


}

agregarCanastoPreventa(){
  if(this.loadingLote){return;}
  if(this.btnFinalizarDespachoCargando){return;}
  if(this.despachoPreventaDetalles.filter(x=>x.unidadMedida=='CANASTO').length>0){return;}

  let item=this.despachoPreventaDetalles[0];


  let p= new DespachoPreventaRequestModel();
  p.articuloId = 180;
  p.almacen_Origen = item.almacen_Origen;
  p.almacen_Destino = item.almacen_Destino;
  p.ruta = item.ruta;
  p.pedido = 0;
  p.despacho = item.despacho;
  p.fechaEntrega =item.fechaEntrega;
  this.btnGuardarCanastoDespachoCargando=true;

  this.httpService.DoPostAny<DespachoPreventaDetalleViewModel>(DataApi.Despacho,
    'RegistraCanastoDespahoPreventa', p).subscribe(response => {
      if (!response.ok) {
        this.toastService.error(response.errores[0], "Error");
        this.btnGuardarCanastoDespachoCargando = false;
      } else {

        if(response.valores?.length>0){
          this.despachoPreventaDetalles.unshift({
            fechaEntrega:item.fechaEntrega,
            canalId:item.canalId,
            distribuidor: item.distribuidor,
            distribuidorId: item.distribuidorId,
            ruta:item.ruta,
            almacenOrigenId:item.almacenOrigenId,
            almacen_Origen:item.almacen_Origen,
            almacenDestinoId:item.almacenDestinoId,
            almacen_Destino:item.almacen_Destino,
            codigoArticulo: '600124',
            articuloId: 180,
            articulo:'Canastos',
            unidadMedida: 'CANASTO',
            pedido: 0,
            despacho: 0,
            validado:0,
            estadoId: 0,
            lote: '',
            selected:false,
            page:1,
            noTieneLote:true,
            peso:0  ,
            ubicacion:9,
            totalMonto:0,
            totalMontoDespacho:0,
            precio:0
            });
            this.formatDespachoPreventaDetalles();
             this.toastService.success("Realizado", "OK");
        }
      }
      this.btnGuardarCanastoDespachoCargando = false;

    }, error => {
    this.btnGuardarCanastoDespachoCargando = false;
  console.log(error)
      this.toastService.error("Error conexion al servidor");
    });



  console.log(this.despachoPreventaDetalles)
}



getEstadoByInfoItem(item:DespachoPreventaDetalleViewModel):number{
  if(item.despacho>=item.pedido){
    //ESTADO DESPACHADO
    return 3;
  }else if(item.despacho<item.pedido){
     //ESTADO IMCOMPLETO
     return 2;
  }else{
    //ESTADO NO
   return 1;
  }
}
onBackItemPreventa(){
  if(this.btnGuardarDespachoCargando){return;}
  if(this.loadingLote){return;}
  if(this.btnFinalizarDespachoCargando){return;}

  let backIndex=this.despachoPreventaDetalles.indexOf(this.despachoPreventaArticuloDetalleSelected)-1;
   if(backIndex<0){
      return;
   }
  this.despachoPreventaArticuloDetalleSelected.despacho=0;

    let item= this.despachoPreventaDetalles[backIndex];
    this.despachoPreventaDetalles.map(x=>{x.selected=false})
    item.selected=true;

    this.despachoPreventaArticuloDetalleSelected=item;
    if(this.despachoPreventaArticuloDetalleSelected.lote==null ||
      this.despachoPreventaArticuloDetalleSelected.lote==undefined ||
      this.despachoPreventaArticuloDetalleSelected.lote==''
      ){
        if(this.despachoPreventaArticuloDetalleSelected.unidadMedida!='CANASTO'){
          this.getLote()
        }
      }


}



registraDespachoPreventaInUse(){


  this.btnFinalizarDespachoCargando=true;

  let p= new DespachoPreventaRequestModel();
  p.ruta = this.despachoPreventaSeleccionado.rutaId;
  p.fechaEntrega = this.despachoPreventaSeleccionado.fechaEntrega;
  p.usuarioId =  Number(this.authService.tokenDecoded.nameid)

  this.httpService.DoPostAny<DespachoInUseVM>(DataApi.Despacho,
    'RegistraDespachoPreventaInUse', p).subscribe(response => {
      if (!response.ok) {
        this.toastService.error(response.errores[0], "Error");
        this.btnFinalizarDespachoCargando = false;
      } else {
        if(response.valores?.length>0){

                this.despachoInUseVM =response.valores[0];
                if(!this.despachoInUseVM.hasPermisoValidador){
                  console.log( this.despachoInUseVM )

                      if(this.despachoPreventaSeleccionado.finalizado==1){

                        this.despachoPreventaSeleccionado.noEditable=1;
                        this.despachoInUseVM.estado=4
                        this.despachoInUseVM.mensaje="DESPACHO FINALIZADO"
                      }else{
                        if(this.despachoInUseVM.estado==2){
                          this.despachoPreventaSeleccionado.noEditable=1;
                        }else{
                          this.toastService.info(this.despachoInUseVM.mensaje, "OK");
                        }
                      }
              }
        }
      }
      this.btnFinalizarDespachoCargando = false;

    }, error => {
     this.btnFinalizarDespachoCargando = false;
      this.toastService.error("Error conexion al servidor");
    });


}


finalizaDespacho(estado:number){

 //ESTADO 2 INDICA QUE EL DESPACHO SE PICKEARA DE MANERA MANUAL
 //ESTADO 3 INDICA QUE EL DESPACHO SE PICKEO MEDIANTE LA PLATAFORMA WEB

 this.confirmFinalizaModal.dismiss();
  this.despachoPreventaSeleccionado.noEditable=1;


  this.btnFinalizarDespachoCargando=true;

  let p= new DespachoPreventaRequestModel();
  p.ruta = this.despachoPreventaSeleccionado.rutaId;
  p.fechaEntrega = this.despachoPreventaSeleccionado.fechaEntrega;
  p.estadoId=estado;

  this.httpService.DoPostAny<DespachoPreventaDetalleViewModel>(DataApi.Despacho,
    'finalizaDespachoPreventa', p).subscribe(response => {
      if (!response.ok) {
        this.toastService.error(response.errores[0], "Error");
        this.despachoPreventaSeleccionado.noEditable=0;
        this.btnFinalizarDespachoCargando = false;
      } else {
        if(response.valores?.length>0){

          console.log(response.valores)
          console.log(response.valores[0])
              if(response.valores[0]>0){
                this.despachoPreventaSeleccionado.finalizado=1;
                this.despachoPreventaSeleccionado.noEditable=1;
                this.despachoPreventaSeleccionado.estadoDespacho=4;
                console.log(  this.despachoPreventaSeleccionado)
              }
              this.despachoInUseVM.estado=4
              this.despachoInUseVM.mensaje="DESPACHO FINALIZADO"
              this.getDataByCondicional()
             this.toastService.success("Realizado", "OK");
        }
      }
      this.btnFinalizarDespachoCargando = false;

    }, error => {
      this.despachoPreventaSeleccionado.noEditable=0;
      this.btnFinalizarDespachoCargando = false;
      this.toastService.error("Error conexion al servidor");
    });


}



openModalConfirmFinalizaDespacho(content,is,item) {
  if(is==1){
    this.despachoPreventaSeleccionado=item;
  }

  this.confirmFinalizaModal=this.modalService.open(content, { size: 'sm',centered:true });
  // this.articuloSeleccionado = item
}



onLoteInput(){
 // this.lote = new SAPLoteDespachoPedido();
  //this.despachoPreventaArticuloDetalleSelected.lote= this.lote.lote;
}
modalDespachoDetalleClose(){
  this.despachoPreventaSeleccionado= new DespachoListadoPreventaVM();
  this.limpiarDataPreventa()
  this.getDataByCondicional();
  this.modalService.dismissAll();
}

limpiarDataPreventa(){
  this.collectionSizeDetalleDespacho=0
  this.pageDetalleDespacho=1;
  this.despachoPreventaDetalles=[];
  this.paginateDataDetalleDespacho=[];
  this.despachoPreventaArticuloDetalleSelected = new DespachoPreventaDetalleViewModel();
  this.despachoInUseVM= new DespachoInUseVM();
}

validaDiferenciaMinimaDespacho(item: DespachoListadoPreventaVM){

    let diff= item.totalMontoPedidoERP-item.totalMontoPedido;
    if(item.totalMontoPedido==0){return false}
    if(item.totalMontoPedidoERP< Math.trunc( item.totalMontoPedido)){return false}
    if(diff<=this.Diferencia_Minima_Despacho){
      return true;
    }else{return false}
}

ngOnDestroy(): void {
  window.clearInterval(this.intervalRefreshData)

}




}
