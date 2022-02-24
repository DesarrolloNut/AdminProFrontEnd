import { Component, OnInit } from '@angular/core';
import { NgxPermissionsService } from 'ngx-permissions';
import { ToastrService } from 'ngx-toastr';
import { Parametro } from 'src/app/core/http/model/Parametro';
import { ResponseContenido } from 'src/app/core/http/model/ResponseContenido';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { ReporteProntoPago } from 'src/app/Modules/ventas/reporteprontopago/models/ReporteProntoPago';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { ComboBox } from 'src/app/shared/model/ComboBox';
import * as XLSX from 'xlsx';
import { ReporteInventarioActivo } from './models/ReporteInventarioActivo';
@Component({
  selector: 'app-reporte-inventario-activo',
  templateUrl: './reporte-inventario-activo.component.html',
  styleUrls: ['./reporte-inventario-activo.component.scss']
})
export class ReporteInventarioActivoComponent implements OnInit {


  // COPIAR AL CREAR UN LISTADO NUEVO
  Search: string = "";
  rutaId: number = 0;

  desde: string = [new Date().getFullYear(), (new Date().getMonth() + 1), new Date().getDate()].join('-');
  hasta: string = [new Date().getFullYear(), (new Date().getMonth() + 1), new Date().getDate()].join('-');
  paginaNumeroActual = 1;
  Cargando: boolean = false;
  CargandoBar: boolean = false;
  totalPaginas: number = 0;
  paginaSize: number = 10;
  paginaTotalRecords: number = 0;


  //BOOLEAN
  btnExportarCargando: boolean;
  btnEnviarCorreoClienteCargando: boolean;
  loadingRutas: boolean;


    //LISTA 
    rutas             : ComboBox[];
    data: ReporteInventarioActivo[] = [] //tu modelo

  constructor(private toastService: ToastrService,
    private httpService: BackendService,
    public permissionsService: NgxPermissionsService,
  ) { }


  ngOnInit(): void {
    this.getData()
    this.getRutas();
  }
  getData() {
    this.Cargando = true;

    let parametros: Parametro[] = [
      { key: "rutaId", value: this.rutaId },
    ]

    this.httpService.GetAllWithPagination<ReporteInventarioActivo>(DataApi.ReporteInventarioActivo, 
      "GetReporteInventarioActivoListado", "Codigo", this.paginaNumeroActual,
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
        this.data=[];
        this.totalPaginas =0;
        this.paginaTotalRecords = 0;
        this.paginaSize = 0;
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
      { key: "rutaId", value: this.rutaId },
    ]

    this.httpService.DoPost<ReporteInventarioActivo>(DataApi.ReporteInventarioActivo,
      "GetReporteInventarioActivoAllDataByDate", parametros).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {

          const ws2: XLSX.WorkSheet = XLSX.utils.json_to_sheet(response.records);

          /* generate workbook and add the worksheet */
          const wb: XLSX.WorkBook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws2, 'ReporteInventarioActivo');

          /* save to file */
          XLSX.writeFile(wb, "ReporteInventarioActivo.xlsx");
        }


        this.btnExportarCargando = false;
      }, error => {
        this.btnExportarCargando = false;
        this.toastService.error("No se pudo obtener los datos", "Error conexion al servidor");
      });
  }


  enviarEmailCliente(item: ReporteInventarioActivo) {
    this.btnEnviarCorreoClienteCargando = true;

    this.httpService.DoPostAny<ReporteInventarioActivo>(DataApi.ReporteProntoPago,
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


  
  getRutas() {
    this.loadingRutas = true;
    let parametros: Parametro[] = [
      { key: "tipoRuta", value: 0 },
    ]

    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetRutasComboBox", parametros).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.rutas = response.records;
          
          let c =new ComboBox();
          c.codigo=0;
          c.nombre="Todas las rutas";
          this.rutas.unshift(c);
        }
        this.loadingRutas = false;
      }, error => {
        this.loadingRutas = false;
        this.toastService.error("No se pudo obtener las rutas", "Error conexion al servidor");

        setTimeout(() => {
          this.getRutas();
        }, 1000);

      });
  }

}
