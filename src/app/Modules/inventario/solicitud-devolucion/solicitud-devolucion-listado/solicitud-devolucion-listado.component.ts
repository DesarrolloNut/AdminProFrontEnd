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
import { PrintExportFile, TypeReport } from 'src/app/Services/PrintExportFile.service';
import { Configuraciones } from 'src/app/shared/enums/Configuraciones';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { EstadoGeneral } from 'src/app/shared/enums/EstadoGeneral';
import { EstadosGeneralesKeyEnum } from 'src/app/shared/enums/EstadosGeneralesKeyEnum';
import { Archivo } from 'src/app/shared/model/Archivo';
import { CambiarEstado } from 'src/app/shared/model/CambiarEstado';
import { ComboBox } from 'src/app/shared/model/ComboBox';
import { SolicitudArticuloDetalle } from '../../transferencia/models/SolicitudArticuloDetalle';
import { PrintTransferenciaInventarioVM } from '../models/PrintTransferenciaInventarioVM';
import { RequestTransferenciaInventario } from '../models/RequestTransferenciaInventario';

import { SolicitudTransferenciaInventarioDetalles } from '../models/SolicitudCompraDetalle';
import { SolicitudCompraListadoViewModel } from '../models/SolicitudCompraListadoViewModel';
import { SolicitudDevolucion } from '../models/SolicitudDevolucion';
import { TransferenciaInventario } from '../models/TransferenciaInventario';
import { Imprimir } from '../print/ImprimirTransferenciaInventario';

@Component({
  selector: 'app-solicitud-devolucion-listado',
  templateUrl: './solicitud-devolucion-listado.component.html',
  styleUrls: ['./solicitud-devolucion-listado.component.scss']
})
export class SolicitudDevolucionListadoComponent implements OnInit {

  // COPIAR AL CREAR UN LISTADO NUEVO
  Search: string = "";
  paginaNumeroActual = 1;
  Cargando: boolean = false;
  CargandoBar: boolean = false;
  totalPaginas: number = 0;
  paginaSize: number = 5;
  paginaTotalRecords: number = 0;
  data: SolicitudDevolucion[] = [] //tu modelo

  cargandoAnexos: boolean
  solicitudDevolucionSeleccionada: any;
  progress: number;
  files: any[] = [];
  filesSubidos: Archivo[] = [];

  almacenOrigin:string;
  almacenDestino:string;
  usuario:string;

  keyModule = EstadosGeneralesKeyEnum.SOLICITUDCOMPRAS;
  estadosAutorizacion: ComboBox[];
  estadoAutorizacionFinal: number;
  loadingSolicitudDetalle: boolean;
  transferenciaInventarioDetalles:  SolicitudArticuloDetalle[] = [];
  solicitudDevolucionDetalle:any;

  total: number;
  btnConvertirCargando: boolean;
  urlCarpetaArchivosCompartidos: string;
  btnConfirmarCargando: boolean;
  btnCargandoPrint: boolean;
  

