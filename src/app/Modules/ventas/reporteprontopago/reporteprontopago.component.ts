import { Component, OnInit } from '@angular/core';
import { NgxPermissionsService } from 'ngx-permissions';
import { ToastrService } from 'ngx-toastr';
import { Parametro } from 'src/app/core/http/model/Parametro';
import { ResponseContenido } from 'src/app/core/http/model/ResponseContenido';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { ReporteProntoPago } from './models/ReporteProntoPago';

@Component({
  selector: 'app-reporteprontopago',
  templateUrl: './reporteprontopago.component.html',
  styleUrls: ['./reporteprontopago.component.scss']
})
export class ReporteprontopagoComponent implements OnInit {

// COPIAR AL CREAR UN LISTADO NUEVO
Search: string = "";
desde: string = [new Date().getFullYear(), (new Date().getMonth() + 1), new Date().getDate()].join('-');
hasta: string = [new Date().getFullYear(), (new Date().getMonth() + 1), new Date().getDate()].join('-');
paginaNumeroActual = 1;
Cargando: boolean = false;
CargandoBar: boolean = false;
totalPaginas: number = 0;
paginaSize: number = 5;
paginaTotalRecords: number = 0;
data: ReporteProntoPago[] = [] //tu modelo

constructor(private toastService: ToastrService,
  private httpService: BackendService,
  public permissionsService: NgxPermissionsService,
) { }


ngOnInit(): void {
  this.getData()
}
getData() {
  this.Cargando = true;

  let parametros: Parametro[] = [{ key: "desde", value: this.desde },{ key: "hasta", value: this.hasta },]

  this.httpService.GetAllWithPagination<ReporteProntoPago>(DataApi.ReporteProntoPago, "GetReporteProntoPagoListado", "ID", this.paginaNumeroActual,
    this.paginaSize, true, parametros).subscribe(x => {

      if (x.ok) {
        this.data = x.records;
        console.log(x.records);
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
