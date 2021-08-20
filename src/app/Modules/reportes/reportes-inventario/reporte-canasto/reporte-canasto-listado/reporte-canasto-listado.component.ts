import { ReporteCanasto } from "./../../models/ReporteCanasto";
import { Component, OnInit } from "@angular/core";
import { NgxPermissionsService } from "ngx-permissions";
import { ToastrService } from "ngx-toastr";
import { Parametro } from "src/app/core/http/model/Parametro";
import { ResponseContenido } from "src/app/core/http/model/ResponseContenido";
import { BackendService } from "src/app/core/http/service/backend.service";
import { DataApi } from "src/app/shared/enums/DataApi.enum";
import { ComboBox } from "src/app/shared/model/ComboBox";
import { ReporteInventarioActivo } from "../../reporte-inventario-activo/models/ReporteInventarioActivo";
import * as XLSX from "xlsx";
import { AuthenticationService } from "src/app/core/authentication/service/authentication.service";
@Component({
  selector: "app-reporte-canasto-listado",
  templateUrl: "./reporte-canasto-listado.component.html",
  styleUrls: ["./reporte-canasto-listado.component.scss"],
})
export class ReporteCanastoListadoComponent implements OnInit {
  // COPIAR AL CREAR UN LISTADO NUEVO
  Search: string = "";
  rutaId: number = 0;

  fecha: string = [
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    new Date().getDate(),
  ].join("-");
  paginaNumeroActual = 1;
  Cargando: boolean = false;
  CargandoBar: boolean = false;
  totalPaginas: number = 0;
  paginaSize: number = 10;
  paginaTotalRecords: number = 0;

  totalcantidad: number = 0;
  totaldisponible: number = 0;
  totalrecogidos: number = 0;
  totalentregados: number = 0;

  //BOOLEAN
  btnExportarCargando: boolean;
  btnEnviarCorreoClienteCargando: boolean;
  loadingRutas: boolean;

  //LISTA
  rutas: ComboBox[];
  data: ReporteCanasto[] = []; //tu modelo
  loadingSucursal: boolean;
  SucursalId: number = 0;
  Sucursales: ComboBox[];

  constructor(
    private toastService: ToastrService,
    private httpService: BackendService,
    private auth: AuthenticationService,
    public permissionsService: NgxPermissionsService
  ) {}

  ngOnInit(): void {
    this.getTiposRutas();
    this.getSucursalByUsuarioId();
    this.getData();
  }
  getData() {
    this.Cargando = true;

    let parametros: Parametro[] = [
      { key: "SucursalId", value: this.SucursalId },
      { key: "TipoRutaId", value: this.rutaId },
      { key: "Fecha", value: this.fecha },
    ];

    this.httpService
      .GetAllWithPagination<ReporteCanasto>(
        DataApi.ReporteCanasto,
        "GetReporteCanastoListado",
        "TipoRutaId",
        this.paginaNumeroActual,
        this.paginaSize,
        true,
        parametros
      )
      .subscribe(
        (x) => {
          if (x.ok) {
            this.data = x.records;

            this.totalcantidad = 0;
            this.totaldisponible = 0;
            this.totalrecogidos = 0;
            this.totalentregados = 0;

            x.records.forEach((z) => {
              this.totalcantidad = this.totalcantidad + z.cantidad;
              this.totaldisponible = this.totaldisponible + z.disponible;
              this.totalrecogidos = this.totalrecogidos + z.recogidos;
              this.totalentregados = this.totalentregados + z.entregados;
            });
            this.asignarPagination(x);
          } else {
            this.toastService.error(x.errores[0]);
            console.error(x.errores[0]);
          }
          this.Cargando = false;
        },
        (error) => {
          this.toastService.error("Error conexion al servidor");
          this.Cargando = false;
        }
      );
  }

