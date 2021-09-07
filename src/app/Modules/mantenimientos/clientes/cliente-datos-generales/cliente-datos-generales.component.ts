import { MapsAPILoader, Marker } from '@agm/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { ViewportScroller } from '@angular/common';
import { Component, ElementRef, EventEmitter, HostListener, Input, NgZone, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { thresholdFreedmanDiaconis } from 'd3';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'src/app/core/authentication/service/authentication.service';
import { Parametro } from 'src/app/core/http/model/Parametro';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { ParametrosCita } from 'src/app/Modules/turno/models/ParametrosCita';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { ComboBox } from 'src/app/shared/model/ComboBox';
import { cedulaestructura, validaExistCedulaORNC } from 'src/app/shared/validators/cedula-estructura.validator';
import { Cliente, ClienteTabsValida, Coordenadas } from '../models/Cliente';

const fadeInOut = trigger('fadeInOut', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate(200, style({ opacity: 1 }))
  ]),
  transition(':leave', [
    animate(200, style({ opacity: 0 }))
  ])
]);
@Component({
  selector: 'app-cliente-datos-generales',
  templateUrl: './cliente-datos-generales.component.html',
  styleUrls: ['./cliente-datos-generales.component.scss'],
  animations: [fadeInOut]
})

export class ClienteDatosGeneralesComponent implements OnInit {
  @Input() clientId = 0;
  @Output() clienteIdCreado = new EventEmitter();
  @Output() clienteTabsValida = new EventEmitter<ClienteTabsValida>();
  @Output() goTabByKey = new EventEmitter<string>();
  @Output() clienteExtraInfo = new EventEmitter<Cliente>();


  @ViewChild('contentModal') content: any;

  FormGenerales: FormGroup;

  //BOOLEANOS
  btnGuardarCargando = false;
  actualizando       = false;
  cargando           = false
  loadingDocumentos  = false;
  loadingCiudades    = false;
  loadingProvincias  = false;
  loadingSectores    = false;
  loadingSubSectores = false;
  buscandoDocumento  = false;
  submitted          = false;
  loadingListaPrecio = false;
  loadingTipoCliente = false;
  loadingTipoComprobantes = false;

  //LISTAS
  ciudades               : ComboBox[];
  sectores               : ComboBox[];
  subSectores            : ComboBox[];
  provincias             : ComboBox[];
  documentos             : ComboBox[];
  ListaPrecio            : any[];
  TipoCliente            : any[];
  estados                : ComboBox[]
  tiposComprobantes      : ComboBox[]
  clienteTabsValidaIterable = new ClienteTabsValida();

  //OBJETOS Y DEMAS
  TipoSexo: any[] = [{ codigo: 'H', nombre: 'Hombre' }, { codigo: 'M', nombre: 'Mujer' }];

  latitud:number;
  longitud:number;  
  
  coordenadas: EventEmitter<Coordenadas> = new EventEmitter<Coordenadas>();
  searchLocalidadEvent:EventEmitter<string> = new EventEmitter<string>();
  searchLocalidad:string;

  constructor(
    private toastService: ToastrService,
    private route: ActivatedRoute,
    private httpService: BackendService,
    private router: Router,
    config: NgbModalConfig,
    private modalService: NgbModal,
    private auth: AuthenticationService,
    private formBuilder: FormBuilder,
    ) {
    config.backdrop = 'static';
    config.keyboard = false;
  }
 
  ngOnInit() {
    //CREACION DE FORMULARIO
    this.createForm();

    if (this.clientId > 0) {

      this.getClienteByID(this.clientId);
      this.actualizando = true;
    }

    this.getProvincias()
    this.getDocumentosTipo();
    this.getTipoCliente();
    this.getListaPrecio();
    this.getTipoComprobante();
    this.clearOrputValidatosSomeField();
    this.scrollToTop();

  }