  constructor(private toastService: ToastrService,
    private httpService: BackendService,
    private authService: AuthenticationService,
    private modalService: NgbModal,
    private printService :Imprimir ,
    private router: Router,
    public permissionsService: NgxPermissionsService,
  ) { }
  ngOnInit(): void {
    this.getData()
  }
  getData() {
    this.Cargando = true;
    let parametros: Parametro[] = [{ key: "Search", value: this.Search }]
    this.httpService.GetAllWithPagination<SolicitudDevolucion>(DataApi.SolicitudDevolucion, "GetSolicitudDevolucionListado", "ID", this.paginaNumeroActual,
      this.paginaSize, true, parametros).subscribe(x => {
        if (x.ok) {
          this.data = x.records;
          console.log(x.records);
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
  openModalSolicitud(content, item: any) {
    this.modalService.open(content, { windowClass: 'my-class'});
    this.solicitudDevolucionSeleccionada = item;
    this.getTransferenciaDetalles(String(item.id))
  }
  
  
 
  getTransferenciaDetalles(solicituDevolucionId: string) {
    let parametros = new SolicitudDevolucion();
    parametros.companiaId =Number(this.authService.tokenDecoded.primarygroupsid),
    parametros.numeroFactura=solicituDevolucionId, 
    this.loadingSolicitudDetalle = true;
    this.httpService.DoPostAny<any>(DataApi.SolicitudDevolucion,
      "GetSolicitudDevolucionDetalle", parametros).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.solicitudDevolucionDetalle = response.records;
       
        }
        this.loadingSolicitudDetalle = false;
      }, error => {
        this.loadingSolicitudDetalle = false;
        this.toastService.error("No se pudo obtener el detalle de devolución", "Error conexion al servidor");
        this.modalService.dismissAll()
      });
  }

  confirmarTransferenciaInventario(idTransferenciaInventario:number){
      this.confirmar(idTransferenciaInventario)
  }
  cancelarTransferenciaInventario(idTransferenciaInventario:number){
   this.cancelar(idTransferenciaInventario)
}

confirmar(id:number) {
  let parametros = new CambiarEstado();
  parametros .Id = id,
  parametros.Estado= EstadoGeneral.CONFIRMADO, 
  this.btnConfirmarCargando = true;
  this.httpService.DoPostAny<any>(DataApi.TransferenciaInventario,
    "Confirmar", parametros).subscribe(response => {
      if (!response.ok) {
        this.toastService.error(response.errores[0], "Error");
      } else {
        this.toastService.success("Realizado", "OK");
        this.getData();
      }
      this.btnConfirmarCargando = false;
    }, error => {
      this.btnConfirmarCargando = false;
      this.toastService.error("Error conexion al servidor");
    });
}

cancelar(id:number) {
  let parametros = new CambiarEstado();
  parametros .Id = id,
  parametros.Estado= EstadoGeneral.CANCELADO, 
  this.btnConfirmarCargando = true;
  this.httpService.DoPostAny<any>(DataApi.TransferenciaInventario,
    "Confirmar", parametros).subscribe(response => {
      if (!response.ok) {
        this.toastService.error(response.errores[0], "Error");
      } else {
        this.toastService.warning("Realizado", "OK");
        this.getData();
      }
      this.btnConfirmarCargando = false;
    }, error => {
      this.btnConfirmarCargando = false;
      this.toastService.error("Error conexion al servidor");
    });
}

imprimirToPDF( encabezado: any){
 
  this.loadingSolicitudDetalle = true;
    this.httpService.DoPostAny<SolicitudArticuloDetalle>(DataApi.TransferenciaInventario,
      "GetTransferenciaInventarioDetalles", Number(encabezado.id)).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.transferenciaInventarioDetalles = response.records;
          this.transferenciaInventarioDetalleToPrinter(this.transferenciaInventarioDetalles,encabezado)
        }
        this.loadingSolicitudDetalle = false;
      }, error => {
        this.loadingSolicitudDetalle = false;
        this.toastService.error("No se pudo obtener el detalle", "Error conexion al servidor");
      });
}

transferenciaInventarioDetalleToPrinter(data:SolicitudArticuloDetalle[],encabezado) {
  let dataFormated:any[] = [];
  data.forEach(x=>{
      dataFormated.push({
      FechaEntrega:encabezado.fecha,
      FechaCreacion: encabezado.fecha,
      ValidadoPor:encabezado.usuario,
      AlmacenOrigen:encabezado.codigoreferenciaAlmacenOrigen,
      HechoPor:encabezado.usuario,
      RecibidoPor:encabezado.usuario,
   
     })
  });
   this.printService.ExportFile(dataFormated,
                               "Industrias La Nutriciosa, SRL",
                                "Hoja de Transferencia Inventario",
                                "Transacción entre almacenes",
                                "Del Almacen",TypeReport.PDF,"RPT007")
}



}




