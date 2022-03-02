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
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { ComboBox } from 'src/app/shared/model/ComboBox';
import { PedidoEmpleadoDetalleViewModel } from '../models/PedidoEmpleadoDetalleViewModel';
import { PedidoEmpleadoListadoViewModel } from '../models/PedidoEmpleadoListadoViewModel';


@Component({
  selector: 'app-pedidos-empleado-listado',
  templateUrl: './pedidos-empleado-listado.component.html',
  styleUrls: ['./pedidos-empleado-listado.component.scss']
})
export class PedidosEmpleadosListadoComponent implements OnInit {


  // COPIAR AL CREAR UN LISTADO NUEVO
  Search: string = "";
  paginaNumeroActual = 1;
  Cargando: boolean = false;
  CargandoBar: boolean = false;
  totalPaginas: number = 0;
  paginaSize: number = 5;
  paginaTotalRecords: number = 0;
  data: PedidoEmpleadoListadoViewModel[] = [] //tu modelo

  pedidoEmpleadoDetalles: PedidoEmpleadoDetalleViewModel[];
  loadingPedidoEmpleadoDetalle:boolean;
  estados: ComboBox[] = []
  loadingEstados: boolean;
  pedidoEmpleadoSeleccionado: PedidoEmpleadoListadoViewModel;
  loadingEstadoAutorizacionCotizacion: boolean = false;
  loadingValidaExistPedidoSinFacturar: boolean = false;


  loadingInfoCliente: boolean;
  clienteExiste=true;
  cliente: Cliente;

  constructor(private toastService: ToastrService,
    private httpService: BackendService,
    private modalService: NgbModal,
    private router: Router,

    public permissionsService: NgxPermissionsService,
    private authService: AuthenticationService,
  ) { }


  ngOnInit(): void {
    // this.getEstados()
   this.getClienteByUsuarioID(Number(this.authService.tokenDecoded.nameid))
  /// this.getData();
  }
  getData() {
    this.Cargando = true;

    let parametros: Parametro[] = [{ key: "Search", value: this.Search },
                                    { key: "UsuarioId", value: Number(this.authService.tokenDecoded.nameid) },
  ]

    this.httpService.GetAllWithPagination<PedidoEmpleadoListadoViewModel>(DataApi.PedidosEmpleado,
       "GetPedidosEmpleadoListado", "ID", this.paginaNumeroActual,
      this.paginaSize, false, parametros).subscribe(x => {

        if (x.ok) {
          this.data = x.records;
          console.log( this.data)
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


  openModal(content, pedidoEmpleado: PedidoEmpleadoListadoViewModel) {
    this.pedidoEmpleadoDetalles = [];
    this.getPedidoEmpleadoDetalle(pedidoEmpleado.id);
    this.pedidoEmpleadoSeleccionado = pedidoEmpleado;
    this.modalService.open(content, { size: 'lg', });
  }

  openModalAutorizar(content, pedidoEmpleado: PedidoEmpleadoListadoViewModel) {
    this.pedidoEmpleadoDetalles = [];
    this.getPedidoEmpleadoDetalle(pedidoEmpleado.id);
    this.pedidoEmpleadoSeleccionado = pedidoEmpleado;
    this.modalService.open(content, { size: 'lg', });
  }

  openModalCancelarPedido(content, pedidoEmpleado: PedidoEmpleadoListadoViewModel) {
    this.pedidoEmpleadoSeleccionado = pedidoEmpleado;
    this.modalService.open(content, { size: 'lg', });
  }
  getPedidoEmpleadoDetalle(pedidoEmpleadoId: number) {
    this.loadingPedidoEmpleadoDetalle = true;
    this.httpService.DoPostAny<PedidoEmpleadoDetalleViewModel>(DataApi.PedidosEmpleado,
      "GetPedidosEmpleadoDetalles", pedidoEmpleadoId).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.pedidoEmpleadoDetalles = response.records;
        }
        this.loadingPedidoEmpleadoDetalle = false;
      }, error => {
        this.loadingPedidoEmpleadoDetalle = false;
        this.toastService.error("No se pudo obtener el detalle", "Error conexion al servidor");
      });
  }

  validExistPedidoSinFacturar() {
    this.loadingValidaExistPedidoSinFacturar = true;
    this.httpService.DoPostAny<PedidoEmpleadoDetalleViewModel>(DataApi.PedidosEmpleado,
      "GetExistePedidoSinFacturarEmpleado", Number(this.authService.tokenDecoded.nameid)).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          if(response.valores.length>0){
             if(response.valores[0]>0){
              this.toastService.warning("No puede crear un nuevo pedido");
             }else{
              this.router.navigateByUrl('/ventas/pedidos-empleado/0');
             }
          }else{
            this.router.navigateByUrl('/ventas/pedidos-empleado/0');
          }
        }
        this.loadingValidaExistPedidoSinFacturar = false;
      }, error => {
        this.loadingValidaExistPedidoSinFacturar = false;
        this.toastService.error("No se pudo validar la existencia de pedidos sin facturar", "Error conexion al servidor");
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


  getEstados() {

    this.loadingEstados = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetEstadosCotizacion", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.estados = response.records;
        }
        this.loadingEstados = false;
      }, error => {
        this.loadingEstados = false;
        this.toastService.error("No se pudo obtener los estados", "Error conexion al servidor");

        setTimeout(() => {
          this.getEstados();
        }, 1000);

      });
  }


  cancelarPedidoEmpleado() {
    this.modalService.dismissAll();
   this.pedidoEmpleadoSeleccionado.loadingCancelPedido=true;
   let pedido={"Id":this.pedidoEmpleadoSeleccionado.id
               ,"EstadoID": 4
               ,"ClienteId":this.pedidoEmpleadoSeleccionado.clienteId
              }
              console.log(pedido)
    this.httpService.DoPostAny<ComboBox>(DataApi.PedidosEmpleado,
      "CancelarPedidoEmpleado",  pedido).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
          console.error(response.errores[0]);
        } else {
          this.getData();
          this.toastService.success("Pedido cancelado", "OK");
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


}
