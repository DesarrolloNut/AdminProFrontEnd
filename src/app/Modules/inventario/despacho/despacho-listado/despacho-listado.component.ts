import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxPermissionsService } from 'ngx-permissions';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'src/app/core/authentication/service/authentication.service';
import { Parametro } from 'src/app/core/http/model/Parametro';
import { ResponseContenido } from 'src/app/core/http/model/ResponseContenido';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { Cliente } from 'src/app/Modules/mantenimientos/clientes/models/Cliente';
import { ArticuloPesosExtras } from 'src/app/Modules/produccion/pesaje/models/ArticuloPesosExtras';
import { ArticuloPesosExtrasViewModel } from 'src/app/Modules/produccion/pesaje/models/ArticuloPesosExtrasViewModel';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { ComboBox } from 'src/app/shared/model/ComboBox';
import { DespachoPedidoDetalleViewModel } from '../models/DespachoPedidoDetalleViewModel';
import { DespachoPedidoListadoViewModel } from '../models/DespachoPedidoListadoViewModel';

@Component({
  selector: 'app-despacho-listado',
  templateUrl: './despacho-listado.component.html',
  styleUrls: ['./despacho-listado.component.scss']
})
export class DespachoListadoComponent implements OnInit {


  // COPIAR AL CREAR UN LISTADO NUEVO
  Search: string = "";
  paginaNumeroActual = 1;
  Cargando: boolean = false;
  CargandoBar: boolean = false;
  totalPaginas: number = 0;
  paginaSize: number = 5;
  paginaTotalRecords: number = 0;
  data: DespachoPedidoListadoViewModel[] = [] //tu modelo

  pedidoEmpleadoDetalles: DespachoPedidoDetalleViewModel[];
  loadingPedidoEmpleadoDetalle:boolean;
  estados: ComboBox[] = []
  loadingEstados: boolean;
  pedidoEmpleadoSeleccionado: DespachoPedidoListadoViewModel;
  loadingEstadoAutorizacionCotizacion: boolean = false;
  loadingValidaExistPedidoSinFacturar: boolean = false;


  loadingInfoCliente: boolean;
  clienteExiste=true;
  cliente: Cliente;

  canales:ComboBox[]=[];
  canal:number=0;



// MOVER A OTRO COMPONENTE
loadingArticulosExtras: boolean;
articulosExtrasComboBox: ArticuloPesosExtras[];
articulosExtras: ArticuloPesosExtrasViewModel[];

  constructor(private toastService: ToastrService,
    private httpService: BackendService,
    private modalService: NgbModal,
    private router: Router,

    public permissionsService: NgxPermissionsService,
    private authService: AuthenticationService,
  ) { }


  ngOnInit(): void {
    this.getData();
    this.fillComboCanales();
    this.getArticulosDePesosExtras();
  }
  
  fillComboCanales(){
    this.canales.push({codigo:0,nombre:"Todos",grupo:'',grupoID:''})
    this.canales.push({codigo:1,nombre:"Preventa",grupo:'',grupoID:''})
    this.canales.push({codigo:2,nombre:"Moderno",grupo:'',grupoID:''})
    this.canales.push({codigo:3,nombre:"Empleado",grupo:'',grupoID:''})
    this.canales.push({codigo:4,nombre:"Directo",grupo:'',grupoID:''})
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


  openModal(content, pedidoEmpleado: DespachoPedidoListadoViewModel) {
    this.pedidoEmpleadoDetalles = [];
    this.getPedidoEmpleadoDetalle(pedidoEmpleado.id);
    this.pedidoEmpleadoSeleccionado = pedidoEmpleado;
    this.modalService.open(content, { windowClass: "myCustomModalClass", backdrop: "static", });
  }

  openModalAutorizar(content, pedidoEmpleado: DespachoPedidoListadoViewModel) {
    this.pedidoEmpleadoDetalles = [];
    this.getPedidoEmpleadoDetalle(pedidoEmpleado.id);
    this.pedidoEmpleadoSeleccionado = pedidoEmpleado;
    this.modalService.open(content, { size: 'lg', });
  }

  openModalCancelarPedido(content, pedidoEmpleado: DespachoPedidoListadoViewModel) {
    this.pedidoEmpleadoSeleccionado = pedidoEmpleado;
    this.modalService.open(content, { size: 'lg', });
  }
  getPedidoEmpleadoDetalle(pedidoEmpleadoId: number) {
    this.loadingPedidoEmpleadoDetalle = true;
    this.httpService.DoPostAny<DespachoPedidoDetalleViewModel>(DataApi.Despacho,
      "GetDespachoDetalles", pedidoEmpleadoId).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.pedidoEmpleadoDetalles = response.records;
          this.pedidoEmpleadoDetalles[0].selected=true;
          this.pedidoEmpleadoDetalles[0].estadoId=0;
          this.pedidoEmpleadoDetalles[1].estadoId=1;
          this.pedidoEmpleadoDetalles[2].estadoId=2;


        }
        this.loadingPedidoEmpleadoDetalle = false;
      }, error => {
        this.loadingPedidoEmpleadoDetalle = false;
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
   this.pedidoEmpleadoSeleccionado.loadingCancelPedido=true;
   let pedido={"Id":this.pedidoEmpleadoSeleccionado.id
               ,"EstadoID": 4
               ,"ClienteId":this.pedidoEmpleadoSeleccionado.clienteId
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
        this.pedidoEmpleadoSeleccionado.loadingCancelPedido=false;

      }, error => {
        this.pedidoEmpleadoSeleccionado.loadingCancelPedido=false;

        this.getData()
        this.toastService.error("No se pudo cancelar el pedido", "Error conexion al servidor");
      });

  }
  getClienteByUsuarioID(usuarioId: number) {
    this.Cargando=true;
    this.httpService.DoPostAny<Cliente>(DataApi.Cliente,
      "GetClienteByUsuarioID", usuarioId).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
          this.Cargando=false;
        } else {
          //validar que existe
          if (response != null && response.records != null && response.records.length > 0) {
           
            this.cliente = response.records[0];
            this.cliente.apellidos = this.cliente.apellidos==null?"":this.cliente.apellidos;
            this.clienteExiste=true;
            this.getData()
          } else {
            this.clienteExiste=false;
            this.Cargando=false;
          }
        }

      }, error => {
        this.Cargando=false;
         this.toastService.error("Error conexion al servidor");
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
    this.pedidoEmpleadoDetalles.map(x=>{x.selected=false})
     item.selected=true;
  }
}