  ngAfterViewInit() {
    if (this.clientId <= 0) {
      let coors= new Coordenadas();
      coors.latitud= 0;
      coors.longitud= 0;
      this.coordenadas.emit(coors);
  
    }
  }
  onSubmit() {
    this.submitted = true; 
  
    if (!this.actualizando)
      this.f.sucursalID.setValue(Number(this.auth.tokenDecoded.groupsid))
  
    if (this.FormGenerales.invalid)
      return;
  
    this.guardarCliente();
  }
  scrollToTop(){
    window.scroll({
      top: 0, 
      left: 0, 
      behavior: 'smooth' 
     });
  }
  private createForm() {

    this.FormGenerales = this.formBuilder.group({
      id: [0],
      sucursalID: [0, [Validators.required]],
      clienteTipoID: [null, [Validators.required]],
      nombres: [null,  [Validators.required]],
      apellidos: [null,  [Validators.required] ],
      documento: [null, [Validators.required, Validators.minLength(9)]],
      email: [null, [Validators.required, Validators.email]],
      telefono:[null,  [Validators.required] ],
      documentoTipoID: [1, [Validators.required]], //cedula por defecto
      fechaNacimiento: [null,  [Validators.required] ],
      fechaRegistrado: [new Date(),],
      estadoID: [0,],
      sexo: [null,[Validators.required]],
      codigoReferencia: [null,],

      calle: [null, [Validators.required]],
      numero: [null, [Validators.required]],
      residencial: [null],
      apartamento: [null],
      referencia: [null],
      provinciaID: [null, Validators.required],
      ciudadID: [null, Validators.required],
      sectorID: [null, Validators.required],
      subSectorID: [null, Validators.required],

      tipoComprobante: [null, [Validators.required]],

      frecuenciaVisitaId: [0, [Validators.required]],
      limiteCredito: [0, [Validators.required]],
      condicionPagoId: [0, [Validators.required]],
      plazoId: [0, [Validators.required]],
      rutaId: [0, [Validators.required]],
      listaPrecioId: [0, [Validators.required]],
      longitud: [null, [Validators.required]],
      latitud: [null, [Validators.required]],
      estadoERPID: [0],
      // contactos: new FormArray([])
    },
      {
        validator: cedulaestructura('documento', 'documentoTipoID'),
      });
  }

  get f() { return this.FormGenerales.controls; } // acceder a los controles del formulario para no escribir tanto codigo en el html



  guardarCliente() {
  
 
    let metodo: string = this.actualizando ? "UpdateCliente" : "CrearCliente";
    let valueBool = this.f.estadoID.value?1:0;

    this.f.estadoID.setValue(valueBool)

    this.btnGuardarCargando = true;

    if(this.f.documentoTipoID.value==2){
      this.f.apellidos.setValue('');
      this.f.email.setValue('');
      this.f.fechaNacimiento.setValue(new Date());
      this.f.sexo.setValue('');
    }
   // console.log(this.FormGenerales)
    let param = { "cliente": this.FormGenerales.value }
    this.httpService.DoPostAny<Cliente>(DataApi.Cliente,
      metodo, this.FormGenerales.value).subscribe(response => {
         
        if (!response.ok) {
          this.toastService.error(response.errores[0], "Error");
          this.btnGuardarCargando = false;
        } else {
            this.scrollToTop();
            this.toastService.success("Realizado", "OK");
          if(!this.actualizando){
            this.clientId=response.valores[0].clienteId;
            this.onClienteCreado(this.clientId);
            this.onClienteTabsValida(response.valores[0])
          }
          this.clienteExtraInfo.emit(this.FormGenerales.value)
          this.router.navigateByUrl('/mantenimientos/cliente/'+this.clientId);
        }

        this.btnGuardarCargando = false;
      }, error => {
        this.btnGuardarCargando = false;
        this.toastService.error("Error conexion al servidor");
      });

  }

  onClienteCreado(id:number) {
    this.clienteIdCreado.emit(id);
  }

  onClienteTabsValida(obj:ClienteTabsValida) {
    this.clienteTabsValida.emit(obj);

    this.clienteTabsValidaIterable=obj
    
    //SI ALGUNA INFORMACION DE CLIENTE REQUERIDA ESTA PENDIENTE POR COMPLETAR
    //SE DESPLEGARA EL MODAL
    if(this.clienteTabsValidaIterable.tabsValida.filter(x=>!x.ok).length>0){
     this.openModal(this.content);
   }
  }

