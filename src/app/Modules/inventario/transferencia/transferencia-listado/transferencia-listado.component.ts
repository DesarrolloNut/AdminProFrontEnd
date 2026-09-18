
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxPermissionsService } from 'ngx-permissions';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'src/app/core/authentication/service/authentication.service';
import { ResponseContenido } from 'src/app/core/http/model/ResponseContenido';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { ConfiguracionCompania } from 'src/app/Modules/configuraciones/models/ConfiguracionCompania';
import {TypeReport } from 'src/app/Services/PrintExportFile.service';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { EstadoGeneral } from 'src/app/shared/enums/EstadoGeneral';
import { EstadosGeneralesKeyEnum } from 'src/app/shared/enums/EstadosGeneralesKeyEnum';
import { Archivo } from 'src/app/shared/model/Archivo';
import { CambiarEstado } from 'src/app/shared/model/CambiarEstado';
import { ComboBox } from 'src/app/shared/model/ComboBox';
import Swal from 'sweetalert2';
import { DetalleTransferenciaInventarioRequest } from '../models/DetalleTransferenciaInventarioRequest';
import { RequestTransferenciaInventario } from '../models/RequestTransferenciaInventario';
import { SolicitudArticuloDetalle } from '../models/SolicitudArticuloDetalle';
import { SolicitudCompraListadoViewModel } from '../models/SolicitudCompraListadoViewModel';
import { TransferenciaInventario } from '../models/TransferenciaInventario';
import { Imprimir } from '../print/ImprimirTransferenciaInventario';

@Component({
  selector: 'app-transferencia-listado',
  templateUrl: './transferencia-listado.component.html',
  styleUrls: ['./transferencia-listado.component.scss']
})
export class TransferenciaListadoComponent implements OnInit {

  // COPIAR AL CREAR UN LISTADO NUEVO
  Search: string = "";
  paginaNumeroActual = 1;
  Cargando: boolean = false;
  CargandoBar: boolean = false;
  totalPaginas: number = 0;
  paginaSize: number = 5;
  paginaTotalRecords: number = 0;
  data: SolicitudCompraListadoViewModel[] = [] //tu modelo

  cargandoAnexos: boolean
  solicitudSeleccionada: TransferenciaInventario;
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

  total: number;
  btnConvertirCargando: boolean;
  urlCarpetaArchivosCompartidos: string;
  btnConfirmarCargando: boolean;
  btnCargandoPrint: boolean;
  estadoTransferencia: any;
  configuracionCompania: ConfiguracionCompania;
  transferenciaInventarioId: number;
  anexoRecepcion: any;
  anexoEnvio: any;


  constructor(private toastService: ToastrService,
    private httpService: BackendService,
    private authService: AuthenticationService,
    private modalService: NgbModal,
    private printService :Imprimir ,
    private router: Router,
    public permissionsService: NgxPermissionsService,
  ) { }
  ngOnInit(): void {
    this.getData();
    this.getConfiguracionCompnia();
  }
  getData() {
    this.Cargando = true;
    let parametros = new RequestTransferenciaInventario();
    parametros.CompaniaId =Number(this.authService.tokenDecoded.primarygroupsid),
    parametros.UsuarioId=Number(this.authService.tokenDecoded.nameid),
    this.httpService.DoPostAny<any>(DataApi.TransferenciaInventario,
      "GetTransferenciaInventarioListado", parametros).subscribe(x => {
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
  openModalSolicitud(content, item: TransferenciaInventario) {
    this.modalService.open(content, { windowClass: 'my-class'});
    this.solicitudSeleccionada = item
    this.files = []
  }

  openModalDetalle(content, item: any) {
    this.solicitudSeleccionada = item;
    this.almacenOrigin=item.almacenOrigen;
    this.almacenDestino=item.almacenDestino;
    this.usuario=item.usuario;
    this.modalService.open(content, { size: 'lg' });
    this.estadoTransferencia=item.nombreEstado;
    this.transferenciaInventarioDetalles = [];
    this.getTransferenciaDetalles(Number(item.id),item.usuarioId);
  }
 // ConfiguracionCompania

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
  getTransferenciaDetalles(id: number,usuarioId:number) {
    this.loadingSolicitudDetalle = true;
    let parametros = new DetalleTransferenciaInventarioRequest();
    parametros.companiaId =Number(this.authService.tokenDecoded.primarygroupsid),
    parametros.usuarioId=usuarioId, 
    parametros.id=id
    this.httpService.DoPostAny<SolicitudArticuloDetalle>(DataApi.TransferenciaInventario,
      "GetTransferenciaInventarioDetalles", parametros).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.transferenciaInventarioDetalles = response.records;
        }
        this.loadingSolicitudDetalle = false;
      }, error => {
        this.loadingSolicitudDetalle = false;
        this.toastService.error("No se pudo obtener el detalle", "Error conexion al servidor");
        this.modalService.dismissAll()
      });
  }

