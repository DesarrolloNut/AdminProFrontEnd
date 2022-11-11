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
import { TipoRutaEnum } from '../../rutas/models/TipoRutaEnum';
import { ComprobanteFiscal } from '../models/ComprobanteFiscal';
import { ComprobanteFiscalDetalle } from '../models/ComprobanteFiscalDetalle';
import { ComprobanteFiscalListadoViewModel } from '../models/ComprobanteFiscalListadoViewModel';
import { ComprobanteFiscalTipoEnum } from '../models/ComprobanteFiscalTipoEnum';

@Component({
  selector: 'app-comprobante-fiscal-listado',
  templateUrl: './comprobante-fiscal-listado.component.html',
  styleUrls: ['./comprobante-fiscal-listado.component.scss']
})
export class ComprobanteFiscalListadoComponent implements OnInit {

  // COPIAR AL CREAR UN LISTADO NUEVO
  Search: string = "";
  paginaNumeroActual = 1;
  Cargando: boolean = false;
  CargandoBar: boolean = false;
  totalPaginas: number = 0;
  paginaSize: number = 5;
  paginaTotalRecords: number = 0;
  data: ComprobanteFiscalListadoViewModel[] = [] //tu modelo
  estados: ComboBox[];
  loadingEstados: boolean;
  estadoSelected: number;

  // MODAL
  itemSelected: ComprobanteFiscalListadoViewModel;
  loadingRutasVendedores: boolean;
  rutasVendedores: ComboBox[];
  comprobanteDetalleRutas: ComprobanteFiscalDetalle[] = [];
  comprobanteDetalleSucursales: ComprobanteFiscalDetalle[] = [];
  loadingSucursales: boolean;
  sucursales: ComboBox[];
  btnGuardarCargando: boolean;
  loadingComprobanteDetalle: boolean;

  tipoComprobantes = ComprobanteFiscalTipoEnum;
  comprobanteDetalles: ComprobanteFiscalDetalle[];
  ocultarBotonesAgregar: boolean;
  excedioLimite: boolean;
  btnEnviandoSAP: boolean;
  comprobanteID: number=0;


  constructor(private toastService: ToastrService,
    private httpService: BackendService,
    public permissionsService: NgxPermissionsService,
    private authService: AuthenticationService,
    private modalService: NgbModal,

  ) { }


  ngOnInit(): void {
    this.getComprobanteFiscalEstados();
    this.getSucursales()
    this.getRutasComprobantes()
  }

  filterRutas(item: ComprobanteFiscalDetalle): boolean {
    return item.tipoID == ComprobanteFiscalTipoEnum.RUTA;
  }
  filterSucursales(item: ComprobanteFiscalDetalle): boolean {
    return item.tipoID == ComprobanteFiscalTipoEnum.SUCURSAL;
  }

