import { HttpEventType, HttpRequest } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxPermissionsService } from 'ngx-permissions';
import { ToastrService } from 'ngx-toastr';
import { filter } from 'rxjs/operators';
import { AuthenticationService } from 'src/app/core/authentication/service/authentication.service';
import { Parametro } from 'src/app/core/http/model/Parametro';
import { ResponseContenido } from 'src/app/core/http/model/ResponseContenido';
import { BackendService } from 'src/app/core/http/service/backend.service';

import { DataApi } from 'src/app/shared/enums/DataApi.enum';

import { EstadosGeneralesKeyEnum } from 'src/app/shared/enums/EstadosGeneralesKeyEnum';
import { Archivo } from 'src/app/shared/model/Archivo';

import { ComboBox } from 'src/app/shared/model/ComboBox';
import { SolicitudArticuloDetalle } from '../../transferencia/models/SolicitudArticuloDetalle';
import { SolicitudDevolucion } from '../models/SolicitudDevolucion';

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
  check:number;
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
  autorizado: number;
  btnActualizarCargando: boolean;
  solicitudDevoluciones: SolicitudDevolucion[];
  solicitudDevolucionID: any;
  filSelecccionado: any;
  filaSelecccionado: any;
  constructor(private toastService: ToastrService,
    private httpService: BackendService,
    private authService: AuthenticationService,
    private modalService: NgbModal,
    public permissionsService: NgxPermissionsService,
  ) { }
  ngOnInit(): void {
   
    this.getAutorizacionUsuario();
    this.getData();
  }
  getData() {
    this.Cargando = true;
    let parametros: Parametro[] = [{ key: "Search", value: this.Search }]
    this.httpService.GetAllWithPagination<SolicitudDevolucion>(DataApi.SolicitudDevolucion, "GetSolicitudDevolucionListado", "ID", this.paginaNumeroActual,
      this.paginaSize, true, parametros).subscribe(x => {
        if (x.ok) {
          this.data = x.records;
          this.check=1;
          this.data=x.records;
          
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
  getAutorizacionUsuario() {
    let parametro = {
      "UsuarioID": Number(this.authService.tokenDecoded.nameid),
      "KeynameModule": EstadosGeneralesKeyEnum.INVENTARIOSOLICITUDDEVOLUCION,
    }
    this.httpService.DoPostAny<any>(DataApi.NivelAutorizacion,
      "GetEstadoAutorizacionUsuario", parametro).subscribe(response => {
        if (!response.ok) {
          //Si el usuario no tiene permiso la variable es igual a null y no se mostrara el boton autorizar
          this.autorizado=null;
        } else {
          
          this.autorizado=response.valores[0];
        }
        console.log(this.autorizado)
      }, error => {
        this.toastService.error("No se pudo obtener el estado de autorización del usuario", "Error conexion al servidor");
        setTimeout(() => {
          this.getAutorizacionUsuario()
        }, 1000);

      });

  }
  openModalAnexo(content, item: any) {
    this.modalService.open(content, { size: 'lg' });
    this.files = []
    this.solicitudDevolucionID=item.id;
    this.filaSelecccionado=item;

  }
  setFiles(files) {
    this.files = []
    for (let i = 0; i < files.length; i++) {
      let extensionAllowed = {"png":true,"jpeg":true,"jpg":true,"pdf":true};

      if (files[i].size / 1024 / 1024 > 20) {
        alert("File size should be less than 20MB")
        this.toastService.error(`El tamano del archivo debe ser menos a 20MB`);
        return;
      }
      if (extensionAllowed) {
        var nam = files[i].name.split('.').pop();
        if (!extensionAllowed[nam]) {
          this.toastService.error(`Por favor cargue archivo  ${Object.keys(extensionAllowed)}`);
          return;
        }
      }
      const element = files[i];
      this.files.push(element)
    }

  }

  subirArchivosAlServidor() {
    const formData = new FormData();
    formData.append("id", this.solicitudDevolucionID.toString());
    for (let file of this.files)
      formData.append("Files", file);
    this.httpService.DoPostAny<any>(DataApi.SolicitudDevolucion,
      "UploadSolicitudDevolucionAnexos", formData).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0], "Error");
        } else {
          this.toastService.success("Realizado", "OK");
           this.modalService.dismissAll()
          this.files = []
        }
      }, error => { 
        this.toastService.error("Error conexion al servidor");
      });


  }



  onDeleteitem(index: number) {
    this.files.splice(index, 1);
  }

  autorizarSolicitudDevolucion(id:number,accion:string) {
    let parametros = new SolicitudDevolucion();
    parametros.companiaId =Number(this.authService.tokenDecoded.primarygroupsid),
    parametros.id=id, 
    parametros.estadoId=accion=="Autorizar" ? this.autorizado:4
   this.btnActualizarCargando = true;
   this.httpService.DoPostAny<any>(DataApi.SolicitudDevolucion,
     "AutorizarSolicitudDevolucion", parametros).subscribe(response => {
       if (!response.ok) {
         this.toastService.error(response.errores[0], "Error");
       } else {
         this.toastService.success("Realizado", "OK");
         this.getData();
       }
       this.btnActualizarCargando = false;
     }, error => {
       this.btnActualizarCargando = false;
       this.toastService.error("Error conexion al servidor");
     });
 }

}












