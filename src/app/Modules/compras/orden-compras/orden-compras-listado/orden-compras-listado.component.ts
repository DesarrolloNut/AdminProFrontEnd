import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxPermissionsService } from 'ngx-permissions';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'src/app/core/authentication/service/authentication.service';
import { Parametro } from 'src/app/core/http/model/Parametro';
import { ResponseContenido } from 'src/app/core/http/model/ResponseContenido';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { OrdenListadoViewModel } from 'src/app/Modules/servicios/ordenes/models/OrdenListadoViewModel';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { Archivo } from 'src/app/shared/model/Archivo';
import { OrdenCompraListadoViewModel } from '../models/OrdenCompraListadoViewModel';

@Component({
  selector: 'app-orden-compras-listado',
  templateUrl: './orden-compras-listado.component.html',
  styleUrls: ['./orden-compras-listado.component.scss']
})
export class OrdenComprasListadoComponent implements OnInit {

  // COPIAR AL CREAR UN LISTADO NUEVO
  Search: string = "";
  paginaNumeroActual = 1;
  Cargando: boolean = false;
  CargandoBar: boolean = false;
  totalPaginas: number = 0;
  paginaSize: number = 5;
  paginaTotalRecords: number = 0;
  data: OrdenCompraListadoViewModel[] = [] //tu modelo

  //modal
  cargandoAnexos: boolean
  ordenSeleccionada: OrdenCompraListadoViewModel;
  progress: number;
  files: any[] = [];
  filesSubidos: Archivo[] = [];

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

    this.httpService.GetAllWithPagination<OrdenCompraListadoViewModel>(DataApi.OrdenCompra, "GetOrdenCompraListado", "ID", this.paginaNumeroActual,
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


  openModal(content, item: OrdenCompraListadoViewModel) {
    this.modalService.open(content, { size: 'lg' });
    this.ordenSeleccionada = item
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
    formData.append("OrdenCompraID", this.ordenSeleccionada.id + '');

    for (let file of this.files)
      formData.append("files", file);

    this.httpService.DoPostAny<any>(DataApi.Upload,
      "UploadOrdenCompraAnexos", formData).subscribe(response => {

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

    this.httpService.DoPostAny<Archivo>(DataApi.OrdenCompra,
      "GetOrdenCompraAnexosArchivos", this.ordenSeleccionada.id).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0], "Error");
        } else {
          this.filesSubidos = response.records;
          // this.router.navigateByUrl('/mantenimientos/almacen');
        }

        // this.btnGuardarCargando = false;
      }, error => {
        // this.btnGuardarCargando = false; 
        this.toastService.error("Error conexion al servidor");
      });

  }

  // downloadFile(id: number) {

  //   this.httpService.DoPostAny<Archivo>(DataApi.Upload,
  //     "DownloadFile", id).subscribe(response => {

  //       // if (!response.ok) {
  //       //   this.toastService.error(response.errores[0], "Error");
  //       // } else {
  //       //   console.log(response)
  //       //   // this.filesSubidos = response.records;
  //       //   // this.router.navigateByUrl('/mantenimientos/almacen');
  //       // }

  //       console.log(response)


  //       // this.btnGuardarCargando = false;
  //     }, error => {
  //       // this.btnGuardarCargando = false; 
  //       this.toastService.error("Error conexion al servidor");
  //     });

  // }


}




