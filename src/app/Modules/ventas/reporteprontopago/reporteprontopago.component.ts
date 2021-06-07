import { Component, OnInit } from '@angular/core';
import { NgxPermissionsService } from 'ngx-permissions';
import { ToastrService } from 'ngx-toastr';
import { Parametro } from 'src/app/core/http/model/Parametro';
import { ResponseContenido } from 'src/app/core/http/model/ResponseContenido';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { ReporteProntoPago } from './models/ReporteProntoPago';
import * as XLSX from 'xlsx';
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
  paginaSize: number = 10;
  paginaTotalRecords: number = 0;
  data: ReporteProntoPago[] = [] //tu modelo
  btnExportarCargando: boolean;
  btnEnviarCorreoClienteCargando: boolean;

  constructor(private toastService: ToastrService,
    private httpService: BackendService,
    public permissionsService: NgxPermissionsService,
  ) { }


  ngOnInit(): void {
    this.getData()
  }
  getData() {
    this.Cargando = true;

    let parametros: Parametro[] = [
      { key: "desde", value: this.desde },
      { key: "hasta", value: this.hasta },
      { key: "search", value: this.Search },
    ]

    this.httpService.GetAllWithPagination<ReporteProntoPago>(DataApi.ReporteProntoPago, "GetReporteProntoPagoListado", "ID", this.paginaNumeroActual,
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


  exportarReporteExcel() {
    this.btnExportarCargando = true;

    let parametros: Parametro[] = [
      { key: "desde", value: this.desde },
      { key: "hasta", value: this.hasta },
    ]

    this.httpService.DoPost<ReporteProntoPago>(DataApi.ReporteProntoPago,
      "GetReporteProntoPagoAllDataByDate", parametros).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {

          const ws2: XLSX.WorkSheet = XLSX.utils.json_to_sheet(response.records);

          /* generate workbook and add the worksheet */
          const wb: XLSX.WorkBook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws2, 'ReporteProntoPago');

          /* save to file */
          XLSX.writeFile(wb, "ReporteProntoPago.xlsx");
        }


        this.btnExportarCargando = false;
      }, error => {
        this.btnExportarCargando = false;
        this.toastService.error("No se pudo obtener los datos", "Error conexion al servidor");
      });
  }


  enviarEmailCliente(item: ReporteProntoPago) {
    this.btnEnviarCorreoClienteCargando = true;

    this.httpService.DoPostAny<ReporteProntoPago>(DataApi.ReporteProntoPago,
      "EnviarReporteProntoPagoCliente", item).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.toastService.success("OK", "Correo enviado.");
        }


        this.btnEnviarCorreoClienteCargando = false;
      }, error => {
        this.btnEnviarCorreoClienteCargando = false;
        this.toastService.error("No se pudo obtener los datos", "Error conexion al servidor");
      });

  }

}