  getClienteByID(id: number) {
    this.cargando = true;
    this.httpService.DoPostAny<Cliente>(DataApi.Cliente,
      "GetClienteByID", id).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          //validar que existe
          if (response.records.length > 0) {
            let cliente = response.records[0];
            
            //Transforma DATA
            cliente.documentoTipoID = cliente.documentoTipoID==null? 0 :cliente.documentoTipoID
            cliente.provinciaID = cliente.provinciaID<=0 ? null : cliente.provinciaID
            cliente.ciudadID = cliente.ciudadID<=0 ? null : cliente.ciudadID
            cliente.sectorID = cliente.sectorID<=0 ? null : cliente.sectorID
            cliente.subSectorID = cliente.subSectorID<=0 ? null : cliente.subSectorID
            cliente.tipoComprobante = cliente.tipoComprobante<=0 ? null : cliente.tipoComprobante

            this.FormGenerales.setValue(cliente);

            this.clienteExtraInfo.emit(cliente);

            let coors= new Coordenadas();
            coors.latitud=parseFloat( cliente.latitud);
            coors.longitud=parseFloat( cliente.longitud);
            this.coordenadas.emit(coors);
            this.getCiudades();
            this.getSectores();
            this.getSubSectores();
            this.getClienteTabsValidaByID(this.clientId)
          } else {
            this.toastService.warning("Cliente no encontrado");
            this.router.navigateByUrl('/mantenimientos/cliente');
          }
        }
        this.cargando=false;
      }, error => {
        this.cargando = false;
        this.toastService.error("Error conexion al servidor");
      });
  }
  getClienteTabsValidaByID(id: number) {
    this.cargando = true;
    this.httpService.DoPostAny<Cliente>(DataApi.Cliente,
      "GetClienteTabsValidaByID", id).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          //validar que existe
          if (response.valores?.length > 0) {
              this.onClienteTabsValida(response.valores[0])
          } else {
            this.toastService.warning("Ha ocurrido un error");
          }
        }
        this.cargando=false;
      }, error => {
        this.cargando = false;
        this.toastService.error("Error conexion al servidor");
      });
  }

  //METODOS COMBOBOX
getCiudades() {
  if(this.f.provinciaID.value==null){
    return;
  }
  let parametros: Parametro[] = [{ key: "ProvinciaId", value: this.f.provinciaID.value }]
  this.loadingCiudades = true;
  this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
    "GetCiudades", parametros).subscribe(response => {

      if (!response.ok) {
        this.toastService.error(response.errores[0]);
      } else {
        this.ciudades = response.records;
      }
      this.loadingCiudades = false;
    }, error => {
      this.loadingCiudades = false;
      this.toastService.error("No se pudo obtener las ciudades", "Error conexion al servidor");

      setTimeout(() => {
        this.getCiudades()
      }, 1000);

    });
}
getProvincias() {
  this.loadingProvincias = true;
  this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
    "GetProvincias", null).subscribe(response => {

      if (!response.ok) {
        this.toastService.error(response.errores[0]);
      } else {
        this.provincias = response.records;
      }
      this.loadingProvincias = false;
    }, error => {
      this.loadingProvincias = false;
      this.toastService.error("No se pudo obtener las provincias", "Error conexion al servidor");

      setTimeout(() => {
        this.getProvincias()
      }, 1000);

    });
}

getTipoComprobante() {
  this.loadingTipoComprobantes = true;
  this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
    "GetTipoComprobante", null).subscribe(response => {

      if (!response.ok) {
        this.toastService.error(response.errores[0]);
      } else {
        if(this.f.documentoTipoID.value==1){
         response.records.filter(x=>x.codigo==1).map(d=>{d.disabled=true;})
        }
        this.tiposComprobantes = response.records;
      }
      this.loadingTipoComprobantes = false;
    }, error => {
      this.loadingTipoComprobantes = false;
      this.toastService.error("No se pudo obtener los tipos de comprobantes", "Error conexion al servidor");

      setTimeout(() => {
        this.getTipoComprobante()
      }, 1000);

    });
}

