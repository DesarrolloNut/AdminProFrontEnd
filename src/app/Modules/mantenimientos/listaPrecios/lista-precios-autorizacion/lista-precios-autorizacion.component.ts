import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxPermissionsService } from 'ngx-permissions';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'src/app/core/authentication/service/authentication.service';
import { Parametro } from 'src/app/core/http/model/Parametro';
import { ResponseContenido } from 'src/app/core/http/model/ResponseContenido';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { Accesorio } from 'src/app/Modules/servicios/recepcion/models/Accesorio';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { EstadoGeneralesKey } from 'src/app/shared/enums/EstadoGeneralesKey';
import { ComboBox } from 'src/app/shared/model/ComboBox';

@Component({
  selector: 'app-lista-precios-autorizacion',
  templateUrl: './lista-precios-autorizacion.component.html',
  styleUrls: ['./lista-precios-autorizacion.component.scss']
})
export class ListaPreciosAutorizacionComponent implements OnInit {
  // COPIAR AL CREAR UN LISTADO NUEVO
  Search: string = "";
  paginaNumeroActual = 1;
  Cargando: boolean = false;
  totalPaginas: number = 0;
  paginaSize: number = 10;
  paginaTotalRecords: number = 0;
  data: any[] = [] //tu modelo

  estadoAutorizacionComboModel: number;
  estadoAutorizacionUsuario: number;
  estadosAutorizacion: ComboBox[];
  estadoIDAutorizacionDefault: number;
  estadoAutorizacionSiguiente: ComboBox;
  estadoAutorizacionAnterior: ComboBox;

  constructor(private toastService: ToastrService,
    private httpService: BackendService,
    private authService: AuthenticationService,
    private modalService: NgbModal,
    public permissionsService: NgxPermissionsService,
  ) { }


  ngOnInit(): void {
    // this.getData()
    this.getEstadoAutorizacionUsuario()
    this.getEstadosAutorizacion()
  }

  // onEstadoComboChange() {
  //   this.getData()
  // }


  getData() {
    this.Cargando = true;

    let parametros: Parametro[] = [
      { key: "EstadoAutorizacionID", value: this.estadoAutorizacionComboModel },
      { key: "Search", value: this.Search },
    ]

    this.httpService.GetAllWithPagination<any>(DataApi.Articulo, "GetArticulosAsignadosListaPrecioPagination", "ListaPrecio", this.paginaNumeroActual,
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


  getEstadosAutorizacion() {
    let parametros: Parametro[] = [{
      key: "NameKey",
      value: EstadoGeneralesKey.LISTAPRECIO
    }]

    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetEstadoForKeyComboBox", parametros).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.estadosAutorizacion = response.records;
          this.estadoIDAutorizacionDefault = response.records[0].codigo;
          this.getSiguienteEstado()//almacena en una variable el siguiente estado
          this.getAnteriorEstadoAutorizacion()//almacena en una variable el anterior estado
          this.getData()
        }
      }, error => {
        this.toastService.error("No se pudo obtener los estados.", "Error conexion al servidor");
        setTimeout(() => {
          this.getEstadosAutorizacion()
        }, 1000);

      });
  }

  getEstadoAutorizacionUsuario() {

    this.httpService.DoPostAny<any>(DataApi.NivelAutorizacion,
      "GetEstadoAutorizacionUsuario", Number(this.authService.tokenDecoded.nameid)).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.estadoAutorizacionUsuario = response.valores[0];
        }
      }, error => {
        this.toastService.error("No se pudo obtener el estado de autorización del usuario", "Error conexion al servidor");
        setTimeout(() => {
          this.getEstadoAutorizacionUsuario()
        }, 1000);

      });

  }

  getSiguienteEstado() {
    let estadoUsuario = this.estadosAutorizacion.find(x => x.codigo == this.estadoAutorizacionUsuario);
    let estadoActualPosicion = this.estadosAutorizacion.indexOf(estadoUsuario);
    this.estadoAutorizacionSiguiente = this.estadosAutorizacion[estadoActualPosicion + 1]
  }

  getAnteriorEstadoAutorizacion() {
    let estadoUsuario = this.estadosAutorizacion.find(x => x.codigo == this.estadoAutorizacionUsuario);
    let estadoActualPosicion = this.estadosAutorizacion.indexOf(estadoUsuario);
    this.estadoAutorizacionAnterior = this.estadosAutorizacion[estadoActualPosicion - 1]
    this.estadoAutorizacionComboModel = this.estadoAutorizacionAnterior.codigo;

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

  openModal(content, btnClicked: number) {
    this.modalService.open(content, { size: 'sm' });
    // this.btnClicked = btnClicked
  }

  onBtnModalOk() {

    // if (this.btnClicked == 1) {
    //   this.desautorizar()
    //   return;
    // }
    // if (this.btnClicked == 2) {
    //   this.solicitarAutorizacion()
    //   return;
    // }
    // if (this.btnClicked == 3) {
    //   this.autorizar()
    //   return;
    // }

    this.modalService.dismissAll()



  }


}
