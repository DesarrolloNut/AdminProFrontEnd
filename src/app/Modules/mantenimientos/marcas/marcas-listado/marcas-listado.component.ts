import { Component, OnInit } from '@angular/core';
import { ResponseContenido } from 'src/app/core/http/model/ResponseContenido';
import { Marca } from '../models/Marca';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { ToastrService } from 'ngx-toastr';
import { NgxPermissionsService } from 'ngx-permissions';
import { Parametro } from 'src/app/core/http/model/Parametro';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';

@Component({
  selector: 'app-marcas-listado',
  templateUrl: './marcas-listado.component.html',
  styleUrls: ['./marcas-listado.component.scss']
})
export class MarcasListadoComponent implements OnInit {

  // COPIAR AL CREAR UN LISTADO NUEVO
  Search: string = "";
  paginaNumeroActual = 1;
  Cargando: boolean = false;
  CargandoBar: boolean = false;
  totalPaginas: number = 0;
  paginaSize: number = 5;
  paginaTotalRecords: number = 0;
  arrayLoading = new Array(this.paginaSize);
  marcas: Marca[] = [] //tu modelo

  constructor(private toastService: ToastrService,
    private httpService: BackendService,
    public permissionsService: NgxPermissionsService,
  ) { }


  ngOnInit(): void {
    this.getMarcas()
  }
  getMarcas() {
    this.Cargando = true;

    let parametros: Parametro[] = [{ key: "Search", value: this.Search }]

    this.httpService.GetAllWithPagination<Marca>(DataApi.Marca, "GetMarcaListado", "ID", this.paginaNumeroActual,
      this.paginaSize, true, parametros).subscribe(x => {

        if (x.ok) {
          this.marcas = x.records;
          this.asignarPagination(x);
        } else {
          this.toastService.error(x.errores[0]);
          console.error(x.errores[0]);
        }
        this.arrayLoading = new Array(0);
        this.Cargando = false;
      }, error => {
        console.error(error);
        this.toastService.error("Error conexion al servidor");
        this.Cargando = false;
        this.arrayLoading = new Array(0);
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


}
