import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxPermissionsService } from 'ngx-permissions';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'src/app/core/authentication/service/authentication.service';
import { Parametro } from 'src/app/core/http/model/Parametro';
import { ResponseContenido } from 'src/app/core/http/model/ResponseContenido';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { ComboBox } from 'src/app/shared/model/ComboBox';
import { CotizacionDetalleViewModel } from '../../cotizaciones/models/CotizacionDetalleViewModel';
import { CotizacionListadoViewModel } from '../../cotizaciones/models/CotizacionListadoViewModel';


@Component({
  selector: 'app-factura-listado',
  templateUrl: './factura-listado.component.html',
  styleUrls: ['./factura-listado.component.scss']
})
export class FacturaListadoComponent implements OnInit {


  // COPIAR AL CREAR UN LISTADO NUEVO
  Search: string = "";
  paginaNumeroActual = 1;
  Cargando: boolean = false;
  CargandoBar: boolean = false;
  totalPaginas: number = 0;
  paginaSize: number = 10;
  paginaTotalRecords: number = 0;
  data: CotizacionListadoViewModel[] = [] //tu modelo
  estadoERPID:any;
  fecha= new Date()
  vendedor:any;
  
  cotizacionDetalles: CotizacionDetalleViewModel[];
  loadingCotizacionDetalle: boolean;
  estados: ComboBox[] = []
  loadingEstados: boolean;
  cotizacionSeleccionada: CotizacionListadoViewModel;
  loadingEstadoAutorizacionCotizacion: boolean = false;
  loadingVendedores: boolean;
  loadingEstadosERP: boolean;
  vendedores: ComboBox[];
  estadoERPs: ComboBox[];

  constructor(private toastService: ToastrService,
    private httpService: BackendService,
    private modalService: NgbModal,
    private authService: AuthenticationService,
    public permissionsService: NgxPermissionsService,
  ) { }


  ngOnInit(): void {
    this.getData()
    this.getEstados()
    this.getVendedores();
    this.getEstadoERP();
  }
  getData() {
    this.Cargando = true;
    let parametros: Parametro[] = [
      { key: "Search", value: this.Search },
  ]
    this.httpService.GetAllWithPagination<any>(DataApi.Factura, "GetFacturaListado", "ID", this.paginaNumeroActual,
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
  getDataFiltrado() {
    this.Cargando = true;
    let parametros: Parametro[] = [
      { key: "Search", value: this.Search },
      { key: "fechaDocumento", value: this.fecha },
      { key: "vendedorID", value: this.vendedor },
      { key: "estadoERPID", value: this.estadoERPID }
  ]
  console.log(parametros)

    this.httpService.GetAllWithPagination<CotizacionListadoViewModel>(DataApi.Cotizacion, "GetCotizacionListadoFiltrado", "ID", this.paginaNumeroActual,
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


  openModalMapaRelacion(modal: any): void {
    this.modalService.open(modal, { size: 'xl', centered: true })
  }


  openModal(content, cotizacion: CotizacionListadoViewModel) {
    this.cotizacionDetalles = [];
    this.getCotizacionDetalle(cotizacion.id);
    this.cotizacionSeleccionada = cotizacion;
    this.modalService.open(content, { windowClass: "myCustomModalClass", });
  }

  openModalAutorizar(content, cotizacion: CotizacionListadoViewModel) {
    this.cotizacionDetalles = [];
    this.getCotizacionDetalle(cotizacion.id);
    this.cotizacionSeleccionada = cotizacion;
    this.modalService.open(content, { size: 'xl', });
  }

  getCotizacionDetalle(cotizacionID: number) {
    this.loadingCotizacionDetalle = true;
    this.httpService.DoPostAny<CotizacionDetalleViewModel>(DataApi.Cotizacion,
      "GetCotizacionDetalles", cotizacionID).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.cotizacionDetalles = response.records;
          console.log(this.cotizacionDetalles)
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
          //this.getData()
        }
        this.loadingEstadoAutorizacionCotizacion = false;
      }, error => {
        this.loadingEstadoAutorizacionCotizacion = false;
        this.toastService.error("No se pudo obtener el detalle", "Error conexion al servidor");
      });
  }


  getEstados() {
    this.loadingEstados = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetEstadosCotizacion", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.estados = response.records;
        }
        this.loadingEstados = false;
      }, error => {
        this.loadingEstados = false;
        this.toastService.error("No se pudo obtener los estados", "Error conexion al servidor");

        setTimeout(() => {
          this.getEstados();
        }, 1000);

      });
  }


  onChangeEstado(cotizacion: CotizacionListadoViewModel, index: number) {

    this.httpService.DoPostAny<ComboBox>(DataApi.Cotizacion,
      "UpdateCotizacionEstado", cotizacion).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
          console.error(response.errores[0]);
        } else {
          this.toastService.success("Estado actualizado", "OK");
        }
      }, error => {
        //this.getData()
        this.toastService.error("No se actualizar el estado", "Error conexion al servidor");
      });


  }

  onChangeFecha(fecha:any){
    //this.getData();
    //alert("Fecha change")
    if(this.vendedor&& this.estadoERPID)
    {
      this.getDataFiltrado();
    }
  }
  onChangeVendedor(vendedor:any)
  {
    this.getDataFiltrado();
   
  }
  onChangeEstadoERP(estado:any)
  {
    this.getDataFiltrado();
  
  }
  

  getVendedores() {
    
    this.loadingVendedores = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetVendedoresCotizacion", null).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          if(response.records.length > 0)
          {
            this.vendedores = response.records;
           this.vendedor=response.records[0].codigo;
          
           
          }
          
        }
        this.loadingVendedores = false;
      }, error => {
        this.loadingVendedores = false;
        this.toastService.error("No se pudo obtener los vendedores", "Error conexion al servidor");
      });
  }

  getEstadoERP() {
    
    this.loadingEstadosERP = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetEstadosERP", null).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          if(response.records.length > 0){
            this.estadoERPs = response.records;
            this.estadoERPID=(Number(response.records[0].codigo));
          
          }
         
        }
        this.loadingEstadosERP = false;
      }, error => {
        this.loadingEstadosERP = false;
        this.toastService.error("No se pudo obtener los Estados", "Error conexion al servidor");
      });
  }



}
