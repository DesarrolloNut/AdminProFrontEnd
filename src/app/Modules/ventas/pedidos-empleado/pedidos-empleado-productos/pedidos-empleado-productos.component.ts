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
  articulos: ArticuloListaPrecioViewModel[];

  filter: string;
  articuloss =[
    {
    id: 1,
    nombre: "100002 | Salami Super Especial Nut. 1/1 De 2.2 Lbs",
    precio:400.00,
    urlImage:'http://nutriciosa.com/wp-content/uploads/2018/07/salami-nutriciosa.jpg',

    count:2
  },
  {
    id: 2,
    nombre: "Carnes",
    urlImage:'http://nutriciosa.com/wp-content/uploads/2018/07/jamoneta-img.jpg',
    precio:400.00,
    count:0
  },
  {
    id: 3,
    nombre: "Camisa",
    urlImage:'https://i.ibb.co/QQsJGXR/Captura.png',
    precio:400.00,
    count:0
  },
  {
    id: 4,
    nombre: "Laptop dell",
    precio:20000.00,
    count:0
  },
  {
    id: 5,
    nombre: "Jugo de Tamarindo",
    precio:400.00,
    count:2
  },
  {
    id: 6,
    nombre: "Carnes",
    precio:400.00,
    count:0
  },
  {
    id: 7,
    nombre: "Camisa",
    precio:400.00,
    count:0
  },
  {
    id: 8,
    nombre: "Laptop dell",
    precio:20000.00,
    count:0
  },
];

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
    this.getArticulosPrecioActual();
  }
  public onScrollEvent(event: any): void {
    // console.log(event);
   }

   addProductVenta(articulo:any){
    articulo.count++;
    articulo.totalCantidad_por_precio= articulo.count* articulo.precio;
   this.onAddArticuloToVenta(this.articuloss.filter(x=>x.count>0));
  }


  onAddArticuloToVenta(as:any[]) {
    this.articulosToAdd.emit(as);
  }

  getArticulosPrecioActual() {

    this.httpService.DoPostAny<ArticuloListaPrecioViewModel>(DataApi.Articulo,
      "GetArticulosPrecioActual", this.listaPrecioId).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          //validar que existe
          if (response != null && response.records != null && response.records.length > 0) {
            this.articulos= response.records
            console.log(  this.articulos)
          } else {
            this.toastService.warning("La lista del cliente no tiene artículos");
          }
        }

      }, error => {
        this.loadingArticulos = false;
        this.toastService.error("Error conexion al servidor");
      });
  }

  public getSantizeUrl(url : string) {
  if(url!=null){
    return this.sanitizer.bypassSecurityTrustStyle('url(' +url + ')');
  }
  }
}