  asignarPagination(x: ResponseContenido<any>) {
    if (x.pagina != null) {
      this.totalPaginas =
        x.pagina.totalPaginas == null ? 0 : x.pagina.totalPaginas;
      this.paginaTotalRecords =
        x.pagina.totalRecords == null ? 0 : x.pagina.totalRecords;
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
      { key: "SucursalId", value: this.SucursalId },
      { key: "TipoRutaId", value: this.rutaId },
      { key: "Fecha", value: this.fecha },
    ];

    this.httpService
      .GetAllWithPagination<ReporteCanasto>(
        DataApi.ReporteCanasto,
        "GetReporteCanastoListado",
        "TipoRutaId",
        this.paginaNumeroActual,
        this.paginaSize,
        true,
        parametros
      )
      .subscribe(
        (response) => {
          if (!response.ok) {
            this.toastService.error(response.errores[0]);
          } else {
            const ws2: XLSX.WorkSheet = XLSX.utils.json_to_sheet(
              response.records
            );

            /* generate workbook and add the worksheet */
            const wb: XLSX.WorkBook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws2, "ReporteInventarioActivo");

            /* save to file */
            XLSX.writeFile(wb, "ReporteCanasto-"+this.fecha+".xlsx");
          }

          this.btnExportarCargando = false;
        },
        (error) => {
          this.btnExportarCargando = false;
          this.toastService.error(
            "No se pudo obtener los datos",
            "Error conexion al servidor"
          );
        }
      );
  }

  // enviarEmailCliente(item: ReporteInventarioActivo) {
  //   this.btnEnviarCorreoClienteCargando = true;

  //   this.httpService.DoPostAny<ReporteInventarioActivo>(DataApi.ReporteProntoPago,
  //     "EnviarReporteProntoPagoCliente", item).subscribe(response => {

  //       if (!response.ok) {
  //         this.toastService.error(response.errores[0]);
  //       } else {
  //         this.toastService.success("OK", "Correo enviado.");
  //       }

  //       this.btnEnviarCorreoClienteCargando = false;
  //     }, error => {
  //       this.btnEnviarCorreoClienteCargando = false;
  //       this.toastService.error("No se pudo obtener los datos", "Error conexion al servidor");
  //     });

  // }

  getSucursalByUsuarioId() {
    let UsuarioId = Number(this.auth.tokenDecoded.nameid);
    let parametros: Parametro[] = [{ key: "UsuarioId", value: UsuarioId }];

    this.loadingSucursal = true;
    this.httpService
      .DoPost<ComboBox>(
        DataApi.ComboBox,
        "GetSucursalesByUsuarioId",
        parametros
      )
      .subscribe(
        (response) => {
          if (!response.ok) {
            this.toastService.error(response.errores[0]);
          } else {
            this.SucursalId = response.records[0].codigo;
            this.Sucursales = response.records;
            this.getData();
          }
          this.loadingSucursal = false;
        },
        (error) => {
          this.loadingSucursal = false;
          this.toastService.error(
            "No se pudo obtener los supervisores",
            "Error conexion al servidor"
          );

          setTimeout(() => {
            this.getSucursalByUsuarioId();
          }, 1000);
        }
      );
  }

  getTiposRutas() {
    this.loadingRutas = true;
    let parametros: Parametro[] = [{ key: "tipoRuta", value: 0 }];

    this.httpService
      .DoPost<ComboBox>(DataApi.ComboBox, "GetRutaTipoComboBox", parametros)
      .subscribe(
        (response) => {
          if (!response.ok) {
            this.toastService.error(response.errores[0]);
          } else {
            this.rutas = response.records;
            this.rutaId = response.records[0].codigo;
          }
          this.loadingRutas = false;
        },
        (error) => {
          this.loadingRutas = false;
          this.toastService.error(
            "No se pudo obtener las rutas",
            "Error conexion al servidor"
          );

          setTimeout(() => {
            this.getTiposRutas();
          }, 1000);
        }
      );
  }
}
