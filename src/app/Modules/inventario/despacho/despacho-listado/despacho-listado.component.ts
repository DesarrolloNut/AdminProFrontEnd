import { DepachoHorasVM, DespachoListadoPreventaVMTotales } from './../models/DespachoPedidoListadoViewModel';
import { ComboBoxLote } from './../../../../shared/model/ComboBox';
import { DespachoInUseVM, DespachoPreventaDetalleExportVM, DespachoPreventaRequestModel, DespachoRangoHoraRequestModel, SAPLoteDespachoPedido } from './../models/DespachoPedidoDetalleViewModel';
import { Component, ElementRef, HostListener, NgZone, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { NgxPermissionsService } from 'ngx-permissions';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'src/app/core/authentication/service/authentication.service';
import { Parametro } from 'src/app/core/http/model/Parametro';
import { ResponseContenido } from 'src/app/core/http/model/ResponseContenido';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { ArticuloPesosExtras } from 'src/app/Modules/produccion/pesaje/models/ArticuloPesosExtras';
import { ArticuloPesosExtrasViewModel } from 'src/app/Modules/produccion/pesaje/models/ArticuloPesosExtrasViewModel';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { ComboBox } from 'src/app/shared/model/ComboBox';
import { DespachoPedidoDetalleArticuloViewModel, DespachoPedidoDetalleViewModel, DespachoPreventaDetalleViewModel } from '../models/DespachoPedidoDetalleViewModel';
import { DespachoListadoPreventaVM, DespachoPedidoListadoViewModel } from '../models/DespachoPedidoListadoViewModel';
import * as XLSX from 'xlsx';
import { animate, style, transition, trigger } from '@angular/animations';
import { BalanzaPesoGrupoSignalREnum } from 'src/app/shared/enums/BalanzaPesoGrupoSignalREnum';
import { BalanzaPesajeSignalrService } from 'src/app/Services/balanza-pesaje-signalr.service';
import { Usuario } from 'src/app/Modules/servicios/recepcion/models/Usuario';
import { PrintExportFile, TypeReport } from 'src/app/Services/PrintExportFile.service';
import { Subscriber } from 'rxjs';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-despacho-listado',
  templateUrl: './despacho-listado.component.html',
  styleUrls: ['./despacho-listado.component.scss'],
  animations: [
    trigger('onArticulos', [
      transition(':enter', [style({
        opacity: 0,
        transform: 'translateX(-100%)'
      }),
      animate(400)
    ])
    ]),
    trigger('onDArticulo', [
      transition(':enter', [style({
        opacity: 0,
        transform: 'translateX(100%)'
      }),
      animate(400)
    ])
    ]),
 ]
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
  intervalRefreshBalanza: NodeJS.Timeout
   fDesde = new Date();
   fHasta = new Date();
   dia : string;
   fahoraServidor = new Date();
   despachoOn = 1
   Diferencia_Minima_Despacho = 0
   Despacho_Max_Porciento = 0
   despachoPuedeHorario = true;
   HorarioEstablecido=false;
   loadingRangosFechaDespacho =false;
   Horario=false;

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
   viewAllArticulos=false;
   lotesDisponibles:SAPLoteDespachoPedido[]=[];

    //PAGINACION MODAL DETALLE DESPACHO
    paginateDataDetalleDespacho: DespachoPreventaDetalleViewModel[] = [];


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
    emitPesoBalanza:boolean =true;
    pesoBalanzaUltimaFecha: Date = new Date();
    pesoBalanzaLBNumber: number = 0;

    pesoArticuloBalanza: number
    pesoCanastos: number = 0;
    pesoNeto: number = 0;
    loadingPeso: boolean = false;
    readonly PESO_BALANZA_DEFAULT_VALUE: string = "0.00 KG";
    readonly KILOGRAMO_A_LIBRA: number = 2.20462;
    usuario: Usuario;


    puedeFinalizarDespacho=false;
    idPicking: number;

      //PESAJE

  constructor(private toastService: ToastrService,
    private httpService: BackendService,
    private modalService: NgbModal,
    private router: Router,
    private signalRService: BalanzaPesajeSignalrService,
    public permissionsService: NgxPermissionsService,
    private authService: AuthenticationService,
    private ngzone: NgZone,
    private printService :PrintExportFile ,

  ) { }

 
  ngOnInit(): void {
    this.getALLAsync()
    this.getSucursalByUsuarioId();
    this.getUsuarioLogueado();
    this.getArticulosDePesosExtras();
  }

  async getALLAsync(){
    await  this.getDiferenciaMinima()
   await  this.getDespachoMaxPorciento()
    await  this.getCanales();
    await  this.getAlmacenes();
  }

  startPingingBalanza() {
  setTimeout(() => {

        if (!this.loadingPeso && this.usuario && this.emitPesoBalanza)  {
          // this.loadingPeso = true;
          this.signalRService.getPesajeFromBalanza(Number(this.usuario.puertoEquipo),
            this.usuario.ipEquipo)

          this.emitPesoBalanza=false;
        }
      }, 1000);
  }

 
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
  subscribirPesoBalanzaCambios() {
    this.signalRService.startConnection(BalanzaPesoGrupoSignalREnum.Pantalla_Pesaje);

    this.signalRService.pesoBalanza.subscribe((peso: string) => {
      this.loadingPeso = false;
      if(this.despachoPreventaArticuloDetalleSelected?.estadoId==1
        && this.despachoPreventaArticuloDetalleSelected.unidadMedida=='LBS'
        && this.despachoPreventaSeleccionado.finalizado==0) {
          this.ngzone.run(() => {
            this.pesoBalanza = peso;
            this.pesoBalanzaUltimaFecha = new Date();
            this.formatStringFromBalanza();
            this.getKilogramosNumberFromPesoBalanza();
            this.calcularTotales();
        });

      }

    })

  }





getAllData(){
  this.getDataByCondicional(true,false)

  this.intervalRefreshData = setInterval(() => {
    this.getDataByCondicional(false,false)
  }, 40000)

}

 getDataByCondicional(showLoading=true,validaHorario=true){
   if(validaHorario){this.validaHorarioDespacho(); return;}

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
  window.clearInterval(this.intervalRefreshData);
  this.dataPreventa =  [];
  this.dataPreventaTotales= [];
 this.loadingRangosFechaDespacho=true;
 let p= new DespachoRangoHoraRequestModel();
     p.fecha = this.fecha;
     p.SucursalId=Number(this.sucursalId);

    

  this.httpService.DoPostAny<string>(DataApi.Despacho,
    "GetDespachoRangoValor", p).subscribe(response => {

      if (!response.ok) {
        this.toastService.error(response.errores[0]);
      } else {
          let h:DepachoHorasVM =  response.valores[0]
          this.despachoPuedeHorario=h.puedeDespachar;
          this.dia=h.diaNombre;
          this.idPicking=h.id;
          this.Horario=h.hayHorario;
         
         


          this.fDesde.setHours(h.horaDesde .hours);
          this.fDesde.setMinutes(h.horaDesde.minutes);
          this.fHasta.setHours(h.horaHasta.hours);
          this.fHasta.setMinutes(h.horaHasta.minutes);

        if (this.despachoPuedeHorario) {
           this.getAllData()
           }
      }
      this.loadingRangosFechaDespacho=false;

    }, error => {
      this.loadingRangosFechaDespacho=false;
      console.error(error)
      this.toastService.error("ha ocurrido un error", "Error conexion al servidor");
    });
}

async getDiferenciaMinima(){
  await this.httpService.DoPostAnyAsync<string>(DataApi.Despacho,
    "GetDiferenciaMinimaDespacho", null).then(response => {

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

async getDespachoMaxPorciento() {
  await  this.httpService.DoPostAnyAsync<string>(DataApi.Despacho,
      "GetDespachoMaxPorciento", null).then(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
            this.Despacho_Max_Porciento=parseFloat(response.valores[0])

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
       //   this.getDataByCondicional()
        }

        this.sucursales = response.records;
        this.getDataByCondicional();

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


   // this.empezarAmbientePrueba();
    this.subscribirPesoBalanzaCambios()
    this.startPingingBalanza()


    switch (this.canalId) {
      case 1:
          this.despachoPreventaDetalles = [];
          this.despachoPreventaSeleccionado = despacho;
          this.getDespachoPreventaDetalleFromAPi(despacho.fechaEntrega,despacho.rutaId);
          if(!onlyView){
            this.registraDespachoPreventaInUse();
          }
          break;
      case 2:
            this.despachoDetalles = [];
        //    this.getDespachoDetalle(despacho.id);
            this.despachoSeleccionado = despacho;
            break;
      default:
            this.despachoDetalles = [];
         //   this.getDespachoDetalle(despacho.id);
            this.despachoSeleccionado = despacho;
            break;
    }
    this.modalService.open(content, { windowClass: "myCustomModalClass", backdrop: "static", });
  }

  openModalAutorizar(content, despacho: DespachoPedidoListadoViewModel) {
    this.despachoDetalles = [];
    //this.getDespachoDetalle(despacho.id);
    this.despachoSeleccionado = despacho;
    this.modalService.open(content, { size: 'lg', });
  }

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
  async getAlmacenes() {
    this.loadingAlmacenes = true;
  await  this.httpService.DoPostAsync<ComboBox>(DataApi.ComboBox,
      "GetAlmacenes", null).then(response => {

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
     this.cantidades= [];
    for (let i = 0; i <= 10; i++) {
      this.cantidades.push(i)
    }
    this.articulosExtras = []
    this.articulosExtrasComboBox.forEach(a => {

        let item: ArticuloPesosExtrasViewModel = new ArticuloPesosExtrasViewModel();

        item.articuloID = a.articuloID
        item.codigoReferencia = a.codigoReferencia
        item.nombre = a.nombre
        item.cantidadSeleccionada = a.cantidadDefault;
        item.pesoSeleccionado = a.valor
        item.abreviatura=a.abreviatura;

        this.articulosExtras.push(item)

    })
  }

  onSelectArticulo(item:DespachoPedidoDetalleViewModel){
     this.despachoDetalles.map(x=>{x.selected=false})
     item.selected=true;
     this.despachoPedidoArticuloDetalleSelected=item;
     this.lote = new SAPLoteDespachoPedido();
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

    
    this.loadingLote = true;
    let ap = new SAPLoteDespachoPedido();
    ap.articulo = this.despachoPreventaArticuloDetalleSelected.codigoArticulo;
    ap.almacen = this.despachoPreventaArticuloDetalleSelected.almacen_Origen.toString();
    ap.cantidadPedida = this.despachoPreventaArticuloDetalleSelected.pedido;
    this.httpService.DoPostAny<SAPLoteDespachoPedido>(DataApi.Despacho,
      "GetLote", ap).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          //validar que existe
          if (response != null && response.valores != null && response.valores.length > 0) {
            if( response.valores == null || response.valores[0].length==0  || response.valores[0] == null ){
              // this.toastService.warning("No se encontro el lote.");
              let lote:SAPLoteDespachoPedido[] =[]

              lote.push(
              {articulo:'SIN LOTE'
              ,almacen:'',lote:'SIN LOTE',fechExpira:new Date().toDateString()
              ,disponible:10000,
              cantidadPedida:0})

              this.lotesDisponibles=lote;
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

    //this.pesoBalanzaLBNumber = 0

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
    this.pesoCanastos=0;
    if (this.articulosExtras) {
      this.articulosExtras.forEach(a => {
        if (a.cantidadSeleccionada && a.pesoSeleccionado) {
          this.pesoCanastos += a.cantidadSeleccionada * (a.pesoSeleccionado * 1)
        }
      })
    }
    if(this.despachoPreventaArticuloDetalleSelected.estadoId==1){

      this.pesoNeto = this.pesoBalanzaLBNumber - this.pesoCanastos;
      this.despachoPreventaArticuloDetalleSelected.despacho= Number( this.pesoNeto.toFixed(2));
    }else{
      this.pesoBalanzaLBNumber=  this.despachoPreventaArticuloDetalleSelected.despacho + this.pesoCanastos;
      this.pesoNeto =this.despachoPreventaArticuloDetalleSelected.despacho;

    }

  }


  //prueba
  getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return (Math.floor(Math.random() * (max - min + 1)) + min)
  }





  async getCanales() {
    this.loadingCanales = true;
   await this.httpService.DoPostAsync<ComboBox>(DataApi.ComboBox,
      "GetCanales", null).then(response => {

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
      { key: "Fecha", value: formatDate(this.fecha,'yyyy-MM-dd', 'en-US')  },
     ]



    this.httpService.GetAllWithPagination<DespachoListadoPreventaVM>(DataApi.Despacho,
       "GetDespachoPreventaListado", "FechaEntrega", this.paginaNumeroActual,
      this.paginaSize,true, parametros).subscribe(x => {
        if (x.ok) {

          this.dataPreventa = x.valores[0];
          console.log(x.valores[0])
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

         let d:DespachoPreventaDetalleViewModel[] = response.valores[0];
         d.forEach(x=>{
           if(x.articulosExtraPesajeString!='' || x.articulosExtraPesajeString!=null || x.articulosExtraPesajeString!=undefined){
             x.articulosExtraPesaje= JSON.parse( x.articulosExtraPesajeString)
           }
         })
          this.despachoPreventaDetalles =d;
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

       this.despachoPreventaDetalles.sort((a, b) => a.estadoId - b.estadoId);


      this.despachoPreventaDetalles.filter(x=>x.codigoArticulo=='600124').map(x=>x.unidadMedida='CANASTO')


      this.despachoPreventaDetalles[0].selected=true;
      this.despachoPreventaArticuloDetalleSelected=this.despachoPreventaDetalles[0];
      if (!this.existeArticuloPendienteDespachar()) {return;}

       this.getLote();

    }

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
  //  data.sort((a, b) =>  a.codigoArticulo.localeCompare(b.codigoArticulo) );

    // this.router.navigate(['/impresion/inventario/print-d-preventa-detalles'],
    // { queryParams:

    //   {
    //     despachopreventa: JSON.stringify(this.despachoPreventaSeleccionado),
    //     despachopreventadetalles: JSON.stringify(this.despachoPreventaDetalles),
    //   },
    //   });
    let dataFormated:DespachoPreventaDetalleExportVM[] = [];
    data.forEach(x=>{
      let piezas =0;
       if(x.unidadMedida=="LBS" ){
          piezas = Math.round(((x.pedido)/x.peso));
       }else if(x.unidadMedida=="UNIDAD"){
         if(x.pedido>=x.peso){
          piezas = Math.trunc(((x.pedido)/x.peso));
          piezas = parseFloat(piezas + "."+(x.pedido%x.peso))
         }else{
          piezas=0;
         }

       }

       dataFormated.push({
         Distribuidor:this.despachoPreventaSeleccionado.distribuidor,
         Ruta:this.despachoPreventaSeleccionado.ruta,
         RutaId:this.despachoPreventaSeleccionado.rutaId,
         FechaEntrega:this.despachoPreventaSeleccionado.fechaEntrega,
         CodigoArticulo:x.codigoArticulo,
         Descripcion:x.articulo,
         Almacen_Desde:x.almacen_Origen,
         Almacen_Hasta:x.almacen_Destino,
         Unidad:x.unidadMedida,
         Piezas: piezas,
         Despacho:(x.despacho>0? x.despacho : undefined),
         Pedido:x.pedido,
       })
    });
     this.printService.ExportFile(dataFormated,
                                 "Industrias La Nutriciosa, SRL",
                                  "Hoja de despacho",
                                  "Transacción entre almacenes",
                                TypeReport.PDF,"RPT006")


  }
  despachoPreventaDetalleToExcel(data:DespachoPreventaDetalleViewModel[]) {
    data.sort((a, b) =>  a.codigoArticulo.localeCompare(b.codigoArticulo) );

         let dataFormated:DespachoPreventaDetalleExportVM[] = [];
         data.forEach(x=>{
            dataFormated.push({
              CodigoArticulo:x.codigoArticulo,
              Descripcion:x.articulo,
              Almacen_Desde:x.almacen_Origen,
              Almacen_Hasta:x.almacen_Destino,
              Pedido:x.pedido,
              Despacho:x.despacho
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

  onSelectArticuloInDetallePreventa(item:DespachoPreventaDetalleViewModel){
    if(this.btnGuardarDespachoCargando){return;}
    if(this.loadingLote){return;}
    if(this.btnGuardarCanastoDespachoCargando){return;}


    if(this.despachoPreventaArticuloDetalleSelected.estadoId==1)
    {
      this.despachoPreventaArticuloDetalleSelected.despacho=0;
    }

    this.despachoPreventaDetalles.map(x=>{x.selected=false})
    item.selected=true;
    setTimeout(() => {
    this.changeViewDetalleDespacho(false)
    }, 200);

    this.despachoPreventaArticuloDetalleSelected=item;
    //Muestra los articulos extras agregados de los despachos registrados
    this.showArticulosExtraEnDespachoRegistrado();

    if(this.despachoPreventaArticuloDetalleSelected.estadoId==1 ){
        if(this.despachoPreventaArticuloDetalleSelected.unidadMedida!='CANASTO'){
          this.getLote()
        }
        return;
      }


 }



 existeArticuloPendienteDespachar():boolean{
  if( this.despachoPreventaDetalles.filter(x=>x.estadoId==1).length<=0){
    this.viewAllArticulos=true;
    this.puedeFinalizarDespacho=true;
    return false;
 }
 this.viewAllArticulos=false;
 this.puedeFinalizarDespacho=false;
 return true;

 }
 onNextItemPreventaSubmit(){
  let despachoMax=
  this.despachoPreventaArticuloDetalleSelected.pedido + this.despachoPreventaArticuloDetalleSelected.pedido*(this.Despacho_Max_Porciento/100);
  //VALIDA EXISTE ALGUN ARTICULO PENDIENTE POR DESPACHAR
  if (!this.existeArticuloPendienteDespachar()) {return;}

   if( this.despachoPreventaSeleccionado.finalizado==0 && !this.despachoInUseVM.hasPermisoValidador)
   {
    if(this.despachoPreventaArticuloDetalleSelected.unidadMedida!='CANASTO'){
      if(this.lote.lote==undefined){
        this.toastService.warning("Debe digitar un lote existente");
        return;
      }

      if(despachoMax<this.despachoPreventaArticuloDetalleSelected.despacho){
          this.toastService.warning("La cantidad a despachar excede la cantidad pedida.");
          return;
      }

      // if(this.lote.disponible<=0){
      //   this.toastService.warning("El lote especificado no tiene cantidad disponible");
      //   return;
      // }
      if(this.despachoPreventaArticuloDetalleSelected.despacho<0){
        this.toastService.warning(" El monto neto no puede ser negativo");
        return;

      }
      // if(this.lote.disponible<this.despachoPreventaArticuloDetalleSelected.despacho){
      //   this.toastService.warning("La cantidad a despachar excede la cantidad disponible del lote especificado.");
      //   return;
      // }
    }
    if(this.despachoPreventaArticuloDetalleSelected.estadoId==3 || this.despachoPreventaArticuloDetalleSelected.estadoId==2){
      return;
    }

   }

  if(this.loadingLote){return;}
  if(this.btnFinalizarDespachoCargando){return;}
  if(this.btnGuardarCanastoDespachoCargando){return;}



  //Mapea los articulos extras selecionados
   let artExtrasSeleccionados:ArticuloPesosExtrasViewModel[]= [];
   this.articulosExtras.filter(x=>x.cantidadSeleccionada>0).forEach(x=>{
    artExtrasSeleccionados.push({
      articuloID:x.articuloID,
      codigoReferencia:x.codigoReferencia,
      nombre:x.nombre,
      pesos:x.pesos,
      abreviatura:x.abreviatura,
      pesoSeleccionado:x.pesoSeleccionado,
      cantidadSeleccionada:x.cantidadSeleccionada
    });
  })



  this.btnGuardarDespachoCargando = true;
  let p= new DespachoPreventaRequestModel();
  p.articuloId = this.despachoPreventaArticuloDetalleSelected.articuloId;
  p.almacen_Origen = this.despachoPreventaArticuloDetalleSelected.almacen_Origen;
  p.almacen_Destino = this.despachoPreventaArticuloDetalleSelected.almacen_Destino;
  p.ruta = this.despachoPreventaArticuloDetalleSelected.ruta;

  p.lote = this.despachoPreventaArticuloDetalleSelected.lote;
  p.pedido = this.despachoPreventaArticuloDetalleSelected.pedido;
  p.pedidoOferta= this.despachoPreventaArticuloDetalleSelected.pedidoOferta;
  p.pedidoVentas= this.despachoPreventaArticuloDetalleSelected.pedidoVentas;
  p.despachoTipo=1;
  p.costo=0;
  p.montoPedido=0;
  p.despacho = this.despachoPreventaArticuloDetalleSelected.despacho;
  p.fechaEntrega = this.despachoPreventaArticuloDetalleSelected.fechaEntrega;
  p.lote = this.lote.lote;



  p.precio= this.despachoPreventaArticuloDetalleSelected.precio;

  p.validado=  this.despachoPreventaArticuloDetalleSelected.validado;

  p.articulosPesajeExtra= artExtrasSeleccionados;


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
          this.despachoPreventaArticuloDetalleSelected.articulosExtraPesaje=artExtrasSeleccionados;

          if (!this.existeArticuloPendienteDespachar()) {return;}

          this.despachoPreventaDetalles.filter(
            d=>d.codigoArticulo ==this.despachoPreventaArticuloDetalleSelected.codigoArticulo
             && d.almacenOrigenId==this.despachoPreventaArticuloDetalleSelected.almacenOrigenId
             && d.almacenDestinoId==this.despachoPreventaArticuloDetalleSelected.almacenDestinoId
            ).map(x=>{x.estadoId=estadoId,x.selected=false})
            let item=  this.despachoPreventaDetalles.filter(x=>x.estadoId!=3 && x.estadoId!=2 && x.noTieneLote!=true)[0];

            if(item!=undefined && item!=null){
              item.selected=true;
              this.despachoPreventaArticuloDetalleSelected=item;

            }

              this.formatDespachoPreventaDetalles();

              this.getLote()
              this.showArticulosExtraEnDespachoRegistrado();

             this.toastService.success("Realizado", "OK");
        }
      }
      this.btnGuardarDespachoCargando = false;

    }, error => {
    this.btnGuardarDespachoCargando = false;
      this.toastService.error("Error conexion al servidor");
    });


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

    let item= this.despachoPreventaDetalles[backIndex];
    this.despachoPreventaDetalles.map(x=>{x.selected=false})
    item.selected=true;

    this.despachoPreventaArticuloDetalleSelected=item;


    if(this.despachoPreventaArticuloDetalleSelected.estadoId==1
      ){
        if(this.despachoPreventaArticuloDetalleSelected.unidadMedida!='CANASTO'){
          this.getLote()
        }
        this.despachoPreventaArticuloDetalleSelected.despacho=0;
        return;
      }
}



  registraDespachoPreventaInUse(){


  this.btnFinalizarDespachoCargando=true;

  let p= new DespachoPreventaRequestModel();
  p.ruta = this.despachoPreventaSeleccionado.rutaId;
  p.fechaEntrega = this.despachoPreventaSeleccionado.fechaEntrega;
  p.usuarioId =  Number(this.authService.tokenDecoded.nameid)
  p.estadoId = 2;

  this.httpService.DoPostAny<DespachoInUseVM>(DataApi.Despacho,
    'RegistraDespachoPreventaInUse', p).subscribe(response => {
      if (!response.ok) {
        this.toastService.error(response.errores[0], "Error");
        this.btnFinalizarDespachoCargando = false;
      } else {
        if(response.valores?.length>0){

                this.despachoInUseVM =response.valores[0];
                if(!this.despachoInUseVM.hasPermisoValidador){

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

              if(response.valores[0]>0){
                this.despachoPreventaSeleccionado.finalizado=1;
                this.despachoPreventaSeleccionado.noEditable=1;
                this.despachoPreventaSeleccionado.estadoDespacho=4;
              }
              this.despachoInUseVM.estado=4

              this.despachoInUseVM.mensaje="DESPACHO FINALIZADO"
              this.getDataByCondicional()
             this.toastService.success("Realizado", "OK");
             setTimeout(() => {
              this.modalDespachoDetalleClose();
              }, 1500);
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




showArticulosExtraEnDespachoRegistrado(){

  let a_extras=this.despachoPreventaArticuloDetalleSelected.articulosExtraPesaje;

  if(a_extras==null || a_extras.length<=0){
    this.articulosExtras.map(x=>x.cantidadSeleccionada=0);
    this.pesoBalanzaLBNumber=0;
    this.pesoNeto=0;
    this.calcularTotales();
    return;
  }
  this.despachoPreventaArticuloDetalleSelected.articulosExtraPesaje.forEach(x=>{
    this.articulosExtras.filter(  a=>a.articuloID==x.articuloID && a.pesoSeleccionado ==x.pesoSeleccionado)
                         .map(m=>m.cantidadSeleccionada=x.cantidadSeleccionada)
  })
  this.calcularTotales();

}

modalDespachoDetalleClose(){
  window.clearInterval(this.intervalRefreshBalanza)
  this.despachoPreventaSeleccionado= new DespachoListadoPreventaVM();
  this.limpiarDataPreventa()
  this.getDataByCondicional();
  this.modalService.dismissAll();
}

limpiarDataPreventa(){
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


focusInputDespacho(){
  if(this.despachoPreventaArticuloDetalleSelected.despacho==0){
    this.despachoPreventaArticuloDetalleSelected.despacho=undefined;
  }
}
focusInputValidado(){
  if(this.despachoPreventaArticuloDetalleSelected.validado==0){
    this.despachoPreventaArticuloDetalleSelected.validado=undefined;
  }
}
focusInputCantidadCanasto(item:ArticuloPesosExtrasViewModel){
  if(item.cantidadSeleccionada==0){
    item.cantidadSeleccionada=undefined;
  }
}
ngOnDestroy(): void {
    window.clearInterval(this.intervalRefreshData)
    this.signalRService.disconnectBalanza(Number(this.usuario.puertoEquipo),
    this.usuario.ipEquipo)
}

//    disconnectBalanza(){
//     setTimeout( () => {

//         this.signalRService.disconnectBalanza(Number(this.usuario.puertoEquipo),
//          this.usuario.ipEquipo)

//        this.emitPesoBalanza=true;
//         }, 1000);


// }

connectBalanza(){
  this.subscribirPesoBalanzaCambios()
  this.startPingingBalanza()
}

 changeViewDetalleDespacho(viewAllArticulos:boolean){
   if (this.existeArticuloPendienteDespachar()) {
      //this.toastService.warning("No puedes ver el listado de articulos, aún tienes articulos pendientes por despachar.")
    // return;
   }
   this.viewAllArticulos=viewAllArticulos;

 }

}
