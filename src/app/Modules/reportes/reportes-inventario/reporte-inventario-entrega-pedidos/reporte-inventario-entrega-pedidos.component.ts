import { Component, OnInit } from '@angular/core';
import { NgxPermissionsService } from 'ngx-permissions';
import { ToastrService } from 'ngx-toastr';
import { Parametro } from 'src/app/core/http/model/Parametro';
import { ResponseContenido } from 'src/app/core/http/model/ResponseContenido';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { ReporteProntoPago } from 'src/app/Modules/ventas/reporteprontopago/models/ReporteProntoPago';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { ComboBox } from 'src/app/shared/model/ComboBox';
import { ReporteInventarioEntregaPedidos } from '../models/ReporteInventarioEntregaPedidos';

@Component({
  selector: 'app-reporte-inventario-entrega-pedidos',
  templateUrl: './reporte-inventario-entrega-pedidos.component.html',
  styleUrls: ['./reporte-inventario-entrega-pedidos.component.scss']
})
export class ReporteInventarioEntregaPedidosComponent implements OnInit {

  // COPIAR AL CREAR UN LISTADO NUEVO
  Search: string = "";
  paginaNumeroActual = 1;
  Cargando: boolean = false;
  totalPaginas: number = 0;
  paginaSize: number = 10;
  paginaTotalRecords: number = 0;
  data: ReporteInventarioEntregaPedidos[] = [] //tu modelo

  // filtros
  fechaFacturaFiltro: string = [new Date().getFullYear(), (new Date().getMonth() + 1), new Date().getDate()].join('-');
  estadoIdPedidoFiltro: number = 0
  estadosPedidos: ComboBox[] = []
  loadingestadosPedidos: boolean;

  rutas: ComboBox[] = []
  rutaEntregaId: number = 0
  loadingRutas: boolean;

  constructor(private toastService: ToastrService,
    private httpService: BackendService,
    public permissionsService: NgxPermissionsService,
  ) { }


  ngOnInit(): void {
    // this.getData()
    this.poblarComboEstado();
    this.getRutas()
  }



  poblarComboEstado() {
    let estado1: ComboBox = new ComboBox();
    estado1.codigo = 0;
    estado1.nombre = "No Entregada"

    let estado2: ComboBox = new ComboBox();
    estado2.codigo = 1;
    estado2.nombre = "Entregada"

    this.estadosPedidos.push(estado1)
    this.estadosPedidos.push(estado2)

  }

  getRutas() {
    this.loadingRutas = true;

    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetAllRutas", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
          console.error(response.errores[0]);
        } else {
          this.rutas = response.records;
          // console.table(this.confirmed)
        }

        this.loadingRutas = false;
      }, error => {
        this.loadingRutas = false;
        this.toastService.error("Error conexion al servidor");
      });
  }

  getData() {


    this.Cargando = true;

    let parametros: Parametro[] = [
      { key: "fecha", value: this.fechaFacturaFiltro },
      { key: "estadoid", value: this.estadoIdPedidoFiltro },
      { key: "RutaEntregaId", value: this.rutaEntregaId },
      { key: "search", value: this.Search },
    ]

    this.httpService.GetAllWithPagination<ReporteInventarioEntregaPedidos>(DataApi.Factura, "GetReporteInventarioEntregaPedidos", "FacturaCodigoReferencia", this.paginaNumeroActual,
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
