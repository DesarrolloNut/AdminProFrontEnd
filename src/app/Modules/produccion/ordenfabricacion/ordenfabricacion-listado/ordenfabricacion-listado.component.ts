import { OrdenFabricacionDetalle } from './../models/OrdenFabricacionDetalle';
import { OrdenFabricacionVista } from './../models/OrdenFabricacionVista';
import { Component, OnInit } from '@angular/core';
import { NgxPermissionsService } from 'ngx-permissions';
import { ToastrService } from 'ngx-toastr';
import { Parametro } from 'src/app/core/http/model/Parametro';
import { ResponseContenido } from 'src/app/core/http/model/ResponseContenido';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Articulo } from 'src/app/Modules/servicios/recepcion/models/Articulo';
import { OrdenFabricacion } from '../models/OrdenFabricacion';
import { ListaMaterialesHeader } from '../models/ListaMaterialesHeader';

@Component({
  selector: 'app-ordenfabricacion-listado',
  templateUrl: './ordenfabricacion-listado.component.html',
  styleUrls: ['./ordenfabricacion-listado.component.scss']
})
export class OrdenfabricacionListadoComponent implements OnInit {

// COPIAR AL CREAR UN LISTADO NUEVO
Search: string = "";
paginaNumeroActual = 1;
Cargando: boolean = false;
CargandoBar: boolean = false;
totalPaginas: number = 0;
paginaSize: number = 5;
paginaTotalRecords: number = 0;
data: OrdenFabricacionVista[] = [] //tu modelo
ofheader: ListaMaterialesHeader = new ListaMaterialesHeader();
loadingArticulosExtras: boolean;
articulosExtras: OrdenFabricacionVista[] = [];
searching: boolean;
articulo: Articulo = new Articulo();

//Eliminar cuando el pesaje este listo
IsPesaje: boolean = false;
loadingSaveConsumido: boolean;
IsClose: boolean = false;

constructor(private toastService: ToastrService,
  private httpService: BackendService,
  public permissionsService: NgxPermissionsService,
  private modalService: NgbModal
) { }


ngOnInit(): void {
  this.getData()
}
getData() {
  this.Cargando = true;

  let parametros: Parametro[] = [{ key: "Search", value: this.Search }]

  this.httpService.GetAllWithPagination<OrdenFabricacionVista>(DataApi.OrdenFabricacion, "GetOrdenFabricacionListado", "ID", this.paginaNumeroActual,
    this.paginaSize, true, parametros).subscribe(x => {

      if (x.ok) {
        this.data = x.records;
        let estado = x.records[0].estadoId;
        if(estado == 3){
          this.IsClose = true;
        }
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

OnChangeIsPesaje(articulosExtras: OrdenFabricacionVista){
  articulosExtras.isPesaje = !articulosExtras.isPesaje;
}

OnSaveConsumido(articulosExtras: OrdenFabricacionVista){

  // let requeridad = Number((articulosExtras.cantidadBase * this.ofheader.cantidadPlanificada).toFixed(6));
  let requeridad = articulosExtras.cantidadRequerida;
  let consumido = articulosExtras.consumido;
  console.log(requeridad);
  console.log(consumido);

  if(consumido >= requeridad){
    this.loadingSaveConsumido = true;
    // console.log(articulosExtras);
    this.httpService.DoPostAny<OrdenFabricacionVista>(DataApi.OrdenFabricacionDetalle,
      "UpdateConsumidoYCostoReal", articulosExtras).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          articulosExtras.isPesaje = !articulosExtras.isPesaje;
          this.getOrdenFabricacion(articulosExtras.ordenFabricacionId);
        }
        this.loadingSaveConsumido = false;
      }, error => {
        this.loadingSaveConsumido = false;
        this.toastService.error("No se pudo obtener los articulos extras", "Error conexion al servidor");

        setTimeout(() => {
          //this.getOrdenFabricacion();
        }, 1000);
      });
  }else{
    this.toastService.error("El valor consumido de ser igual a la cantidad requerida", "Error Cantidad");
  }




}

// OnChangeConsumido(articulosExtras: OrdenFabricacionVista){
//       let requeridad = (articulosExtras.cantidadBase * this.ofheader.cantidadPlanificada);
//       let consumido = articulosExtras.consumido;
//       if(consumido < requeridad){
//         this.toastService.error("El valor consumido de ser mayor a la cantidad requerida", "Error Cantidad");
//       }

// }



openModal(content, modal: OrdenFabricacionVista) {
  // this.cotizacionDetalles = [];
  // this.getCotizacionDetalle(cotizacion.id);
  // this.cotizacionSeleccionada = cotizacion;
  // console.log(modal);
  this.getOrdenFabricacion(modal.id);
  this.modalService.open(content, { windowClass: "myCustomModalClass", backdrop: "static",});
}


getOrdenFabricacion(id:number) {
  this.loadingArticulosExtras = true;

  this.httpService.DoPostAny<OrdenFabricacion>(DataApi.OrdenFabricacion,
    "GetOrdenFabricacionByID", id).subscribe(response => {

      if (!response.ok) {
        this.toastService.error(response.errores[0]);
      } else {
        this.getArticuloById(response.records[0].articuloId);
        this.ofheader.tipoId = response.records[0].ordenFabricacionTipoId;
        this.ofheader.estadoId = response.records[0].estadoId;
        this.ofheader.cantidadPlanificada = response.records[0].cantidad;
        this.ofheader.almacenId = response.records[0].almacenId;
        this.ofheader.fechaInicio = response.records[0].fechaInicio;
        this.ofheader.fechaCierre = response.records[0].fechaCierre;
        this.ofheader.id = response.records[0].id;
        this.getOrdenFabricacionDetalle(response.records[0].id);
      }
      this.loadingArticulosExtras = false;
    }, error => {
      this.loadingArticulosExtras = false;
      this.toastService.error("No se pudo obtener los articulos extras", "Error conexion al servidor");

      setTimeout(() => {
        //this.getOrdenFabricacion();
      }, 1000);
    });
}


getOrdenFabricacionDetalle(ordenFabricacionId: number) {
  this.loadingArticulosExtras = true;

  this.httpService.DoPostAny<OrdenFabricacionVista>(DataApi.OrdenFabricacionDetalle,
    "GetOrdenFabricacionDetalleVistaByID", ordenFabricacionId).subscribe(response => {

      if (!response.ok) {
        this.toastService.error(response.errores[0]);
      } else {
       this.articulosExtras = response.records;
       this.articulosExtras.forEach(x => x.cantidadRequerida = Number((x.cantidadBase * this.ofheader.cantidadPlanificada).toFixed(6)));
      // console.log(response.records)
      }
      this.loadingArticulosExtras = false;
    }, error => {
      this.loadingArticulosExtras = false;
      this.toastService.error("No se pudo obtener los articulos extras", "Error conexion al servidor");

      setTimeout(() => {
        //this.getOrdenFabricacionDetalle();
      }, 1000);
    });
}

getArticuloById(ArticuloID: number) {
  this.searching = true;
  this.httpService.DoPostAny<Articulo>(DataApi.Articulo,
    "GetArticuloByID", ArticuloID ).subscribe(response => {

      if (!response.ok) {
        this.toastService.error(response.errores[0]);
      } else {
        //validar que existe
        if (response != null && response.records != null && response.records.length > 0) {
          let record = response.records[0];
          this.articulo = record;
         // console.log(record);
          //this.getOrdenFabricacionDetalle(record.codigoReferencia);
        }
        else {
          this.articulo = null;
        }
        this.searching = false;
      }

    }, error => {
      this.searching = false;
      this.toastService.error("Error conexion al servidor");
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

}
