import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
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

@Component({
  selector: 'app-pedidos-empleado-productos',
  templateUrl: './pedidos-empleado-productos.component.html',
  styleUrls: ['./pedidos-empleado-productos.component.scss']
})
export class PedidosEmpleadoProductosComponent implements OnInit {
  public config: PerfectScrollbarConfigInterface = {};
  @Input() listaPrecioId = 0;


  @Output() articulosToAdd = new EventEmitter();

  loadingArticulos: boolean;
  @Input() articulos: ArticuloListaPrecioViewModel[] = [];
  artDetalleSeleccionado: ArticuloListaPrecioViewModel;

  filter: string;


  constructor(
    private toastService: ToastrService,
    private httpService: BackendService,
    private router: Router,
    private route: ActivatedRoute,
    private modalService: NgbModal,
    private authService: AuthenticationService,
    private sanitizer: DomSanitizer
    // private logger: NGXLogger,
  ) { }

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
  public onScrollEvent(event: any): void {
    // console.log(event);
   }

   addProductVenta(articulo:any){
    articulo.count++;
    articulo.totalCantidad_por_precio= articulo.count* articulo.precio;
   this.onAddArticuloToVenta(this.articulos.filter(x=>x.count>0));
  }


  onAddArticuloToVenta(as:any[]) {
    this.articulosToAdd.emit(as);
  }


  public getSantizeUrl(url : string) {
  if(url!=null){
    return this.sanitizer.bypassSecurityTrustStyle('url(' +url + ')');
  }
  }

  openModalDetalle(content, item: ArticuloListaPrecioViewModel) {
    if(item.count==undefined){item.count=1}
    this.modalService.open(content, { size: 'lg' ,centered:true});
    this.artDetalleSeleccionado = item;
    console.log(this.artDetalleSeleccionado)
  }
  AddOrRemoveCantArticulo(a:ArticuloListaPrecioViewModel,restaOsuma:number){
    if(restaOsuma>0){a.count++}
    else{
      if(a.count>1){a.count--}
    }
  }

  addToCart(a:ArticuloListaPrecioViewModel){
   a.cartAdded=true;
  }
}









