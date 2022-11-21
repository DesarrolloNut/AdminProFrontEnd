
import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxPermissionsService } from 'ngx-permissions';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2'
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
import { ConfiguracionCompania } from 'src/app/Modules/configuraciones/models/ConfiguracionCompania';

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

  estadosAutorizacion: ComboBox[];
  estadoAutorizacionFinal: number;
  loadingSolicitudDetalle: boolean;
  transferenciaInventarioDetalles:  SolicitudArticuloDetalle[] = [];
  solicitudDevolucionDetalle:any;
  configuracionCompania: ConfiguracionCompania;

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
  estadoDevolucion: any;
  constructor(private toastService: ToastrService,
    private httpService: BackendService,
    private authService: AuthenticationService,
    private modalService: NgbModal,
    public permissionsService: NgxPermissionsService,
  ) { }
  ngOnInit(): void {
    this.getAutorizacionUsuario();
    this.getData();
    this.getConfiguracionCompnia();
  }
  getData() {
    this.Cargando = true;
    let parametros: Parametro[] = [
      { key: "Search", value: this.Search },
      { key: "namekey", value: EstadosGeneralesKeyEnum.INVENTARIOSOLICITUDDEVOLUCION }
   ]
    this.httpService.GetAllWithPagination<SolicitudDevolucion>(DataApi.SolicitudDevolucion, "GetSolicitudDevolucionListado", "ID", this.paginaNumeroActual,
      this.paginaSize, true, parametros).subscribe(x => {
        if (x.ok) {
          this.data = x.records;
         
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
    this.getTransferenciaDetalles(String(item.id));
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
    this.getArchivosSubidos(item.id);
    this.estadoDevolucion=item.estado;
  }

  getArchivosSubidos(id:number) {
    this.cargandoAnexos = true;
    this.httpService.DoPostAny<Archivo>(DataApi.SolicitudDevolucion,
      "GetSolicitudDevolucionArchivos", id).subscribe(response => {
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
  fileExists(username) {
    return this.filesSubidos.some(function(el) {
      return el.nombre === username;
    }); 
  }
  setFiles(archivos) {
    for (let i = 0; i < archivos.length; i++) {
      if(this.fileExists(archivos[i].name)){
        this.toastService.error(`El archivo ${archivos[i].name}. ya existe.`);
        return;
      }
      let extensionAllowed = {"png":true,"jpeg":true,"jpg":true,"pdf":true};
      if (archivos[i].size / 1024 / 1024 > 20) {
        this.toastService.error(`El tamano del archivo debe ser menos a 20MB`);
        return;
      }
      if (extensionAllowed) {
        var nam = archivos[i].name.split('.').pop();
        if (!extensionAllowed[nam]) {
          this.toastService.error(`Por favor cargue archivo  ${Object.keys(extensionAllowed)}`);
          return;
        }
      }
      if(this.files.find(x=>x.name === archivos[i].name))
      {
        this.toastService.error(`Este archivo ya esta selecccionado.`);
        return;
      }
      this.files.push(archivos[i]);
    }
  }
  subirArchivosAlServidor() {
    const formData = new FormData();
    formData.append("id", this.solicitudDevolucionID.toString());
    formData.append("NameKeyModulo",EstadosGeneralesKeyEnum.INVENTARIOSOLICITUDDEVOLUCION);
    for(let i = 0; i < this.files.length; i++)
    {
      formData.append("Files", this.files[i]);
    }
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
  deleteSolicitudDevolucionArchivoByID(id: number) {
    this.loadingSolicitudDetalle = true;
    this.httpService.DoPostAny<string>(DataApi.SolicitudDevolucion,
      "DeleteSolicitudDevolucionArchivo", id).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.toastService.success("Realizado");
          this.getArchivosSubidos(this.solicitudDevolucionID);
        }
        this.loadingSolicitudDetalle = false;
      }, error => {
        console.error(error)
        this.loadingSolicitudDetalle = false;
        this.toastService.error("No se pudo obtener la url de los archivos", "Error conexion al servidor");
      });
  }

  buscarArchivosSubidos(id:number) {
    this.httpService.DoPostAny<Archivo>(DataApi.SolicitudDevolucion,
      "GetSolicitudDevolucionArchivos", id).subscribe(response => {
        if (!response.ok) {
        return 0;
        } else {
          return  response.records.length;
        }
      }, error => {
        this.cargandoAnexos = false;
        console.error(error)
      });
  }

  confirmarSolicitudDevolucion(id:number,accion: string){
    this.getArchivosSubidos(id)
    Swal.fire({
      title: 'Estas seguro que quieres confirmar esta devolución?',
      text: 'Luego de ser confirmado no se puedo desahacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'SI',
      cancelButtonText: 'NO'
    }).then((result) => {
      if (result.value) {
        this.autorizarSolicitudDevolucion(id,accion);
      } 
      else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire(
          'Cancelado',
          'Se ha cancelado la operacion.)',
          'error'
        )
      }
    })

  }
  autorizarSolicitudDevolucion(id:number,accion: string) {
   if(this.filesSubidos.length <=0 && this.configuracionCompania.configValue){
    Swal.fire(
      'Error',
      'Este registro no tiene anexo.',
      'error'
    )
    return;
   }
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
        Swal.fire(
          'Confirmado',
          'Se ha autorizado la solicitud.',
          'success'
        )
         this.getData();
       }
       this.btnActualizarCargando = false;
     }, error => {
       this.btnActualizarCargando = false;
       this.toastService.error("Error conexion al servidor");
     });
 }

 
 getConfiguracionCompnia() {
  this.loadingSolicitudDetalle = true;
  let parametros = new ConfiguracionCompania();
  parametros.companiaId =Number(this.authService.tokenDecoded.primarygroupsid),
  parametros.nameKeyModulo=EstadosGeneralesKeyEnum.TRANSFERENCIA, 
  this.httpService.DoPostAny<ConfiguracionCompania>(DataApi.Configuracion,
    "ConfiguracionCompania", parametros).subscribe(response => {
      if (!response.ok) {
        this.toastService.error(response.errores[0]);
      } else {
        this.configuracionCompania=response.records[0];
      }
      this.loadingSolicitudDetalle = false;
    }, error => {
      this.loadingSolicitudDetalle = false;
      this.toastService.error("No se pudo la configuracion de la compania", "Error conexion al servidor");
      this.modalService.dismissAll()
    });
}

}












