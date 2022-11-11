import { Component, OnInit } from '@angular/core';
import { TagListadoViewModel } from '../models/TagListadoViewModel';
import { ToastrService } from 'ngx-toastr';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { NgxPermissionsService } from 'ngx-permissions';
import { Parametro } from 'src/app/core/http/model/Parametro';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { ResponseContenido } from 'src/app/core/http/model/ResponseContenido';

@Component({
  selector: 'app-tags-listado',
  templateUrl: './tags-listado.component.html',
  styleUrls: ['./tags-listado.component.scss']
})
export class TagsListadoComponent implements OnInit {
// COPIAR AL CREAR UN LISTADO NUEVO
Search: string = "";
paginaNumeroActual = 1;
Cargando: boolean = false;
totalPaginas: number = 0;
paginaSize: number = 5;
paginaTotalRecords: number = 0;
data: TagListadoViewModel[] = [] //tu modelo

constructor(private toastService: ToastrService,
  private httpService: BackendService,
  public permissionsService: NgxPermissionsService,
) { }


ngOnInit(): void {
  this.getData()
}
getData() {
  this.Cargando = true;

  let parametros: Parametro[] = [{ key: "Search", value: this.Search }]

  this.httpService.GetAllWithPagination<TagListadoViewModel>(DataApi.Tag, "GetTagListado", "NOMBRE", this.paginaNumeroActual,
    this.paginaSize, true, parametros).subscribe(x => {

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
}
