import { Component, OnInit } from '@angular/core';
import { ResponseContenido } from 'src/app/core/http/model/ResponseContenido';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { Parametro } from 'src/app/core/http/model/Parametro';
import { NgxPermissionsService } from 'ngx-permissions';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { ToastrService } from 'ngx-toastr';
import { OrdenListadoViewModel } from '../models/OrdenListadoViewModel';
import { AuthenticationService } from 'src/app/core/authentication/service/authentication.service';
import { ComboBox } from 'src/app/shared/model/ComboBox';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Orden } from '../../recepcion/models/Orden';

@Component({
  selector: 'app-ordenes-listado',
  templateUrl: './ordenes-listado.component.html',
  styleUrls: ['./ordenes-listado.component.scss']
})
export class OrdenesListadoComponent implements OnInit {


  // COPIAR AL CREAR UN LISTADO NUEVO
  Search: string = "";
  paginaNumeroActual = 1;
  Cargando: boolean = false;
  CargandoBar: boolean = false;
  totalPaginas: number = 0;
  paginaSize: number = 5;
  paginaTotalRecords: number = 0;
  data: OrdenListadoViewModel[] = [] //tu modelo


  idTecnicoSeleccionado: number;
  idOrdenSeleccionada: number;

  btnGuardarCargando: boolean;
  tecnicos: ComboBox[];
  loadingBtnGuardarTecnico: boolean;
  loadingTecnicos: boolean;


  constructor(private toastService: ToastrService,
    private httpService: BackendService,
    private modalService: NgbModal,
    private authService: AuthenticationService,
    public permissionsService: NgxPermissionsService,
  ) { }


  ngOnInit(): void {
    this.getData();
  }

  getData() {
    this.Cargando = true;

    let parametros: Parametro[] = [
      { key: "Search", value: this.Search },
      { key: "usuarioID", value: this.authService.tokenDecoded.nameid }
    ]

    this.httpService.GetAllWithPagination<OrdenListadoViewModel>(DataApi.Recepcion, "GetOrdenesServicioListado", "OrdenID", this.paginaNumeroActual,
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



  enviarOrdenSmartService(citaId: number) {
    this.Cargando = true;
    this.httpService.DoPostAny<any>(DataApi.Recepcion,
      "GetRecepcionForSmartService", citaId).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
          this.Cargando = false;
        } else {
          this.enviarDatosASmart(response.valores[0])
        }

      }, error => {
        this.Cargando = false;
        this.toastService.error("Error conexion al servidor");
      });
  }

  enviarDatosASmart(recepcionForSmart) {
    this.Cargando = true;

    recepcionForSmart.sintomas = JSON.stringify(recepcionForSmart.sintomas);
    console.log(recepcionForSmart)

    this.httpService.DoPostSmartWebService("InsertaServicioscitas", "inserta_cita_servicios", recepcionForSmart).subscribe(response => {
      let mensajeRespuesta = response.d + '';
      console.log(response.d)

      if (mensajeRespuesta.includes("Error")) {
        this.Cargando = false;
        this.toastService.error(mensajeRespuesta, "Smart Servicio");
        return;
      }

      this.toastService.success("Operacion realizada.", "Smart Servicio");
      this.Cargando = false;
    }, error => {
      this.Cargando = false;
      console.error(error)
      this.toastService.error("Error conexion al servidor", "Smart Servicio");
    });


  }




  // openModal(content, item: OrdenListadoViewModel) {
  //   this.getTecnicos()
  //   this.idTecnicoSeleccionado = item.idUsuarioTecnico
  //   this.idOrdenSeleccionada = item.ordenID
  //   this.modalService.open(content, { backdrop: 'static', keyboard: false });
  // }


  // getTecnicos() {
  //   this.loadingTecnicos = true;
  //   let parametros: Parametro[] = [{
  //     key: "sucursalID",
  //     value: this.authService.tokenDecoded.groupsid
  //   }];
  //   this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
  //     "GetTecnicosComboBox", parametros).subscribe(response => {

  //       if (!response.ok) {
  //         this.toastService.error(response.errores[0]);
  //       } else {
  //         this.tecnicos = response.records;
  //       }

  //       this.loadingTecnicos = false;
  //     }, error => {

  //       this.loadingTecnicos = false;
  //       this.toastService.error("Error conexion al servidor");
  //     });
  // }


  // asignarTecnico() {

  //   if (this.idTecnicoSeleccionado <= 0) {
  //     this.toastService.warning("Completa todos los datos.")
  //     return;
  //   }

  //   let orden = new Orden();
  //   orden.idUsuarioTecnico = this.idTecnicoSeleccionado;
  //   orden.id = this.idOrdenSeleccionada

  //   this.loadingBtnGuardarTecnico = true;

  //   this.httpService.DoPostAny<OrdenListadoViewModel>(DataApi.Recepcion,
  //     "AsignarTecnicoOrden", orden).subscribe(response => {

  //       if (!response.ok) {
  //         this.toastService.error(response.errores[0], "Error");
  //       } else {
  //         this.getData()
  //         this.toastService.success("Realizado", "OK");
  //         this.modalService.dismissAll();
  //       }

  //       this.loadingBtnGuardarTecnico = false;
  //     }, error => {
  //       this.loadingBtnGuardarTecnico = false;
  //       this.toastService.error("Error conexion al servidor");
  //     });
  // }


  buscarCodigoReferenciaOrdenSmart(citaID) {
    this.Cargando = true;
    this.httpService.DoPostSmartWebService("OrdenRecepcion", "Ordenrecepcion", { "Idcita": citaID }).subscribe(response => {
      let mensajeRespuesta = response.d + '';
      console.log(response.d)

      if (mensajeRespuesta.includes("Error")) {
        this.Cargando = false;
        this.toastService.error(mensajeRespuesta, "Smart Servicio");
        return;
      }
      this.toastService.success("Código de orden obtenido.", "Smart Servicio");
      this.asignarCodigoReferenciaOrden(Number(citaID), mensajeRespuesta);

    }, error => {
      this.Cargando = false;
      console.error(error)
      this.toastService.error("Error conexion al servidor", "Smart Servicio");
    });
  }


  asignarCodigoReferenciaOrden(citaID: number, codigoReferencia: string) {


    let orden = new Orden();
    orden.citaID = citaID;
    orden.ordenReferencia = codigoReferencia;

    // this.loadingBtnGuardarTecnico = true;

    this.httpService.DoPostAny<OrdenListadoViewModel>(DataApi.Recepcion,
      "AsignarCodigoOrdenReferenciaSmart", orden).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0], "Error");
        } else {
          this.toastService.success("Código de orden asignado", "OK");
          this.getData()
        }

        // this.loadingBtnGuardarTecnico = false;
      }, error => {
        // this.loadingBtnGuardarTecnico = false;
        this.toastService.error("Asignar CodigoReferencia Orden", "Error conexion al servidor");
      });
  }




}
