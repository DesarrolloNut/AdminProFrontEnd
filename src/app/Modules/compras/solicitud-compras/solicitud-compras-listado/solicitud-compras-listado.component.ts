import { HttpEventType, HttpRequest } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxPermissionsService } from 'ngx-permissions';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'src/app/core/authentication/service/authentication.service';
import { Parametro } from 'src/app/core/http/model/Parametro';
import { ResponseContenido } from 'src/app/core/http/model/ResponseContenido';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { Configuraciones } from 'src/app/shared/enums/Configuraciones';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { EstadosGeneralesKeyEnum } from 'src/app/shared/enums/EstadosGeneralesKeyEnum';
import { Archivo } from 'src/app/shared/model/Archivo';
import { ComboBox } from 'src/app/shared/model/ComboBox';
import { SolicitudCompraDetalle } from '../models/SolicitudCompraDetalle';
import { SolicitudCompraListadoViewModel } from '../models/SolicitudCompraListadoViewModel';

@Component({
  selector: 'app-solicitud-compras-listado',
  templateUrl: './solicitud-compras-listado.component.html',
  styleUrls: ['./solicitud-compras-listado.component.scss']
})
export class SolicitudComprasListadoComponent implements OnInit {

  // COPIAR AL CREAR UN LISTADO NUEVO
  Search: string = "";
  paginaNumeroActual = 1;
  Cargando: boolean = false;
  CargandoBar: boolean = false;
  totalPaginas: number = 0;
  paginaSize: number = 5;
  paginaTotalRecords: number = 0;
  data: SolicitudCompraListadoViewModel[] = [] //tu modelo

  //modal
  cargandoAnexos: boolean
  solicitudSeleccionada: SolicitudCompraListadoViewModel;
  progress: number;
  files: any[] = [];
  filesSubidos: Archivo[] = [];

  keyModule = EstadosGeneralesKeyEnum.SOLICITUDCOMPRAS;
  estadosAutorizacion: ComboBox[];
  estadoAutorizacionFinal: number;
  loadingSolicitudDetalle: boolean;
  solicitudCompraDetalles: SolicitudCompraDetalle[];
  total: number;
  btnConvertirCargando: boolean;
  urlCarpetaArchivosCompartidos: string;


  constructor(private toastService: ToastrService,
    private httpService: BackendService,
    private authService: AuthenticationService,
    private modalService: NgbModal,
    private router: Router,
    public permissionsService: NgxPermissionsService,
  ) { }


  ngOnInit(): void {
    this.getUrlCarpetaArchivos();
    this.getData()
    this.getEstadosAutorizacion()
  }
  getData() {
    this.Cargando = true;

    let parametros: Parametro[] = [
      { key: "Search", value: this.Search },
      { key: "usuarioID", value: this.authService.tokenDecoded.nameid },
    ]

    this.httpService.GetAllWithPagination<SolicitudCompraListadoViewModel>(DataApi.SolicitudCompra, "GetSolicitudCompraListado", "ID", this.paginaNumeroActual,
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


  openModalSolicitud(content, item: SolicitudCompraListadoViewModel) {
    this.modalService.open(content, { size: 'lg' });
    this.solicitudSeleccionada = item
    this.files = []
   this.getArchivosSubidos()
  }


  setFiles(files) {

    this.files = []
    for (let i = 0; i < files.length; i++) {
      const element = files[i];
      this.files.push(element)
    }

  }

  onDeleteitem(index: number) {
    this.files.splice(index, 1);
  }

  onDeleteitemSubido(id: number, index: number) {

    this.httpService.DoPostAny<any>(DataApi.Upload,
      "DeleteFile", id).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0], "Error");
        } else {


        }

