import { PedidoEmpleadoRequest } from './../models/PedidoEmpleadoDetalle';
import { animate, style, transition, trigger } from '@angular/animations';
import { AfterViewInit, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'src/app/core/authentication/service/authentication.service';
import { Parametro } from 'src/app/core/http/model/Parametro';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { ArticuloBalanceViewModel } from 'src/app/Modules/mantenimientos/articulos/models/ArticuloBalanceViewModel';
import { ArticuloListaPrecioViewModel } from 'src/app/Modules/mantenimientos/articulos/models/ArticuloListaPrecioViewModel';
import { Cliente, ClientePedidoEmpleadoVM } from 'src/app/Modules/mantenimientos/clientes/models/Cliente';
import { ListaPrecio } from 'src/app/Modules/mantenimientos/listaPrecios/models/ListaPrecio';
import { Usuario } from 'src/app/Modules/servicios/recepcion/models/Usuario';
import { Configuraciones } from 'src/app/shared/enums/Configuraciones';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { EstadosGeneralesKeyEnum } from 'src/app/shared/enums/EstadosGeneralesKeyEnum';
import { ComboBox } from 'src/app/shared/model/ComboBox';
import { CartService } from '../cart.service';
import { PedidoEmpleado } from '../models/PedidoEmpleado';
import { PedidoEmpleadoDetalle } from '../models/PedidoEmpleadoDetalle';
import { PedidoEmpleadoDetalleViewModel } from '../models/PedidoEmpleadoDetalleViewModel';

@Component({
  selector: 'app-pedidos-empleado-formulario',
  templateUrl: './pedidos-empleado-formulario.component.html',
  styleUrls: ['./pedidos-empleado-formulario.component.scss'],
  animations: [
    trigger('onProductos', [
      transition(':enter', [style({
        opacity: 0,
        transform: 'translateX(-100%)'
      }),
      animate(400)
    ])
    ]),
    trigger('onCarrito', [
      transition(':enter', [style({
        opacity: 0,
        transform: 'translateX(100%)'
      }),
      animate(400)
    ])
    ]),
 ]
})
export class PedidosEmpleadoFormularioComponent implements OnInit {


  articulosInCart: ArticuloListaPrecioViewModel[] = [] //tu modelo






  Cargando: boolean = false;
  btnGuardarCargando = false;
  limitExceeded = false;

  actualizando = false;
  loadingClientes: boolean;
  clientes: ComboBox[];
  cliente: ClientePedidoEmpleadoVM;
  loadingArticulosCombobox: boolean;
  articulosData: ArticuloListaPrecioViewModel[];
  listaPrecio: ListaPrecio;

  loadingCondicionPagos: boolean;
  TipoCondicionPagos: ComboBox[];
  Plazos: ComboBox[];


  loadingMonedaTipos: boolean;
  monedaTipos: ComboBox[];

  loadingAlmacenes: boolean;
  almacenes: ComboBox[] =null;

  vendedores: ComboBox[];
  loadingVendedores: boolean;

  usuario: Usuario;
  ITBIS: number = 0;

  pedidoEmpleado: PedidoEmpleado = new PedidoEmpleado();
  pedidoEmpleadoDetalles: PedidoEmpleadoDetalle[] = [];

  loadingArticuloBalance: boolean;
  articuloBalance: ArticuloBalanceViewModel[];
  totalCantidadExistencia: number;
  loadingPedidoEmpleadoDetalle: boolean;
  loadingInfoCliente: boolean;
  clienteExiste=true;
  balanceEmpleado:number;
  idPedidoEmpleadoByRouter:number;


  btnCrearCargando = true;



  showView='products';
  constructor(
    private toastService: ToastrService,
    private httpService: BackendService,
    private router: Router,
    private route: ActivatedRoute,
    public cartService: CartService,

    private modalService: NgbModal,
    private authService: AuthenticationService,
    // private logger: NGXLogger,
  ) { }

  ngOnInit(): void {

    // let id = Number(this.route.snapshot.paramMap.get('id'));
    // this.idPedidoEmpleadoByRouter=id;
    // if (id > 0) {
    //   this.getCotizacion(id);
    //   this.actualizando = true;
    // }else{
    //   this.getClienteByUsuarioID(Number(this.authService.tokenDecoded.nameid));
    // }

    //   this.getClienteByUsuarioID(Number(this.authService.tokenDecoded.nameid));

     this.getAllPedidoEmpleado();

    // this.getTipoCondicionPago()
    // this.getMonedaTipos()
    // this.getVendedores()
  }


  async getAllPedidoEmpleado(){
    this.loadingInfoCliente = true;
    await this.getTipoCondicionPago();
    await this.getITBIS()
    await this.getClienteByUsuarioID(Number(this.authService.tokenDecoded.nameid));

    this.getArticulosInCart();
  }

  async getPlazos(clienteTipo)  {
    let parametros: Parametro[] = [{ key: "clienteTipoId", value: clienteTipo }]

   await this.httpService.DoPostAnyAsync<ComboBox>(DataApi.ComboBox,
      "GetPlazosComboBoxByTipoCliente", parametros[0]).then(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.Plazos = response.records;
        }
      }, error => {
        this.toastService.error("No se pudo obtener los plazos", "Error conexion al servidor");
        setTimeout(() => {
          this.getPlazos(clienteTipo)
        }, 1000);

      });
  }
  async getTipoCondicionPago()  {
    this.loadingCondicionPagos = true;
   await this.httpService.DoPostAnyAsync<ComboBox>(DataApi.ComboBox,
      "GetTipoCondicionPago", {}).then(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.TipoCondicionPagos = response.records;

        }
        console.log( this.TipoCondicionPagos)
        this.loadingCondicionPagos = false;
      }, error => {
        this.loadingCondicionPagos = false;
        this.toastService.error("No se pudo obtener las condiciones de pago", "Error conexion al servidor");

        setTimeout(() => {
          this.getTipoCondicionPago();
        }, 1000);

      });
  }
  getUsuarioByID(usuarioID: number) {
    //this.Cargando = true;
    this.httpService.DoPostAny<Usuario>(DataApi.Usuario,
      "GetUsuarioByID", usuarioID).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          //validar que existe
          if (response != null && response.records != null && response.records.length > 0) {

            this.usuario = response.records[0];

          } else {
            this.toastService.warning("Usuario no encontrado");
            this.router.navigateByUrl('/ventas/pedidos-empleado');
          }
        }

      }, error => {
      //  this.Cargando = false;
        this.toastService.error("Error conexion al servidor");
      });
  }



  async getClienteByUsuarioID(usuarioId: number) {

    this.loadingInfoCliente = true;
     await this.httpService.DoPostAnyAsync<ClientePedidoEmpleadoVM>(DataApi.Cliente,
      "GetClienteByUsuarioID", usuarioId).then(async response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          //validar que existe
          if (response != null && response.records != null && response.records.length > 0) {
            let c =   response.records[0];
            await  this.getPlazos(c.clienteTipoID)

            c.condicionPago = this.TipoCondicionPagos.find(x=>x.codigo==c.condicionPagoId)?.nombre;
            c.plazo = this.Plazos.find(x=>x.codigo==c.plazoId)?.nombre;

            this.cliente = response.records[0];
            this.clienteExiste=true;
            this.cliente.apellidos = this.cliente.apellidos==null?"":this.cliente.apellidos;
            this.pedidoEmpleado.clienteId=this.cliente.id;
            this.balanceEmpleado = this.cliente.balance;
            console.log(this.cliente);
            this.getArticulosPrecioActual()

            setTimeout(() => {
            this.loadingInfoCliente = false;

            }, 200);
          } else {
            this.clienteExiste=false;
            this.loadingInfoCliente = false;
            this.router.navigateByUrl('ventas/pedidos-empleado');
            this.modalService.dismissAll();
            this.toastService.warning("Cliente no encontrado");
          }
        }

      }, error => {
        this.loadingInfoCliente = false;
        this.toastService.error("Error conexion al servidor");
      });
  }




  getArticulosPrecioActual() {
    this.httpService.DoPostAny<ArticuloListaPrecioViewModel>(DataApi.Articulo,
      "GetArticulosPrecioActualV2", this.cliente.listaPrecioId).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          //validar que existe
          if (response != null && response.records != null && response.records.length > 0) {
            response.records.forEach(x=>{
              if(x.unidadMedida=='LBS'){
                 x.precioActual= x.precioActual * x.peso;
              }
            })
            this.articulosData = response.records;
          } else {
            this.toastService.warning("La lista del cliente no tiene artículos");
          }
        }

      }, error => {
        this.Cargando = false;
        this.toastService.error("Error conexion al servidor");
      });
  }



  calcularTotales() {
    this.limpiarTotales()

    this.pedidoEmpleadoDetalles.forEach(x => {
      x.subtotal = x.cantidad && x.articuloId ? (x.precio * x.cantidad) : 0;
      x.totalDescuento = x.porcientoDescuento ? (x.subtotal * x.porcientoDescuento / 100) : 0;
      x.totalImpuesto = (x.subtotal - x.totalDescuento) * (this.ITBIS / 100);
      x.totalNeto = x.subtotal - x.totalDescuento + x.totalImpuesto;

      this.pedidoEmpleado.descuentoTotal += x.totalDescuento;
      this.pedidoEmpleado.subtotal += x.subtotal;
      this.pedidoEmpleado.costoTotal += x.cantidad && x.costo ? (x.costo * x.cantidad) : 0;
    })
    this.pedidoEmpleado.totalNeto = this.pedidoEmpleado.subtotal - this.pedidoEmpleado.descuentoTotal;
    this.pedidoEmpleado.impuestoTotal = this.pedidoEmpleado.totalNeto * (this.ITBIS / 100);
    this.pedidoEmpleado.totalNeto += this.pedidoEmpleado.impuestoTotal;
    this.cliente.balance= this.cliente.limiteCredito;
    this.cliente.balance=(this.cliente.balance- this.pedidoEmpleado.totalNeto);

    if(this.cliente.balance<0){
     this.limitExceeded=true;
     return;
    }
    this.limitExceeded=false;
  }

  limpiarTotales() {
    this.pedidoEmpleado.subtotal = 0;
    this.pedidoEmpleado.descuentoTotal = 0;
    this.pedidoEmpleado.impuestoTotal = 0;
    this.pedidoEmpleado.totalNeto = 0;
    this.pedidoEmpleado.costoTotal = 0;
  }


  async getITBIS() {
  await  this.httpService.DoPostAnyAsync<any>(DataApi.Configuracion,
      "GetConfiguracionValor", Number(Configuraciones.IMPUESTO_PORCIENTO)).then(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {

          if (response.records.length == 0 || response.records[0] < 1) {
            this.toastService.error("No hay impuesto configurado");
          } else {
            this.ITBIS = Number(response.records[0]);
          }
        }
      }, error => {
        this.toastService.error("No se pudo  el ITBIS", "Error conexion al servidor");

        setTimeout(() => {
          this.getITBIS();
        }, 1000);

      });
  }


  getArticuloBalanceAlmacenes(articuloID: number) {
    this.loadingArticuloBalance = true;
    this.httpService.DoPostAny<ArticuloBalanceViewModel>(DataApi.Articulo,
      "GetArticuloBalanceAlmacenes", articuloID).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.articuloBalance = response.records;
          this.totalCantidadExistencia = 0;

          if (this.articuloBalance) {
            this.articuloBalance.forEach(ab => this.totalCantidadExistencia += ab.existencia)
          }
        }
        this.loadingArticuloBalance = false;
      }, error => {
        this.loadingArticuloBalance = false;
        this.toastService.error("No se pudo obtener la existencia", "Error conexion al servidor");
      });
  }



  closeModal(){
    this.router.navigateByUrl('ventas/pedidos-empleado');
    this.modalService.dismissAll();
  }



  beforeCrearPedido(pedido:PedidoEmpleadoRequest){
   this.crearPedido(pedido.pedido,pedido.pedidoDetalles)
  }

  crearPedido(pedido:PedidoEmpleado,pedidoDetalle:PedidoEmpleadoDetalle[]){
    this.btnCrearCargando = true;
    this.changeView('creandoPedido')

   this.pedidoEmpleado=pedido;
   this.pedidoEmpleadoDetalles=pedidoDetalle;

    let metodo: string = this.actualizando ? "Update" : "Registrar";

    this.pedidoEmpleado.sucursalId = Number(this.authService.tokenDecoded.groupsid)
    this.pedidoEmpleado.usuarioId = Number(this.authService.tokenDecoded.nameid)

    let parametro: any = {
      "PedidoEmpleado": this.pedidoEmpleado,
      "PedidoEmpleadoDetalles": this.pedidoEmpleadoDetalles.filter(x => x.articuloId > 0 && x.cantidad > 0 && x.precio > 0)
    }


    this.httpService.DoPostAny<any>(DataApi.PedidosEmpleado,
      metodo, parametro).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0], "Error");
          this.changeView('cart')

        } else {
          this.toastService.success("Realizado", "OK");
          this.cartService.clearCart();
          this.articulosInCart=[];
        //  this.modalService.dismissAll();
        // this.router.navigateByUrl('/ventas/pedidos-empleado');

        }
        setTimeout(() => {
        this.btnCrearCargando = false;
        }, 1500);
      }, error => {
        this.btnCrearCargando = false;
        this.toastService.error("Error conexion al servidor");
        this.changeView('cart')
      });
  }

 changeView(keyView){
   this.showView=keyView;
 }

 refreshCart(){
  this.articulosInCart=this.cartService.getItems();
}


getArticulosInCart(){
  this.cartService.loadCart();
  this.articulosInCart= this.cartService.getItems();
}

}









