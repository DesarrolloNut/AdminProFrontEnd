import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxPermissionsService } from 'ngx-permissions';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'src/app/core/authentication/service/authentication.service';
import { Parametro } from 'src/app/core/http/model/Parametro';
import { ResponseContenido } from 'src/app/core/http/model/ResponseContenido';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { Articulo, ArticuloListadoViewModel } from 'src/app/Modules/servicios/recepcion/models/Articulo';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { ComboBox } from 'src/app/shared/model/ComboBox';

@Component({
  selector: 'app-articulo-listado',
  templateUrl: './articulo-listado.component.html',
  styleUrls: ['./articulo-listado.component.scss']
})
export class ArticuloListadoComponent implements OnInit {


  // COPIAR AL CREAR UN LISTADO NUEVO
  Search: string = "";
  paginaNumeroActual = 1;
  Cargando: boolean = false;
  CargandoBar: boolean = false;
  totalPaginas: number = 0;
  paginaSize: number = 5;
  paginaTotalRecords: number = 0;
  data: ArticuloListadoViewModel[] = [] //tu modelo


  listaPreciosEnrroladosArticulo: any[] = []
  loadinglistaPreciosEnrroladosArticulo: boolean;
  loadingClientes: boolean;

  constructor(private toastService: ToastrService,
    private httpService: BackendService,
    private modalService: NgbModal,
    private authService: AuthenticationService,
    public permissionsService: NgxPermissionsService,
  ) { }


  ngOnInit(): void {
    this.getData()
  }
  getData() {
    this.Cargando = true;

    let parametros: Parametro[] = [{ key: "Search", value: this.Search }]

    this.httpService.GetAllWithPagination<ArticuloListadoViewModel>(DataApi.Articulo, "GetArticuloListado", "id", this.paginaNumeroActual,
      this.paginaSize, false, parametros).subscribe(x => {
      console.log(x)
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

  getListaPreciosEnrroladasArticulo(articulo:Articulo) {
  let parametros = { "ArticuloID": articulo.id, "ListaPrecioID":0 }

    this.loadinglistaPreciosEnrroladosArticulo = true;
    this.httpService.DoPostAny<any>(DataApi.Articulo,
      "GetListaPreciosEnrroladasArticulo", parametros).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
           this.listaPreciosEnrroladosArticulo = response.records;
           console.log(response.records)

        }
        this.loadinglistaPreciosEnrroladosArticulo = false;
      }, error => {
        this.loadinglistaPreciosEnrroladosArticulo = false;
        this.toastService.error("No se pudo obtener las listas de precios", "Error conexion al servidor");
      });
  }

openModal(content,articulo){
  this.getListaPreciosEnrroladasArticulo(articulo)
  this.modalService.open(content,{size:'lg'})

}



}