        // this.btnGuardarCargando = false;
      }, error => {
        // this.btnGuardarCargando = false; 
        this.toastService.error("Error conexion al servidor");
      });

  }


  subirArchivosAlServidor() {

    const formData = new FormData();
    formData.append("solicitudCompraID", this.solicitudSeleccionada.id + '');

    for (let file of this.files)
      formData.append("files", file);

      console.log(formData);

    this.httpService.DoPostAny<any>(DataApi.Upload,
      "UploadSolicitudCompraAnexos", formData).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0], "Error");
        } else {
          this.toastService.success("Realizado", "OK");
          // this.modalService.dismissAll()
          this.files = []
          this.filesSubidos = []
          this.getArchivosSubidos()
          // this.router.navigateByUrl('/mantenimientos/almacen');
        }

        // this.btnGuardarCargando = false;
      }, error => {
        // this.btnGuardarCargando = false; 
        this.toastService.error("Error conexion al servidor");
      });


  }

  getArchivosSubidos() {
    this.cargandoAnexos = true;
    this.httpService.DoPostAny<Archivo>(DataApi.SolicitudCompra,
      "GetSolicitudCompraAnexosArchivos", this.solicitudSeleccionada.id).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0], "Error");
        } else {
          this.filesSubidos = response.records;
        }
        this.cargandoAnexos = false;

      }, error => {
        this.cargandoAnexos = false;
        console.error(error)
        this.toastService.error("Error conexion al servidor");
      });

  }

  getEstadosAutorizacion() {
    let parametros: Parametro[] = [{
      key: "NameKey",
      value: this.keyModule
    }]

    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetEstadoForKeyComboBox", parametros).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
          console.error(response.errores[0]);
        } else {
          this.estadosAutorizacion = response.records;
          this.estadoAutorizacionFinal = this.estadosAutorizacion[this.estadosAutorizacion.length - 1].codigo;
        }
      }, error => {
        this.toastService.error("No se pudo obtener los estados.", "Error conexion al servidor");
        setTimeout(() => {
          this.getEstadosAutorizacion()
        }, 1000);

      });
  }

  openModalDetalle(content, item: SolicitudCompraListadoViewModel) {
    this, this.solicitudSeleccionada = item;
    this.modalService.open(content, { size: 'lg' });
    this.solicitudCompraDetalles = [];
    this.getSolicitudCompraDetalles(item.id);
    this.filesSubidos = []
    this.getArchivosSubidos()
  }


  getSolicitudCompraDetalles(id: number) {
    this.loadingSolicitudDetalle = true;
    this.httpService.DoPostAny<SolicitudCompraDetalle>(DataApi.SolicitudCompra,
      "GetSolicitudCompraDetalles", id).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.solicitudCompraDetalles = response.records;
          this.calcularTotal()
        }
        this.loadingSolicitudDetalle = false;
      }, error => {
        this.loadingSolicitudDetalle = false;
        this.toastService.error("No se pudo obtener el detalle", "Error conexion al servidor");
        this.modalService.dismissAll()
      });
  }

  calcularTotal() {
    this.total = 0
    this.solicitudCompraDetalles.forEach(x => {
      this.total += x.cantidad ? (x.costo * x.cantidad) : 0
    })
  }

  convertirAOrdenCompra() {
    this.btnConvertirCargando = true;
    this.httpService.DoPostAny<number>(DataApi.SolicitudCompra,
      "ConvertirSolicitudAOrdenDeCompra", this.solicitudSeleccionada).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0], "Error");
        } else {
          this.toastService.success("Realizado", "OK");
          this.modalService.dismissAll()

          let ordenID: number = response.records[0];
          console.table({ "Orden creada": ordenID })

          this.router.navigateByUrl('/compras/orden-compras/' + ordenID);
        }

        this.btnConvertirCargando = false;
      }, error => {
        this.btnConvertirCargando = false;
        this.toastService.error("Error conexion al servidor");
      });

  }


  getUrlCarpetaArchivos() {
    this.loadingSolicitudDetalle = true;
    this.httpService.DoPostAny<string>(DataApi.Configuracion,
      "GetConfiguracionValor", Number(Configuraciones.URL_ARCHIVOS_COMPARTIDOS_WEB_ADMIN)).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.urlCarpetaArchivosCompartidos = response.records[0];
        }
        this.loadingSolicitudDetalle = false;
      }, error => {
        console.error(error)
        this.loadingSolicitudDetalle = false;
        this.toastService.error("No se pudo obtener la url de los archivos", "Error conexion al servidor");
      });
  }


  deleteSolicitudCompraAnexoArchivoByID(id: number) {
    this.loadingSolicitudDetalle = true;
    this.httpService.DoPostAny<string>(DataApi.Upload,
      "DeleteSolicitudCompraAnexoArchivoByID", id).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.toastService.success("Realizado");
          this.getArchivosSubidos();
        }
        this.loadingSolicitudDetalle = false;
      }, error => {
        console.error(error)
        this.loadingSolicitudDetalle = false;
        this.toastService.error("No se pudo obtener la url de los archivos", "Error conexion al servidor");
      });
  }




}




