import { SAPLoteDespachoPedido } from './../models/DespachoPedidoDetalleViewModel';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
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
  paginaNumeroActual = 1;
  Cargando: boolean = false;
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


  canales:ComboBox[]=[];
  canalId:number=1;


  //PREVENTA
   despachoPreventaSeleccionado: DespachoListadoPreventaVM;
   dataPreventa: DespachoListadoPreventaVM[] = [] //tu modelo
   despachoPreventaDetalles: DespachoPreventaDetalleViewModel[];
   despachoPreventaArticuloDetalleSelected: DespachoPreventaDetalleViewModel;
   loadingDespachoPreventaDetalle:boolean;

   lote: SAPLoteDespachoPedido = new SAPLoteDespachoPedido();



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
   this.getDataByCondicional()

    this.getCanales();
    this.getArticulosDePesosExtras();
    this.getAlmacenes();
   // this.empezarAmbientePrueba();
    for (let i = 1; i <= 100; i++) {
      this.cantidades.push(i)
    }
  }
 getDataByCondicional(){
  switch (this.canalId) {
    case 1:
         this.getDataPreventa()
        break;
    case 2:
          this.getData()
          break;
    default:
            this.getData()
          break;
  }
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


  openModal(content, despacho: any) {
    console.log(despacho)
    switch (this.canalId) {
      case 1:
          this.despachoPreventaDetalles = [];
          this.getDespachoPreventaDetalle(despacho.fechaEntrega,despacho.distribuidorId);
          this.despachoPreventaSeleccionado = despacho;
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
          console.log(this.despachoDetalles)
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
              console.log(pedido)
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

    console.log(this.despachoPreventaArticuloDetalleSelected.lote)
    if(this.despachoPreventaArticuloDetalleSelected.lote==""
       || this.despachoPreventaArticuloDetalleSelected.lote==undefined){
       this.toastService.warning("Debe digitar un lote.");
       return;
     }


    this.loadingLote = true;
    let ap = new SAPLoteDespachoPedido();
    ap.articulo = this.despachoPreventaArticuloDetalleSelected.codigoArticulo;
    ap.almacen = this.despachoPreventaArticuloDetalleSelected.almacen_Origen.toString();
    ap.lote = this.despachoPreventaArticuloDetalleSelected.lote;

    this.httpService.DoPostAny<SAPLoteDespachoPedido>(DataApi.Despacho,
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
            this.lote = record ?? new SAPLoteDespachoPedido();
            console.log(this.lote)
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








  // CANAL PREVENTA   CANAL PREVENTA   CANAL PREVENTA   CANAL PREVENTA   CANAL PREVENTA   CANAL PREVENTA

  getDataPreventa() {
    this.Cargando = true;

    let parametros: Parametro[] = [{ key: "Search", value: this.Search }, ]

    this.httpService.GetAllWithPagination<DespachoListadoPreventaVM>(DataApi.Despacho,
       "GetDespachoPreventaListado", "FechaEntrega", this.paginaNumeroActual,
      this.paginaSize,true, parametros).subscribe(x => {

        if (x.ok) {
          this.dataPreventa = x.valores[0];
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

  getDespachoPreventaDetalle(fecha:string,distribuidorId:number) {
    this.loadingDespachoPreventaDetalle = true;

    let parametros={
     "Fecha":fecha
    ,"DistribuidorId": distribuidorId
   }


    this.httpService.DoPostAny<DespachoPreventaDetalleViewModel>(DataApi.Despacho,
      "GetDespachoPreventaDetalles", parametros).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.despachoPreventaDetalles = response.valores[0];
          if(this.despachoPreventaDetalles.length>0){
            this.despachoPreventaDetalles[0].selected=true;
            this.despachoPreventaArticuloDetalleSelected=this.despachoPreventaDetalles[0];

          }
          console.log(this.despachoPreventaDetalles)
        }
        this.loadingDespachoPreventaDetalle = false;
      }, error => {
        console.log(error)
        this.loadingDespachoPreventaDetalle = false;
        this.toastService.error("No se pudo obtener el detalle", "Error conexion al servidor");
      });
  }

  onSelectArticuloInDetallePreventa(item:DespachoPreventaDetalleViewModel){
    if(item.estadoId==1){
       item.lote="";
    }
    console.log(item)
    this.lote = new SAPLoteDespachoPedido();
    this.despachoPreventaDetalles.map(x=>{x.selected=false})
    item.selected=true;
    this.despachoPreventaArticuloDetalleSelected=item;

 }

 onNextItemPreventaSubmit(){

  if(this.lote.lote==undefined){
    this.toastService.warning("Debe digitar un lote existente");
    return;
  }
  if(this.lote.cantidad<=0){
    this.toastService.warning("El lote especificado no tiene cantidad disponible");
    return;
  }
  if(this.lote.cantidad<this.despachoPreventaArticuloDetalleSelected.despacho){
    this.toastService.warning("La cantidad a despachar excede la cantidad disponible del lote especificado.");
    return;
  }
  if(this.despachoPreventaArticuloDetalleSelected.pedido<this.despachoPreventaArticuloDetalleSelected.despacho){
    this.toastService.warning("La cantidad a despachar excede la cantidad pedida.");
    return;
  }



  let estadoId= this.getEstadoByInfoItem(this.despachoPreventaArticuloDetalleSelected);

  this.despachoPreventaDetalles.filter(
    d=>d.codigoArticulo ==this.despachoPreventaArticuloDetalleSelected.codigoArticulo
     && d.almacenOrigenId==this.despachoPreventaArticuloDetalleSelected.almacenOrigenId
     && d.almacenDestinoId==this.despachoPreventaArticuloDetalleSelected.almacenDestinoId
    ).map(x=>{x.estadoId=estadoId,x.selected=false})
    let item=  this.despachoPreventaDetalles.filter(x=>x.estadoId!=3)[0];
    item.selected=true;
    this.despachoPreventaArticuloDetalleSelected=item;

    this.lote= new SAPLoteDespachoPedido();
}

getEstadoByInfoItem(item:DespachoPreventaDetalleViewModel):number{
  if(item.despacho==item.pedido){
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

  let backIndex=this.despachoPreventaDetalles.indexOf(this.despachoPreventaArticuloDetalleSelected)-1;
   if(backIndex<0){
      return;
   }
    let item= this.despachoPreventaDetalles[backIndex];
    this.despachoPreventaDetalles.map(x=>{x.selected=false})
    item.selected=true;

    this.despachoPreventaArticuloDetalleSelected=item;


}

onLoteInput(){
  this.lote = new SAPLoteDespachoPedido();
  this.despachoPreventaArticuloDetalleSelected.lote=this.despachoPreventaArticuloDetalleSelected.lote?.toUpperCase();
}
}
