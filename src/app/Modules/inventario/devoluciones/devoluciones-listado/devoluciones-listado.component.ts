import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxPermissionsService } from 'ngx-permissions';
import { ToastrService } from 'ngx-toastr';
import { Parametro } from 'src/app/core/http/model/Parametro';
import { ResponseContenido } from 'src/app/core/http/model/ResponseContenido';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { DevolucionVista } from '../models/DevolucionVista';
import { DevolucionDetalleVista } from '../models/DevolucionDetalleVista';

@Component({
  selector: 'app-devoluciones-listado',
  templateUrl: './devoluciones-listado.component.html',
  styleUrls: ['./devoluciones-listado.component.scss']
})
export class DevolucionesListadoComponent implements OnInit {

// COPIAR AL CREAR UN LISTADO NUEVO
Search: string = "";
paginaNumeroActual = 1;
Cargando: boolean = false;
CargandoDetalle: boolean = false;
btnGuardarCargando: boolean = false;
CargandoBar: boolean = false;
totalPaginas: number = 0;
paginaSize: number = 5;
paginaTotalRecords: number = 0;
data: DevolucionVista[] = [] //tu modelo
dataDetalle: DevolucionDetalleVista[] = [] //tu modelo

EditarCantidadConfirmado: boolean = true;
CancelarEditarCantidadConfirmado: boolean = false;
CambioCantidadConfirmado: boolean = false;
devolucionSelected: DevolucionVista = new DevolucionVista();
  btnEnviarCargando: boolean;

constructor(private toastService: ToastrService,
  private httpService: BackendService,
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
  ]

  this.httpService.GetAllWithPagination<DevolucionVista>(DataApi.Devolucion, "GetDevolucionListado", "ID", this.paginaNumeroActual,
    this.paginaSize, true, parametros).subscribe(x => {

      if (x.ok) {
        this.data = x.records;
        console.log(this.data);
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
getDataDetalle(DevolucionID:number) {
  this.CargandoDetalle = true;

  // let parametros: Parametro[] = [{ key: "DevolucionID", value: DevolucionID}]

  this.httpService.DoPostAny<DevolucionDetalleVista>(DataApi.DevolucionDetalle, "GetDevolucionDetalleVistaByID", DevolucionID).subscribe(x => {

      if (x.ok) {
        this.dataDetalle = [];
        x.records.forEach(x => {
          x.cantidadConfirmado == 0 ? x.cantidadConfirmado = x.cantidad : x.cantidadConfirmado;
          this.dataDetalle.push(x);
        });
      } else {
        this.toastService.error(x.errores[0]);
        console.error(x.errores[0]);
      }
      this.CargandoDetalle = false;
    }, error => {
      console.error(error);
      this.toastService.error("Error conexion al servidor");
      this.CargandoDetalle = false;
    });

}
SaveDevolucionDetalleVista() {
  this.btnGuardarCargando = true;

  this.httpService.DoPostAny<DevolucionDetalleVista>(DataApi.DevolucionDetalle, "UpdateDevolucionDetalleCantidadConfirmado", this.dataDetalle).subscribe(x => {

      if (x.ok) {
        // this.modalService.dismissAll();
      } else {
        this.toastService.error(x.errores[0]);
        console.error(x.errores[0]);
      }
      this.btnGuardarCargando = false;
    }, error => {
      console.error(error);
      this.toastService.error("Error conexion al servidor");
      this.btnGuardarCargando = false;
    });

    this.cambiarCantidadConfirmado();

}
SendAutorizar() {
  this.btnEnviarCargando = true;
  this.devolucionSelected.estadoId  = 1;

  this.httpService.DoPostAny<DevolucionDetalleVista>(DataApi.Devolucion, "CambiarEstadoDevolucion", this.devolucionSelected).subscribe(x => {

      if (x.ok) {
        this.modalService.dismissAll();
        this.getData();
      } else {
        this.toastService.error(x.errores[0]);
        console.error(x.errores[0]);
      }
      this.btnEnviarCargando = false;
    }, error => {
      console.error(error);
      this.toastService.error("Error conexion al servidor");
      this.btnEnviarCargando = false;
    });

}

openModal(content, DevolucionSelect: DevolucionVista) {
  this.devolucionSelected = DevolucionSelect;
  this.getDataDetalle(DevolucionSelect.id);
  this.modalService.open(content, { size: 'xl', backdrop: "static", });
}

cambiarCantidadConfirmado(){
  this.EditarCantidadConfirmado = !this.EditarCantidadConfirmado;
  this.CancelarEditarCantidadConfirmado = !this.CancelarEditarCantidadConfirmado;
  this.CambioCantidadConfirmado = this.EditarCantidadConfirmado ? false : true;
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
