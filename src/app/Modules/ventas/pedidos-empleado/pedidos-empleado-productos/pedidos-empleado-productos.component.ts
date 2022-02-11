import { AfterViewInit, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'src/app/core/authentication/service/authentication.service';
import { BackendService } from 'src/app/core/http/service/backend.service';

@Component({
  selector: 'app-pedidos-empleado-productos',
  templateUrl: './pedidos-empleado-productos.component.html',
  styleUrls: ['./pedidos-empleado-productos.component.scss']
})
export class PedidosEmpleadoProductosComponent implements OnInit {
  public config: PerfectScrollbarConfigInterface = {};
  @Output() articulosToAdd = new EventEmitter();
  articulos =[
    {
    id: 1,
    nombre: "100002 | Salami Super Especial Nut. 1/1 De 2.2 Lbs	 ",
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


}