  confirmarTransferenciaInventario(content,idTransferenciaInventario:number){
    this.transferenciaInventarioId=idTransferenciaInventario;
   
      if(this.configuracionCompania.configValue)
      {
    
        this.modalService.open(content, { size: 'lg' });
      }
      else{
  
        this.confirmar(idTransferenciaInventario)
      }
  }

  openModalAnexo(content, item: any) {
    this.modalService.open(content, { size: 'lg' });
    this.files = []
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
        this.toastService.error("File size should be less than 20MB")
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
  uploadTransferenciaInventarioAnexosEnvio() {
    const formData = new FormData();
    formData.append("id", this.transferenciaInventarioId.toString());
    formData.append("NameKeyModulo",EstadosGeneralesKeyEnum.TRANSFERENCIA);
    for(let i = 0; i < this.files.length; i++)
    {
      formData.append("Files", this.files[i]);
   
    }
    this.httpService.DoPostAny<any>(DataApi.TransferenciaInventario,
      "UploadTransferenciaInventarioAnexosEnvioAsync", formData).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0], "Error");
        } else {
          this.toastService.success("Realizado", "OK");
          this.confirmar(this.transferenciaInventarioId)
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
actualizarARecibido(id:number) {
  let parametros = new CambiarEstado();
  parametros .Id = id,
  parametros.Estado= EstadoGeneral.RECIBIDO,
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

validarContidadProductoTransferenciaInventario(idDetalletransferencia:number,encabezadoTransferenciaInventarioId:number ){
  Swal.fire({
    title: 'Estas seguro que quieres validar esta  transferencia?',
    text: 'Luego de ser confirmado no se puedo desahacer.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'SI',
    cancelButtonText: 'NO'
  }).then((result) => {
    if (result.value) {
      this.validar(idDetalletransferencia);
      this.actualizarARecibido(encabezadoTransferenciaInventarioId)
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

validar(id:number) {
  let parametros = new CambiarEstado();
  parametros .Id = id,
  parametros.Estado= EstadoGeneral.CONFIRMADO,
  this.btnConfirmarCargando = true;
  this.httpService.DoPostAny<any>(DataApi.TransferenciaInventario,
    "ValidarDiferencias", parametros).subscribe(response => {
      if (!response.ok) {
        this.toastService.error(response.errores[0], "Error");
      } else {
        this.toastService.success("Realizado", "OK");
        this.modalService.dismissAll();
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
  let parametros = new DetalleTransferenciaInventarioRequest();
  parametros.companiaId =Number(this.authService.tokenDecoded.primarygroupsid),
  parametros.usuarioId=encabezado.usuarioId, 
  parametros.id=Number(encabezado.id)
  this.loadingSolicitudDetalle = true;
    this.httpService.DoPostAny<SolicitudArticuloDetalle>(DataApi.TransferenciaInventario,
      "GetTransferenciaInventarioDetalles", parametros).subscribe(response => {
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
      Codigo:x.codigoReferencia,
      Descripcicon:x.nombre,
      AlmacenDestino:x.codigoreferenciaAlmacenDestino,
      UnidadMedida:x.unidadMedida,
      Envio:x.envio,
      Recepcion:(x.recepcion>0? x.recepcion : undefined)
     })
  });
   this.printService.ExportFile(dataFormated,
                               "Industrias La Nutriciosa, SRL",
                                "Hoja de Transferencia Inventario",
                                "Transacción entre almacenes",
                                "Del Almacen",TypeReport.PDF,"RPT007")
}

confirmarRecepcion(content,transferenciaInventarioId:number)
{
 this.files=[];
 this.transferenciaInventarioId=transferenciaInventarioId;
 if(this.configuracionCompania.configValue)
    {
      this.modalService.open(content, { size: 'lg' });
    }
    else{
      this.router.navigateByUrl(`/inventario/transferencia/${transferenciaInventarioId}`);
    }
}

uploadTransferenciaInventarioAnexosRecibido() {
  
  const formData = new FormData();
  formData.append("id", this.transferenciaInventarioId.toString());
  formData.append("NameKeyModulo",EstadosGeneralesKeyEnum.TRANSFERENCIA);
  for(let i = 0; i < this.files.length; i++)
  {
    formData.append("Files", this.files[i]);
  }
  this.httpService.DoPostAny<any>(DataApi.TransferenciaInventario,
    "UploadTransferenciaInventarioAnexosRecibidoAsync", formData).subscribe(response => {
      if (!response.ok) {
        this.toastService.error(response.errores[0], "Error");
      } else {
        this.toastService.success("Realizado", "OK");
        this.router.navigateByUrl(`/inventario/transferencia/${this.transferenciaInventarioId}`);
         this.modalService.dismissAll()
        this.files = []
      }
    }, error => { 
      this.toastService.error("Error conexion al servidor");
    });
}

mostrarAnexosSubidos(content,item:any){
  item.archivoEnvio !==null?this.anexoEnvio=item.archivoEnvio:"#"
  item.anexoRecepcion !==null?this.anexoRecepcion=item.anexoRecepcion:"#"
  this.modalService.open(content, { size: 'lg' });
}


                                                            



}







