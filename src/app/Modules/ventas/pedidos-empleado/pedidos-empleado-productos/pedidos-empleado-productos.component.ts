import { animate, state, style, transition, trigger } from '@angular/animations';
import { AfterContentInit, AfterViewInit, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'src/app/core/authentication/service/authentication.service';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { ArticuloListaPrecioViewModel } from 'src/app/Modules/mantenimientos/articulos/models/ArticuloListaPrecioViewModel';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { CartService } from '../cart.service';

@Component({
  selector: 'app-pedidos-empleado-productos',
  templateUrl: './pedidos-empleado-productos.component.html',
  styleUrls: ['./pedidos-empleado-productos.component.scss']

})
export class PedidosEmpleadoProductosComponent implements OnInit,OnChanges {
  public config: PerfectScrollbarConfigInterface = {};
  @Input() listaPrecioId = 0;


  loadingArticulos: boolean;
  @Input() articulos: ArticuloListaPrecioViewModel[] = [];
  @Output() articulosInCart = new EventEmitter<ArticuloListaPrecioViewModel[]>();

  artDetalleSeleccionado: ArticuloListaPrecioViewModel;

  filter: string;

  carrito: ArticuloListaPrecioViewModel[] = [];


  constructor(
    private toastService: ToastrService,
    private httpService: BackendService,
    private router: Router,
    private route: ActivatedRoute,
    public cartService: CartService,
    private modalService: NgbModal,
    private authService: AuthenticationService,
    private sanitizer: DomSanitizer
    // private logger: NGXLogger,
  ) { }
  ngOnChanges(changes: SimpleChanges): void {
    if(changes.articulos.currentValue!=undefined){
      this.loadArtFromCarrito()
    }

  }

  ngOnInit(): void {

    // this.logger.log("catName : " + this.catName + '\n' + "cmsID : " + this.cmsID);

    // let id = Number(this.route.snapshot.paramMap.get('id'));
    // this.idPedidoEmpleadoByRouter=id;
    // if (id > 0) {
    //   this.getCotizacion(id);
    //   this.actualizando = true;
    // }else{
    //   this.getClienteByUsuarioID(Number(this.authService.tokenDecoded.nameid));
    // }

    // this.getUsuarioByID(Number(this.authService.tokenDecoded.nameid));
    // this.getITBIS()

    // this.getTipoCondicionPago()
    // this.getMonedaTipos()
    // this.getVendedores()

   // this.getArticulosPrecioActual();
  }


  loadArtFromCarrito(){
   this.cartService.loadCart();
   this.carrito=this.cartService.getItems();

   this.articulos.map(m=>m.cant=0);

    if(this.carrito.length>0){
      this.carrito.forEach(c=>{
        this.articulos.filter(x=>x.codigoReferencia ==c.codigoReferencia).map(m=>m.cant=c.cant)
       })
        this.articulos.sort((a, b) =>  b.cant - a.cant );

    }

  }
  public onScrollEvent(event: any): void {
    // console.log(event);
   }






  public getSantizeUrl(url : string) {
  if(url!=null){
    return this.sanitizer.bypassSecurityTrustStyle('url(' +url + ')');
  }
  }

  openModalDetalle(content, item: ArticuloListaPrecioViewModel) {
    console.log(item)

    this.modalService.open(content, { size: 'lg' ,centered:true,windowClass: "detalle_articulo",});
    this.artDetalleSeleccionado = item;
  }
  AddOrRemoveCantArticulo(a:ArticuloListaPrecioViewModel,restaOsuma:number){
    if(restaOsuma>0){a.cant++}
    else{
      if(a.cant>1){a.cant--}
    }
  }



  addToCart(a:ArticuloListaPrecioViewModel) {

    if (!this.cartService.itemInCart(a)) {
      a.cant = 1;
      this.cartService.addToCart(a); //add items in cart
      this.carrito = [...this.cartService.getItems()];
    }
     this.articulosInCart.emit(this.carrito)

    this.toastService.success("Añadido al carrito")
  }

}









