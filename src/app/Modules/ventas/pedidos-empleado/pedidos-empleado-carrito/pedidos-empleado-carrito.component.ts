import { Cliente, ClientePedidoEmpleadoVM } from './../../../mantenimientos/clientes/models/Cliente';
import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'src/app/core/authentication/service/authentication.service';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { ArticuloListaPrecioViewModel } from 'src/app/Modules/mantenimientos/articulos/models/ArticuloListaPrecioViewModel';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { CartService } from '../cart.service';
import { PedidoEmpleado } from '../models/PedidoEmpleado';
import { PedidoEmpleadoDetalle, PedidoEmpleadoRequest } from '../models/PedidoEmpleadoDetalle';

@Component({
  selector: 'app-pedidos-empleado-carrito',
  templateUrl: './pedidos-empleado-carrito.component.html',
  styleUrls: ['./pedidos-empleado-carrito.component.scss']
})
export class PedidosEmpleadoCarritoComponent implements OnInit {
  public config: PerfectScrollbarConfigInterface = {};
  carrito: ArticuloListaPrecioViewModel[] = [];
  @Output() articulosInCart = new EventEmitter<ArticuloListaPrecioViewModel[]>();
  @Output() pedidoSendToCreate = new EventEmitter<PedidoEmpleadoRequest>();

  @Input() clienteInfo = new ClientePedidoEmpleadoVM()
  @Input() ITBIS: number = 0;
  pedidoEmpleado: PedidoEmpleado = new PedidoEmpleado();
  pedidoEmpleadoDetalles: PedidoEmpleadoDetalle[] = [];
  confirmPedidoModal: NgbModalRef;


  btnCrearCargando = false;
  actualizando = false;

  constructor(
    private toastService: ToastrService,
    private httpService: BackendService,
    private router: Router,
    public cartService: CartService,
    private modalService: NgbModal,
    private authService: AuthenticationService,
    // private logger: NGXLogger,
  ) { }

  ngOnInit(): void {

    this.cartService.loadCart();
    this.carrito = [...this.cartService.getItems()];
   console.log(this.clienteInfo)
    this.fillPedidoEmpleado();
    this.fillPedidoEmpleadoDetalleModel();


  }

  fillPedidoEmpleadoDetalleModel(){

    this.carrito.forEach(x=>{
      this.pedidoEmpleadoDetalles.push(
        {
         id:0,
         cotizacionId:0,
         articuloId:x.id,
         codigoReferencia:x.codigoReferencia,
         nombre:x.nombre,
         imagenUrl:x.imagenUrl,
         almacenId:0,
         cantidad:x.cant,
         peso:x.peso,
         unidadMedida:x.unidadMedida,
         costo:x.costo,
         precio:x.precioActual,
         subtotal:0,
         porcientoDescuento:0,
         totalDescuento:0,
         totalImpuesto:0,
         totalNeto:0
       })
   });
   this.calcularTotales();
  }
  fillPedidoEmpleado(){
   this.pedidoEmpleado.clienteId = this.clienteInfo.id;
   this.pedidoEmpleado.rutaId= this.clienteInfo.rutaId;
   this.pedidoEmpleado.listaPrecioID= this.clienteInfo.listaPrecioId;
   this.pedidoEmpleado.condicionPagoId= this.clienteInfo.condicionPagoId;
   this.pedidoEmpleado.tasa =this.ITBIS;
   this.pedidoEmpleado.pedidoTipo=1;
   this.pedidoEmpleado.fechaEntrega= new Date();
   this.pedidoEmpleado.plazoId=this.clienteInfo.plazoId;
   this.pedidoEmpleado.monedaId=1;
  }

  removeArtFromCart(i:PedidoEmpleadoDetalle){
    this.cartService.removeItem(i.articuloId)
  //  this.carrito= this.carrito = [...this.cartService.getItems()];
    const index = this.pedidoEmpleadoDetalles.findIndex(o => o.articuloId === i.articuloId);

    if (index > -1) {
    this.pedidoEmpleadoDetalles.splice(index, 1)
    this.articulosInCart.emit( this.carrito)
    }
    this.calcularTotales();
  }
  removeALLFromCart(){
  this.cartService.clearCart([]);
  }

changeCant(item:PedidoEmpleadoDetalle){

  this.cartService.setItemInCart(item.articuloId,item.cantidad)
  this.calcularTotales();

}



calcularTotales() {
  this.limpiarTotales()

  this.pedidoEmpleadoDetalles.forEach(x => {

    x.cantidadCalculada= x.cantidad;
    if(x.unidadMedida=='LBS'){
      x.cantidadCalculada= x.cantidad * x.peso;
    }

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

  //RECUERDA AGREGAR EL ITBIS DESDE LA BASE DE DATOS
  // this.cliente.balance= this.cliente.limiteCredito;
  // this.cliente.balance=(this.cliente.balance- this.pedidoEmpleado.totalNeto);

  // if(this.cliente.balance<0){
  //  this.limitExceeded=true;
  //  return;
  // }
  // this.limitExceeded=false;
}

limpiarTotales() {
  this.pedidoEmpleado.subtotal = 0;
  this.pedidoEmpleado.descuentoTotal = 0;
  this.pedidoEmpleado.impuestoTotal = 0;
  this.pedidoEmpleado.totalNeto = 0;
  this.pedidoEmpleado.costoTotal = 0;
}

onSubmit() {

  if(( this.clienteInfo.limiteCredito-this.pedidoEmpleado.totalNeto)<0 ){
   this.toastService.warning("Este pedido esta excediendo el limite de credito");
  return ;
}
 if (!this.pedidoEmpleado.rutaId || this.pedidoEmpleado.rutaId < 1) {
   this.toastService.warning("Usted no cuenta con una ruta de venta")
   return;
 }

 if (this.pedidoEmpleado.monedaId < 1) {
   this.toastService.warning("Selecciona una moneda")
   return;
 }

 if (!this.pedidoEmpleadoDetalles.some(x => x.articuloId > 0)) {
   this.toastService.warning("No puedes hacer una pedido  sin artículos")
   return;
 }

 if (this.pedidoEmpleadoDetalles.filter(x => x.articuloId > 0)
   .some(x => !x.cantidad || x.cantidad <= 0 || !x.precio || x.precio <= 0)) {
   this.toastService.warning("Artículos con datos incompletos, revisa precios y cantidades.")
   return;
 }

 this.crearPedido();
}



crearPedido(){
  this.closeConfirmPedidoModal();
  this.pedidoSendToCreate.emit({pedido:this.pedidoEmpleado,pedidoDetalles:this.pedidoEmpleadoDetalles})

}
openConfirmPedidoModal(content) {
  this.confirmPedidoModal= this.modalService.open(content,{centered:true});
}

closeConfirmPedidoModal(){
  this.confirmPedidoModal.close();
}
}