getSectores(event?:ComboBox) {
  if(this.f.ciudadID.value==null){
     return;
  }
  this.searchLocalidad= event?.nombre

    if(this.f.longitud.value==null ||this.f.longitud.value==''){
      this.searchLocalidadEvent.emit(this.searchLocalidad);
     }
  let parametros: Parametro[] = [{ key: "ciudadId", value: this.f.ciudadID.value }]
  this.loadingSectores = true;
  this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
    "GetSectores", parametros).subscribe(response => {

      if (!response.ok) {
        this.toastService.error(response.errores[0]);
      } else {
        this.sectores = response.records;
      }
      this.loadingSectores = false;
    }, error => {
      this.loadingSectores = false;
      this.toastService.error("No se pudo obtener los sectores", "Error conexion al servidor");

      setTimeout(() => {
        this.getSectores()
      }, 1000);

    });
}
getSubSectores() {
  if(this.f.sectorID.value==null){
    return;
 }
  let parametros: Parametro[] = [{ key: "sectorId", value: this.f.sectorID.value }]
  this.loadingSubSectores = true;
  this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
    "GetSubSectores", parametros).subscribe(response => {

      if (!response.ok) {
        this.toastService.error(response.errores[0]);
      } else {
        this.subSectores = response.records;
      
      }
      this.loadingSubSectores = false;
    }, error => {
      this.loadingSubSectores = false;
      this.toastService.error("No se pudo obtener los Subsectores", "Error conexion al servidor");

      setTimeout(() => {
        this.getSubSectores()
      }, 1000);

    });
}

getTipoCliente() {
  this.loadingTipoCliente = true;
  this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
    "GetTipoClienteComboBox", null).subscribe(response => {

      if (!response.ok) {
        this.toastService.error(response.errores[0]);
      } else {
        this.TipoCliente = response.records;
      }
      this.loadingTipoCliente = false;
    }, error => {
      this.loadingTipoCliente = false;
      this.toastService.error("No se pudo obtener las categorias", "Error conexion al servidor");

      setTimeout(() => {
        this.getTipoCliente();
      }, 1000);

    });
}

getDocumentosTipo() {
  this.loadingDocumentos = true;
  this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
    "GetDocumentosTipo", null).subscribe(response => {

      if (!response.ok) {
        this.toastService.error(response.errores[0]);
      } else {
        this.documentos = response.records;
      }
      this.loadingDocumentos = false;
    }, error => {
      this.loadingDocumentos = false;
      this.toastService.error("No se pudo obtener los documentos", "Error conexion al servidor");

      setTimeout(() => {
        this.getDocumentosTipo()
      }, 1000);

    });
}

buscarCliente(documento: string) {
  this.buscandoDocumento = true;

  let parametros = new ParametrosCita();
  parametros.clienteDocumento = documento;

  this.httpService.DoPostAny<Cliente>(DataApi.Cliente,
    "GetClienteOPadronDatos", parametros).subscribe(response => {

      if (response.ok) {
        if (response != null && response.ok && response.records != null && response.records.length > 0) {
          let cliente = response.records[0];

          this.f.nombres.setValue(cliente.nombres);
          this.f.apellidos.setValue(cliente.apellidos);
          // this.f.celular.setValue(cliente.celular);
 
        } else {
          this.toastService.warning("Datos no encontrados");
          // this.f.nombres.setValue(null);
          // this.f.apellidos.setValue(null);
          // this.f.celular.setValue(null);
        }

      } else {
        this.toastService.error(response.errores[0]);
      }

      this.buscandoDocumento = false;
    }, error => {
      this.buscandoDocumento = false;
      this.toastService.error("Error conexion al servidor");
    });

}
buscarClienteByRncOCedula(documento: string,documentoTipoID:number) {
  this.buscandoDocumento = true;

  let parametros = new ParametrosCita();
  parametros.clienteDocumento = documento;
  parametros.documentoTipoID = documentoTipoID;

  this.httpService.DoPostAny<Cliente>(DataApi.Cliente,
    "GetClientePadronDatosOByRnc", parametros).subscribe(response => {

      if (response.ok) {
        if (response != null && response.ok && response.records != null && response.records.length > 0) {
          let cliente = response.records[0];

          this.f.nombres.setValue(cliente.nombres);
          this.f.apellidos.setValue(cliente.apellidos!=null?cliente.apellidos:"");
          // this.f.celular.setValue(cliente.celular);

        } else {
          this.toastService.warning("Datos no encontrados");
         // this.f.nombres.setValue(null);
          // this.f.celular.setValue(null);
        }
      } else {
        this.toastService.error(response.errores[0]);
      }
      this.buscandoDocumento = false;
    }, error => {
      this.buscandoDocumento = false;
      this.toastService.error("Error conexion al servidor");
    });

}
  getListaPrecio() {
    this.loadingListaPrecio = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetListaPreciosComboBox", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.ListaPrecio = response.records;
        }
        this.loadingListaPrecio = false;
      }, error => {
        this.loadingListaPrecio = false;
        this.toastService.error("No se pudo obtener las categorias", "Error conexion al servidor");

        setTimeout(() => {
          this.getListaPrecio();
        }, 1000);

      });
  }



