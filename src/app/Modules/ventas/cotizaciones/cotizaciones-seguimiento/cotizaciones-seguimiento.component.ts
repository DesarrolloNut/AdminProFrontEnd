import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxPermissionsService } from 'ngx-permissions';
import { ToastrService } from 'ngx-toastr';
import { Parametro } from 'src/app/core/http/model/Parametro';
import { ResponseContenido } from 'src/app/core/http/model/ResponseContenido';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { ComboBox } from 'src/app/shared/model/ComboBox';
import { CotizacionDetalleViewModel } from '../models/CotizacionDetalleViewModel';
import { CotizacionListadoViewModel } from '../models/CotizacionListadoViewModel';

@Component({
  selector: 'app-cotizaciones-seguimiento',
  templateUrl: './cotizaciones-seguimiento.component.html',
  styleUrls: ['./cotizaciones-seguimiento.component.scss']
})
export class CotizacionesSeguimientoComponent implements OnInit {


  // COPIAR AL CREAR UN LISTADO NUEVO
  // Search: string = "";
  paginaNumeroActual = 1;
  Cargando: boolean = false;
  CargandoBar: boolean = false;
  totalPaginas: number = 0;
  paginaSize: number = 5;
  paginaTotalRecords: number = 0;
  data: CotizacionListadoViewModel[] = [] //tu modelo

  //filtros
  vendedorID: number = 0;
  estadoID: number = 1;
  fecha: Date = new Date();
  estados: ComboBox[] = []

  //modal
  cotizacionDetalles: CotizacionDetalleViewModel[];
  loadingCotizacionDetalle: boolean;
  loadingEstados: boolean;
  cotizacionSeleccionada: CotizacionListadoViewModel;
  loadingEstadoAutorizacionCotizacion: boolean = false;
  loadingVendedores: boolean;
  vendedores: ComboBox[];

  constructor(private toastService: ToastrService,
    private httpService: BackendService,
    private modalService: NgbModal,
    public permissionsService: NgxPermissionsService,
  ) { }


  ngOnInit(): void {
    this.getEstados()
    this.getData()
    this.getVendedores()
  }
  getData() {
    this.Cargando = true;

    let parametros: Parametro[] = [
      { key: "Fecha", value: this.fecha },
      { key: "EstadoID", value: this.estadoID },
      { key: "VendedorID", value: this.vendedorID ? this.vendedorID : 0 }
    ]

    this.httpService.GetAllWithPagination<CotizacionListadoViewModel>(DataApi.Cotizacion, "GetCotizacionSeguimientoListado", "ID", this.paginaNumeroActual,
      this.paginaSize, false, parametros).subscribe(x => {

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


  openModal(content, cotizacion: CotizacionListadoViewModel) {
    this.cotizacionDetalles = [];
    this.getCotizacionDetalle(cotizacion.id);
    this.cotizacionSeleccionada = cotizacion;
    this.modalService.open(content, { size: 'lg', });
  }

  openModalAutorizar(content, cotizacion: CotizacionListadoViewModel) {
    this.cotizacionDetalles = [];
    this.getCotizacionDetalle(cotizacion.id);
    this.cotizacionSeleccionada = cotizacion;
    this.modalService.open(content, { size: 'lg', });
  }

  getCotizacionDetalle(cotizacionID: number) {
    this.loadingCotizacionDetalle = true;
    this.httpService.DoPostAny<CotizacionDetalleViewModel>(DataApi.Cotizacion,
      "GetCotizacionDetalles", cotizacionID).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.cotizacionDetalles = response.records;
        }
        this.loadingCotizacionDetalle = false;
      }, error => {
        this.loadingCotizacionDetalle = false;
        this.toastService.error("No se pudo obtener el detalle", "Error conexion al servidor");
      });
  }

  CambiarEstadoAutorizacionCotizacion(cotizacionID: number) {
    this.loadingEstadoAutorizacionCotizacion = true;
    this.httpService.DoPostAny<CotizacionDetalleViewModel>(DataApi.Cotizacion,
      "CambiarEstadoAutorizacionCotizacion", cotizacionID).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          // this.cotizacionDetalles = response.records;
          this.modalService.dismissAll();
          this.getData()
        }
        this.loadingEstadoAutorizacionCotizacion = false;
      }, error => {
        this.loadingEstadoAutorizacionCotizacion = false;
        this.toastService.error("No se pudo obtener el detalle", "Error conexion al servidor");
      });
  }

  getEstados() {

    this.estados = [
      { codigo: 1, nombre: "Cotizado", grupo: "#BFBFBF", grupoID: "", },
      { codigo: 2, nombre: "Pedido", grupo: "#33B0FF", grupoID: "", },
      { codigo: 3, nombre: "Pendiente Finanzas", grupo: "#FCB700", grupoID: "", },
      { codigo: 6, nombre: "Pendiente Despacho", grupo: "#FCB690", grupoID: "", },
      { codigo: 4, nombre: "Facturado", grupo: "#7BE7CE", grupoID: "", },
      { codigo: 5, nombre: "Entregado", grupo: "#5EE553", grupoID: "", },
    ]

  }

  onChangeFechaFiltro(evento: any) {

    this.fecha = new Date(evento.value)
    this.getData();

  }

  // getEstados() {
  //   this.loadingEstados = true;
  //   this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
  //     "GetEstadosCotizacion", null).subscribe(response => {

  //       if (!response.ok) {
  //         this.toastService.error(response.errores[0]);
  //       } else {
  //         this.estados = response.records;
  //       }
  //       this.loadingEstados = false;
  //     }, error => {
  //       this.loadingEstados = false;
  //       this.toastService.error("No se pudo obtener los estados", "Error conexion al servidor");

  //       setTimeout(() => {
  //         this.getEstados();
  //       }, 1000);

  //     });
  // }


  // onChangeEstado(cotizacion: CotizacionListadoViewModel, index: number) {

  //   this.httpService.DoPostAny<ComboBox>(DataApi.Cotizacion,
  //     "UpdateCotizacionEstado", cotizacion).subscribe(response => {

  //       if (!response.ok) {
  //         this.toastService.error(response.errores[0]);
  //         console.error(response.errores[0]);
  //       } else {
  //         this.toastService.success("Estado actualizado", "OK");
  //       }
  //     }, error => {
  //       this.getData()
  //       this.toastService.error("No se actualizar el estado", "Error conexion al servidor");
  //     });

  // }


  getVendedores() {
    this.loadingVendedores = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetVendedores", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.vendedores = response.records;
        }
        this.loadingVendedores = false;
      }, error => {
        this.loadingVendedores = false;
        this.toastService.error("No se pudo obtener los vendedores", "Error conexion al servidor");

        setTimeout(() => {
          this.getVendedores();
        }, 1000);

      });
  }



}
