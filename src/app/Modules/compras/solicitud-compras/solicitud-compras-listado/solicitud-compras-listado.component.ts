import { HttpEventType, HttpRequest } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxPermissionsService } from 'ngx-permissions';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'src/app/core/authentication/service/authentication.service';
import { Parametro } from 'src/app/core/http/model/Parametro';
import { ResponseContenido } from 'src/app/core/http/model/ResponseContenido';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { Archivo } from 'src/app/shared/model/Archivo';
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
  cargandoCotizaciones: boolean
  solicitudSeleccionada: SolicitudCompraListadoViewModel;
  progress: number;
  files: any[] = [];
  filesSubidos: Archivo[];



  constructor(private toastService: ToastrService,
    private httpService: BackendService,
    private authService: AuthenticationService,
    private modalService: NgbModal,
    public permissionsService: NgxPermissionsService,
  ) { }


  ngOnInit(): void {
    this.getData()
  }
  getData() {
    this.Cargando = true;

    let parametros: Parametro[] = [
      { key: "Search", value: this.Search },
      { key: "usuarioID", value: this.authService.tokenDecoded.nameid },
    ]

    this.httpService.GetAllWithPagination<SolicitudCompraListadoViewModel>(DataApi.SolicitudCompra, "GetSolicitudCompraListado", "ID", this.paginaNumeroActual,
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


  openModal(content, item: SolicitudCompraListadoViewModel) {
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

  onDeleteitemSubido(id: number) {


    this.httpService.DoPostAny<any>(DataApi.SolicitudCompra,
      "GetSolicitudCompraCotizacionesArchivos", this.solicitudSeleccionada.id).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0], "Error");
        } else {
          console.log(response.records)
          this.filesSubidos = response.records;
          // this.router.navigateByUrl('/mantenimientos/almacen');
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

    this.httpService.DoPostAny<any>(DataApi.Upload,
      "UploadCotizacionesDeSolicitudCompra", formData).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0], "Error");
        } else {
          this.toastService.success("Realizado", "OK");
          this.modalService.dismissAll()
          // this.router.navigateByUrl('/mantenimientos/almacen');
        }

        // this.btnGuardarCargando = false;
      }, error => {
        // this.btnGuardarCargando = false; 
        this.toastService.error("Error conexion al servidor");
      });


  }

  getArchivosSubidos() {

    this.httpService.DoPostAny<Archivo>(DataApi.SolicitudCompra,
      "GetSolicitudCompraCotizacionesArchivos", this.solicitudSeleccionada.id).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0], "Error");
        } else {
          console.log(response.records)
          this.filesSubidos = response.records;
          // this.router.navigateByUrl('/mantenimientos/almacen');
        }

        // this.btnGuardarCargando = false;
      }, error => {
        // this.btnGuardarCargando = false; 
        this.toastService.error("Error conexion al servidor");
      });

  }




}