//METODOS LOGIC
onDocumentoKeyUp() {


  // this.f.celular.setValue(null);

  if (this.f.documento.valid) {
    this.buscarClienteByRncOCedula(this.f.documento.value,this.f.documentoTipoID.value);
  }
}


onCoordsKeyUp() {
  let coors= new Coordenadas();
  coors.latitud=parseFloat( this.f.latitud.value  =="" || this.f.latitud.value  ==null ?0:this.f.latitud.value);
  coors.longitud=parseFloat(this.f.longitud.value =="" || this.f.longitud.value  ==null ? 0:this.f.longitud.value);
  this.coordenadas.emit(coors);
}
onProvinciaChange() {
  this.f.ciudadID.setValue(null)
  this.f.sectorID.setValue(null)
  this.f.subSectorID.setValue(null)
  this.sectores = []
  this.getCiudades()
}
onSectorChange() {
  this.f.subSectorID.setValue(null)
  this.subSectores = []
  this.getSubSectores()
}


onTipoDocumentoChange(tipo:ComboBox) {
  
 // this.f.documento.setValue(null)
  this.f.documento.setErrors(null);
  this.f.apellidos.setValue(null);
  this.buscarClienteByRncOCedula(this.f.documento.value,tipo.codigo);
  this.clearOrputValidatosSomeField();

  this.getTipoComprobante();  
}


clearOrputValidatosSomeField(){

  this.FormGenerales.get('documentoTipoID').valueChanges.subscribe(documentoTipo => {
     if(documentoTipo ==1){
      this.f.apellidos.setValidators([Validators.required]);
      this.f.email.setValidators([Validators.required, Validators.email]);
      this.f.fechaNacimiento.setValidators([Validators.required] );
     }else if (documentoTipo==2){
      this.f.apellidos.setValidators(null);
      this.f.email.setValidators(null);
      this.f.fechaNacimiento.setValidators(null);
      this.f.sexo.setValidators(null);
     } 

     this.f.apellidos.updateValueAndValidity();
     this.f.email.updateValueAndValidity();
     this.f.fechaNacimiento.updateValueAndValidity();
     this.f.sexo.updateValueAndValidity();

  })

}
setCoordsInForm(coords:any) {
 this.f.latitud.setValue( coords.lat.toString());
 this.f.longitud.setValue(coords.lng.toString());
}


onSubSectorChange(event:ComboBox){
  this.searchLocalidad=this.searchLocalidad+','+event.nombre;
   if(this.f.longitud.value==null ||this.f.longitud.value==''){
    this.searchLocalidadEvent.emit(this.searchLocalidad);
   }
}
openModal(content) {
  this.modalService.open(content, { size: 'lg' });

}
goTab(key="VISITAS_RUTAS"){
  this.goTabByKey.emit(key)
  this.modalService.dismissAll()
}
formatDescripcionByKeyName(keyName:string){
    switch (keyName) {
      case 'GENERALES':
        return 'Completar los datos generales del cliente'
      case 'VISITAS_RUTA':

        return 'Asignar una ruta de venta al cliente'

      case 'CONTACTOS':
        return 'Agregar al menos un contacto '

      case 'FINANZAS':
        return 'Campos pendientes por completar en Finanzas'

      case 'COMERCIAL':
        return 'Campos pendientes por completar en Comercial'
      default:
        '';
    }

}
formatDescripcionButtonByKeyName(keyName:string){
  switch (keyName) {
    case 'GENERALES':
      return 'Registrar'

    case 'VISITAS_RUTA':
      return 'Asignar ruta de venta'

    case 'CONTACTOS':
      return 'Agregar contacto'

    case 'FINANZAS':
      return 'Ir a Finanzas'

    case 'COMERCIAL':
      return 'Ir a Comercial'
    default:
        console.log("No such day exists!" + keyName);
  }

}

}