  getData() {
    this.Cargando = true;

    let parametros: Parametro[] = [
      { key: "Search", value: this.Search },
      { key: "estadoID", value: this.estadoSelected },
    ]

    this.httpService.GetAllWithPagination<ComprobanteFiscalListadoViewModel>(DataApi.ComprobanteFiscal,
      "GetComprobanteFiscalListado", "ID", this.paginaNumeroActual,
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
  getComprobanteFiscalEstados() {
    this.loadingEstados = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetComprobanteFiscalEstados", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
          console.error(response.errores[0]);
        } else {
          this.estados = response.records;

          if (this.estados && this.estados.length > 0) {
            this.estadoSelected = this.estados[0].codigo;
          }

          this.getData()
        }

        this.loadingEstados = false;

      }, error => {
        this.toastService.error("No se pudo obtener los estados.", "Error conexion al servidor");
        setTimeout(() => {
          this.getComprobanteFiscalEstados()
        }, 1000);

      });
  }

  openModal(content, item: ComprobanteFiscalListadoViewModel) {
    this.modalService.open(content, { windowClass: "myCustomModalClass", });
    this.itemSelected = item;
    this.comprobanteID=item.tipoComprobanteID;
    this.getComprobanteDetalles(item.id);
    this.getRutasComprobantes();
    this.getSucursales();
  }
  getRutasComprobantes() {
    this.loadingRutasVendedores = true;
    let parametros: Parametro[] = [
      { key: "tipoRuta", value: TipoRutaEnum.VENTAS },
      { key: "TipoComprobanteId", value:  this.comprobanteID  }
    ]

    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetRutasComprobantesComboBox", parametros).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.rutasVendedores = response.records;
        }
        this.loadingRutasVendedores = false;
      }, error => {
        this.loadingRutasVendedores = false;
        this.toastService.error("No se pudo obtener las rutas", "Error conexion al servidor");

        setTimeout(() => {
          this.getRutasComprobantes();
        }, 1000);

      });
  }

  getSucursales() {
    this.loadingSucursales = true;
    let parametros: Parametro[] = [
      { key: "TipoComprobanteId", value:  this.comprobanteID  }
    ]

    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetSucursalesDetalleComprobanteFiscal", parametros).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.sucursales = response.records;
        }
        this.loadingSucursales = false;
      }, error => {
        this.loadingSucursales = false;
        this.toastService.error("No se pudo obtener las sucursales", "Error conexion al servidor");

        setTimeout(() => {
          this.getSucursales();
        }, 1000);

      });
  }

  onSubmit() {

    //valida campos llenos
    let camposImcompletos =
      this.comprobanteDetalleRutas.filter(x => x.valorID > 0)
        .some(x => x.desde <= 0 || x.hasta <= 0)
      ||
      this.comprobanteDetalleSucursales.filter(x => x.valorID > 0)
        .some(x => x.desde <= 0 || x.hasta <= 0)


    if (camposImcompletos) {
      this.toastService.warning("Llena todos los campos.")
      return;
    }

    this.guardarDetalle();

  }


  guardarDetalle() {


    this.comprobanteDetalleRutas.forEach(x => x.tipoID = ComprobanteFiscalTipoEnum.RUTA)
    this.comprobanteDetalleSucursales.forEach(x => x.tipoID = ComprobanteFiscalTipoEnum.SUCURSAL)

    let parametro: any = {
      "Comprobante": this.itemSelected,
      // "Detalles": this.comprobanteDetalleRutas.concat(this.comprobanteDetalleSucursales)
      //   .filter(x => x.valorID > 0)
      "Detalles": this.comprobanteDetalles
        .filter(x => x.valorID > 0)
    }


    this.btnGuardarCargando = true;

    this.httpService.DoPostAny<any>(DataApi.ComprobanteFiscal,
      "RegistrarComprobanteDetalles", parametro).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0], "Error");
        } else {
          this.toastService.success("Realizado", "OK");
          // this.router.navigateByUrl('/ventas/comprobante');
           this.modalService.dismissAll()

          this.getComprobanteDetalles(this.itemSelected.id);

        }

        this.btnGuardarCargando = false;
      }, error => {
        this.btnGuardarCargando = false;
        this.toastService.error("Error conexion al servidor");
      });
  }


  getComprobanteDetalles(comprobanteID: number) {
    this.loadingComprobanteDetalle = true;
    this.httpService.DoPostAny<ComprobanteFiscalDetalle>(DataApi.ComprobanteFiscal,
      "GetComprobanteDetalles", comprobanteID).subscribe(response => {

        if (!response || !response.ok) {
          this.toastService.error(response.errores[0]);
        } else {

          if (response.records) {
            this.comprobanteDetalles = response.records;
          }
          this.ocultarBotonesAgregar = this.comprobanteDetalles.some(x => x.hasta >= this.itemSelected.secuenciaHasta)
          this.excedioLimite = this.comprobanteDetalles.some(x => x.hasta > this.itemSelected.secuenciaHasta)

        }
        this.loadingComprobanteDetalle = false;
      }, error => {
        this.loadingComprobanteDetalle = false;
        this.toastService.error("No se pudo obtener el detalle", "Error conexion al servidor");
        this.modalService.dismissAll()
      });
  }


  agregarDetalleVacio(tipo: ComprobanteFiscalTipoEnum.RUTA | ComprobanteFiscalTipoEnum.SUCURSAL) {
    this.comprobanteDetalles.push
      ({ comprobanteID: 0, desde: 0, hasta: 0, id: 0, valorID: 0, asignados: 0, tipoID: tipo, editable: true, companiaId:Number(this.authService.tokenDecoded.primarygroupsid),estadoERPID:1 })
  }


  calcularAsignacionComprobantes() {

    let allItems = this.comprobanteDetalles.filter(x => x.valorID > 0 && x.asignados > 0)

    let firstItem = allItems[0];
    firstItem.desde = this.itemSelected.secuenciaDesde;

    allItems.forEach((item, i) => {

      if (item.valorID > 0) {

        if (i > 0) {
          let itemAnterior = allItems[i - 1];
          item.desde = itemAnterior.hasta + 1;
        }

        item.hasta = item.desde + item.asignados;

      }

    });

    this.ocultarBotonesAgregar = this.comprobanteDetalles.some(x => x.hasta >= this.itemSelected.secuenciaHasta)
    this.excedioLimite = this.comprobanteDetalles.some(x => x.hasta > this.itemSelected.secuenciaHasta)
  }

  
  ActualizarNumerosComprobantesFiscalesSAP(itemSucursal: ComprobanteFiscalDetalle) {

    this.btnEnviandoSAP = true;

    this.httpService.DoPostAny<any>(DataApi.ComprobanteFiscal,
      "ActualizarNumerosComprobantesFiscalesSAP", itemSucursal).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0], "Error");
        } else {
          this.toastService.success("Realizado", "OK");
        }

        this.btnEnviandoSAP = false;
      }, error => {
        this.btnEnviandoSAP = false;
        this.toastService.error("Error conexion al servidor");
      });


  }



}
