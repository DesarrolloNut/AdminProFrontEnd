import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxPermissionsService } from 'ngx-permissions';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'src/app/core/authentication/service/authentication.service';
import { Parametro } from 'src/app/core/http/model/Parametro';
import { ResponseContenido } from 'src/app/core/http/model/ResponseContenido';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { BalanzaPesajeSignalrService } from 'src/app/Services/balanza-pesaje-signalr.service';
import { BalanzaPesoGrupoSignalREnum } from 'src/app/shared/enums/BalanzaPesoGrupoSignalREnum';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { EstadosGeneralesKeyEnum } from 'src/app/shared/enums/EstadosGeneralesKeyEnum';
import { ComboBox } from 'src/app/shared/model/ComboBox';
import { ArticuloPesaje } from '../models/ArticuloPesaje';
import { ArticuloPesajeListadoViewModel } from '../models/ArticuloPesajeListadoViewModel';

@Component({
  selector: 'app-pesaje-listado',
  templateUrl: './pesaje-listado.component.html',
  styleUrls: ['./pesaje-listado.component.scss']
})
export class PesajeListadoComponent implements OnInit, OnDestroy {





  // COPIAR AL CREAR UN LISTADO NUEVO
  // Search: string = "";
  paginaNumeroActual = 1;
  Cargando: boolean = false;
  CargandoModal: boolean = false;
  totalPaginas: number = 0;
  paginaSize: number = 10;
  paginaTotalRecords: number = 0;
  data: ArticuloPesajeListadoViewModel[] = [] //tu modelo
  almacenDefault: number;



  //LECTURA DEL CODIGO DE BARRA
  @ViewChild('search') searchElement: ElementRef;
  searchValue: string = ""
  enterPressed: boolean;


  @ViewChild('modalDetalle') modalElement: ElementRef;
  articuloPesaje: ArticuloPesajeListadoViewModel;
  articuloPesajeDetalle: any;
  btnGuardarCargando: boolean;


  constructor(private toastService: ToastrService,
    private httpService: BackendService,
    private authService: AuthenticationService,
    private router: Router,
    private signalRService: BalanzaPesajeSignalrService,
    private modalService: NgbModal,
  ) { }


  ngOnInit(): void {
    // this.getData()
    this.getAlmacenesUsuarioEnrroll();
  }


  subscribeSignalR() {
    this.signalRService.startConnection(BalanzaPesoGrupoSignalREnum.Pantalla_Pesaje_Listado);
    this.signalRService.refreshListado.subscribe((refresh: boolean) => {
      this.toastService.info("Nuevo pesaje ha llegado");
      this.getData()
    })

  }

  getData() {
    // this.Cargando = true;

    let parametros: Parametro[] = [{ key: "Almacen", value: this.almacenDefault }]

    this.httpService.GetAllWithPagination<ArticuloPesajeListadoViewModel>(DataApi.ArticuloPesaje, "GetArticuloPesajeListado", "ID", this.paginaNumeroActual,
      this.paginaSize, false, parametros).subscribe(x => {

        if (x.ok) {
          this.data = x.records;
          this.asignarPagination(x);
        } else {
          this.toastService.error(x.errores[0]);
          console.error(x.errores[0]);
        }
        // this.Cargando = false;
      }, error => {
        console.error(error);
        this.toastService.error("Error conexion al servidor");
        // this.Cargando = false;
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


  getAlmacenesUsuarioEnrroll() {

    let parametros: Parametro[] = [
      { key: "usuarioID", value: this.authService.tokenDecoded.nameid },
      { key: "ModuloKey", value: EstadosGeneralesKeyEnum.PRODUCCION },
    ]

    // this.loadingAlmacenesDesde = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetUsuarioAlmacenesModulo", parametros).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {

          if (response.records.length > 0) {
            this.almacenDefault = response.records[0].codigo
            this.signalRService.almacenID = this.almacenDefault;

            console.log(this.signalRService.almacenID)

            this.subscribeSignalR();
            this.getData();
          }

        }
        // this.loadingAlmacenesDesde = false;
      }, error => {
        // this.loadingAlmacenesDesde = false;
        this.toastService.error("No se pudo obtener el almacen por default PRODUCCION", "Error conexion al servidor");

        setTimeout(() => {
          this.getAlmacenesUsuarioEnrroll();
        }, 1000);

      });
  }


  setFocus() {
    this.searchElement.nativeElement.focus();
  }

  @HostListener('window:keydown', ['$event'])
  onWindowKeyDown(event: any) {
    if (!this.enterPressed) {
      this.setFocus()
    }
  }


  @HostListener('window:keyup.enter', ['$event'])
  onWindowKeyupEnter(event: any) {
    this.searchElement.nativeElement.blur();

    if (!this.enterPressed) {
      this.enterPressed = true;
      this.modalService.dismissAll();
      this.modalService.open(this.modalElement, { size: "xl" })
      this.getArticuloPesajeByID(Number(this.searchValue));
    }
  }

  getArticuloPesajeByID(articuloPesajeID: number) {

    this.CargandoModal = true;
    this.httpService.DoPostAny<ArticuloPesajeListadoViewModel>(DataApi.ArticuloPesaje,
      "GetArticuloPesajeByID", articuloPesajeID).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
          this.modalService.dismissAll();
        } else {
          if (response.records.length > 0) {
            this.articuloPesaje = response.records[0];

            this.articuloPesajeDetalle = JSON.parse(this.articuloPesaje.detalleJSON);
          } else {
            this.toastService.error("Resultado no encontrado")
            this.modalService.dismissAll();
          }
        }

        this.searchValue = ""
        this.enterPressed = false;

        this.CargandoModal = false;
      }, error => {
        this.searchValue = ""
        this.enterPressed = false;
        this.modalService.dismissAll();

        this.CargandoModal = false;
        this.toastService.error("Error conexion al servidor");
      });

  }


  recibirPesaje() {

    let request = new ArticuloPesaje();
    request.id = this.articuloPesaje.id;
    request.estadoID = 2;

    this.btnGuardarCargando = true;

    this.httpService.DoPostAny<ArticuloPesaje>(DataApi.ArticuloPesaje,
      "UpdateArticuloPesajeEstadoID", request).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0], "Error");
        } else {
          this.toastService.success("Realizado", "OK");
          // this.getData();
          this.modalService.dismissAll();
          this.getData();
        }

        this.btnGuardarCargando = false;
      }, error => {
        this.btnGuardarCargando = false;
        this.toastService.error("Error conexion al servidor");
      });
  }



  ngOnDestroy() {
    // this.unlistener();
    this.signalRService.ExitGroup(BalanzaPesoGrupoSignalREnum.Pantalla_Pesaje_Listado);

  }

}
