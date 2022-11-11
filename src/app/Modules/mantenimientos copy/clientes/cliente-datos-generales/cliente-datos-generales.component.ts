
import { animate, style, transition, trigger } from '@angular/animations';
import { Component, EventEmitter, HostListener, Input, NgZone, OnInit, Output, ViewChild, AfterViewInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';

import { NgxPermissionsService } from 'ngx-permissions';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'src/app/core/authentication/service/authentication.service';
import { Parametro } from 'src/app/core/http/model/Parametro';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { ParametrosCita } from 'src/app/Modules/turno/models/ParametrosCita';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { ComboBox } from 'src/app/shared/model/ComboBox';
import { cedulaestructura } from 'src/app/shared/validators/cedula-estructura.validator';
import { Cliente, ClienteTabsValida, Coordenadas, ValidaExisteClienteViewModel } from '../models/Cliente';





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

export class ClienteDatosGeneralesComponent implements OnInit,AfterViewInit {
  @Input() clientId = 0;
  @Output() clienteIdCreado = new EventEmitter();
  @Output() clienteTabsValida = new EventEmitter<ClienteTabsValida>();
  @Output() goTabByKey = new EventEmitter<string>();
  @Output() clienteExtraInfo = new EventEmitter<Cliente>();
  minDate: Date ;
  clientIsPrincipal:boolean;
  @ViewChild('contentModal') content: any;
  @ViewChild('contentConfirmSucursalModal') contentConfirmSucursalModal: any;

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
  loadingClientesPrincipales = false;
  loadingSucursales = false;

  //LISTAS
  ciudades               : ComboBox[];
  sectores               : ComboBox[];
  subSectores            : ComboBox[];
  provincias             : ComboBox[];
  sucursales             : ComboBox[];
  documentos             : ComboBox[];
  ListaPrecio            : any[];
  TipoCliente            : any[];
  estados                : ComboBox[]
  tiposComprobantes      : ComboBox[]
  clientesPrincipalesComboBox : ComboBox[]
  clienteTabsValidaIterable = new ClienteTabsValida();
  isClientPrincipal = 0 ;

  valor0 = 0 ;
  valor1 = 1 ;

  //OBJETOS Y DEMAS
  TipoSexo: any[] = [{ codigo: 'M', nombre: 'Hombre' }, { codigo: 'F', nombre: 'Mujer' }];
  geoRegex = '^-?([1-8]?[1-9]|[1-9]0)\\.{1}\\d{1,6}';
  Ref="";
  nombreCliente="";
  Calle="";
  latitud:number;
  longitud:number;
  clientePadreSearched = new ValidaExisteClienteViewModel();
  coordenadas: EventEmitter<Coordenadas> = new EventEmitter<Coordenadas>();
  searchLocalidadEvent:EventEmitter<string> = new EventEmitter<string>();
  searchLocalidad:string;

  puedeModificarDocAndInfo=true;
  tipoDocumento:string="CEDULA";
  constructor(
    private toastService: ToastrService,
    private route: ActivatedRoute,
    private httpService: BackendService,
    private router: Router,
    public permissionsService: NgxPermissionsService,
    config: NgbModalConfig,
    private modalService: NgbModal,
    private auth: AuthenticationService,
    private formBuilder: FormBuilder,
    ) {
    config.backdrop = 'static';
    config.keyboard = false;
  }

  async ngOnInit() {
    //CREACION DE FORMULARIO
    this.createForm();

    if (this.clientId > 0) {
      this.puedeModificarDocAndInfo= await this.permissionsService.hasPermission('mantenimientos_cliente_editar_doc_and_info')
      console.log(this.puedeModificarDocAndInfo)
      this.getClienteByID(this.clientId);
      this.actualizando = true;
    }

    this.getProvincias();
    this.getSucursales();
    this.getDocumentosTipo();
    this.getTipoCliente();
    this.getClientesPrincipales();
    this.getListaPrecio();
    this.getTipoComprobante();
    this.clearOrputValidatosSomeField();
    this.scrollToTop();
    this.getHoraActual()
  }


  regexValidator(regex: RegExp, error: ValidationErrors): ValidatorFn {
    return (control: AbstractControl): {[key: string]: any} => {
      if (!control.value) {
        return null;
      }
      const valid = regex.test(control.value);
      return valid ? null : error;
    };
  }
  ngAfterViewInit() {
    if (this.clientId <= 0) {
      let coors= new Coordenadas();
      coors.latitud= 0;
      coors.longitud= 0;
      this.coordenadas.emit(coors);
    }

  }

  getHoraActual() {
    this.httpService.DoPost<ComboBox>(DataApi.Public,
        "GetHoraActual", null).subscribe(response => {

            if (!response.ok) {
                this.toastService.error(response.errores[0]);
            } else {

                this.minDate =  new Date(response.valores[0]);
                this.minDate.setFullYear(this.minDate.getFullYear()-18)
            }

        }, error => {
            this.toastService.error("Error conexion al servidor");
        });
}
  onSubmit() {
    this.submitted = true;

    if (this.FormGenerales.invalid){
      return;
    }
   this.f.isClientPrincipal.setValue(0);
    this.guardarCliente();
  }
  onSubmitWithoutAction() {
    this.submitted = true;

    if (!this.actualizando)
      this.f.sucursalID.setValue(Number(this.auth.tokenDecoded.groupsid))

    if (this.FormGenerales.invalid)
      return;
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
      clienteTipoID: [null, [Validators.required]],
      nombres: [null,  [Validators.required]],
      apellidos: [null,  [Validators.required] ],
      clienteNombre: [null,  [Validators.required,Validators.maxLength(100)]],
      documento: [null, [Validators.required,Validators.minLength(9),Validators.maxLength(11)]],
      documentoAnterior: [null],

      email: ['', [ Validators.email]],
      telefono:[null,  [Validators.required] ],
      documentoTipoID: [1, [Validators.required]], //cedula por defecto
      fechaNacimiento: [null,  [Validators.required] ],
      fechaRegistrado: [new Date(),],
      estadoID: [1,],
      sexo: [null,[Validators.required]],
      codigoReferencia: [null,],

      calle: [null, [Validators.required, Validators.maxLength(100)]],
      numero: [null, [Validators.required]],
      residencial: [null],
      apartamento: [null],
      referencia: [null,[ Validators.maxLength(10)]],
      provinciaID: [null, Validators.required],
      ciudadID: [null, Validators.required],
      sectorID: [null, Validators.required],
      subSectorID: [0],
      tipoComprobante: [null, [Validators.required]],
      frecuenciaVisitaId: [0, [Validators.required]],
      limiteCredito: [0, [Validators.required]],
      balance: [0, [Validators.required]],
      condicionPagoId: [0, [Validators.required]],
      plazoId: [0, [Validators.required]],
      rutaId: [0, [Validators.required]],
      listaPrecioId: [0, [Validators.required]],
      longitud: [null, [Validators.required,this.regexValidator(new RegExp('^-?([1-8]?[1-9]|[1-9]0)\\.{1}\\d{1,6}'), {'valid': ''})]],
      latitud:[null, [Validators.required, this.regexValidator(new RegExp('^-?([1-8]?[1-9]|[1-9]0)\\.{1}\\d{1,6}'), {'valid': ''})]],
      sucursalId:[0, [Validators.required]],
      companiaId:[Number(this.auth.tokenDecoded.primarygroupsid)],
      salario:[0, [Validators.required]],
      estadoERPID: [0],
      clientePadreId: [0],
      clientePadreTipoId: [0],
      isClientPrincipal: [0],
      usuarioId: [Number(this.auth.tokenDecoded.nameid)],
      updateMobile: [0],
      // contactos: new FormArray([])
    },
      {
        validator: cedulaestructura('documento', 'documentoTipoID'),
      });
  }
  

  get f() { return this.FormGenerales.controls; } // acceder a los controles del formulario para no escribir tanto codigo en el html

  get referencianovalida(){
    return this.FormGenerales.get('referencia').invalid &&   this.FormGenerales.get('referencia').touched
   }


  guardarCliente() {


    let metodo: string = this.actualizando ? "UpdateCliente" : "CrearCliente";
    let valueBool = this.f.estadoID.value ? 1 : 0;

    this.f.estadoID.setValue(valueBool)

    this.btnGuardarCargando = true;

    if(this.f.documentoTipoID.value==2){
      this.f.apellidos.setValue('');
      this.f.fechaNacimiento.setValue(new Date());
      this.f.sexo.setValue('');
    }
   // console.log(this.FormGenerales)
   this.f.numero.setValue(this.f.numero.value.toString())
   this.f.usuarioId.setValue(Number(this.auth.tokenDecoded.nameid));

    this.httpService.DoPostAny<Cliente>(DataApi.Cliente,
      metodo, this.FormGenerales.value).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0], "Error");
          this.btnGuardarCargando = false;
        } else {
            this.scrollToTop();
            this.toastService.success("Realizado", "OK");
            this.router.navigateByUrl('/mantenimientos/cliente');
          if(!this.actualizando){

            this.clientId=response.valores[0].clienteId;
            this.onClienteCreado(this.clientId);
            this.getClienteByID(this.clientId);
          }

          this.clienteExtraInfo.emit(this.FormGenerales.value)
          this.router.navigateByUrl('/mantenimientos/cliente/'+this.clientId);
        }

        this.btnGuardarCargando = false;
      }, error => {
        this.btnGuardarCargando = false;
        console.log(error)
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
      if(this.clienteTabsValidaIterable.tabsValida.filter(x=>!x.ok && x.keyName=='GENERALES')){
         this.onSubmitWithoutAction();
     }
     this.openModal(this.content);
   }
  }

  getClienteByID(id: number) {

  let parametros = new ParametrosCita();
  parametros.citaID = id;
  parametros.servicioID = Number(this.auth.tokenDecoded.nameid);
    this.cargando = true;
    this.httpService.DoPostAny<Cliente>(DataApi.Cliente,
      "GetClienteByIDAndUsuarioID", parametros).subscribe(response => {
        if (!response.ok) {

          this.toastService.error(response.errores[0]);
          this.router.navigateByUrl('/mantenimientos/cliente');

        } else {
          //validar que existe
          if (response.records.length > 0) {
            let cliente:any = response.records[0];




            //Transforma DATA
            cliente.documentoTipoID = cliente.documentoTipoID<=0 ? null : cliente.documentoTipoID
            cliente.provinciaID = cliente.provinciaID<=0 ? null : cliente.provinciaID
            cliente.ciudadID = cliente.ciudadID<=0 ? null : cliente.ciudadID
            cliente.sectorID = cliente.sectorID<=0 ? null : cliente.sectorID
            cliente.subSectorID = cliente.subSectorID<=0 ? 0 : cliente.subSectorID
            cliente.tipoComprobante = cliente.tipoComprobante<=0 ? null : cliente.tipoComprobante
            cliente.clienteTipoID = cliente.clienteTipoID<=0 ? null : cliente.clienteTipoID
            ///isClientPrincipal cuando su valor es 0
            cliente.isClientPrincipal=1;

            if( cliente.clientePadreId<=0 || cliente.clientePadreId==null)
            {
              cliente.isClientPrincipal=0;
            }

            this.FormGenerales.setValue(cliente);
            this.f.numero.setValue(Number(cliente.numero))

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
    let parametros = new ParametrosCita();
    parametros.citaID = id;
    parametros.servicioID = Number(this.auth.tokenDecoded.nameid);
    this.httpService.DoPostAny<Cliente>(DataApi.Cliente,
      "GetClienteTabsValidaByID", parametros).subscribe(response => {
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


  let parametros: Parametro[] = [{ key: "usuario", value: Number(this.auth.tokenDecoded.nameid) }]

  this.httpService.DoPostAny<ComboBox>(DataApi.ComboBox,
    "GetTipoClienteComboBoxByUsuario",parametros[0]).subscribe(response => {

      if (!response.ok) {
        this.toastService.error(response.errores[0]);
      } else {
        this.TipoCliente = response.records;
      }
      this.loadingTipoCliente = false;
    }, error => {
      this.loadingTipoCliente = false;
      this.toastService.error("No se pudo obtener los tipos de cliente", "Error conexion al servidor");

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

        if(this.f.clienteTipoID.value==12 || this.f.clienteTipoID.value==15){
         this.documentos=    response.records.filter(x=>x.codigo!=2);
        }else{
        this.documentos = response.records;
       }
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
          this.f.clientePadreId.setValue(cliente.clientePadreId);
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
  if(documento=="" || documento==null || documentoTipoID==0 || documentoTipoID==null){
    return;
  }

  this.buscandoDocumento = true;

  let parametros = new ParametrosCita();
  parametros.clienteDocumento = documento;
  parametros.documentoTipoID = documentoTipoID;
  parametros.clienteID = this.f.id.value;


  this.httpService.DoPostAny<ValidaExisteClienteViewModel>(DataApi.Cliente,
    "GetClienteByCedulaOrRnc", parametros).subscribe(response => {
       console.log(response)
      if (response.ok) {
        if (response != null && response.ok && response.valores != null && response.valores.length > 0) {
           this.clientePadreSearched = response.valores[0];

           //SI ESTE CLIENTE ES UN EMPLEADO NO SE PUEDE CREAR OTRO CLIENTE CON ESTE MISMO NO. DOCUMENTO
               console.log(this.f.id.value)
               console.log(this.clientePadreSearched.id)

             if(this.clientePadreSearched.existeEnWebAdmin){
                  this.toastService.error('Ya existe un cliente con este numero de documento');

                }else{
                  this.f.nombres.setValue(this.clientePadreSearched.nombres);
                  this.f.apellidos.setValue(this.clientePadreSearched.apellidos!=null?this.clientePadreSearched.apellidos:"");
                  this.f.clienteNombre.setValue(this.clientePadreSearched.nombres +' ' +    this.f.apellidos.value )
                  this.f.fechaNacimiento.setValue(this.clientePadreSearched.fechaNacimiento);
                  this.f.sexo.setValue(this.clientePadreSearched.sexo);

                }

              this.buscandoDocumento = false;
              return;


        } else {
          if(this.f.documentoTipoID.value==2){
            this.toastService.error("Debe digitar un RNC valido/existente en la DGI.");
            this.buscandoDocumento = false;
            return;
          }
          this.f.clientePadreId.setValue(0);
          this.toastService.warning("Datos no encontrados");
         // this.f.nombres.setValue(null);
          // this.f.celular.setValue(null);
          this.buscandoDocumento = false;
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

identificaSucursalOPrincipal(){

  if(this.clientePadreSearched.id>0 && this.f.id.value!=this.clientePadreSearched.id){
    this.f.isClientPrincipal.setValue(1)
    this.f.clientePadreId.setValidators([Validators.required]);
     this.getClientesPrincipales(null,this.clientePadreSearched.id)
  }else{
    this.f.isClientPrincipal.setValue(0)
    this.f.clientePadreId.setValidators(null);
    this.f.clientePadreId.setValue(0);
  }
  //En caso de que el cliente se este creando
  if(this.clientId<=0){
    this.f.clientePadreId.setValue(this.clientePadreSearched.id);
  }
  //En caso de que se este editando el cliente y se digita otro numero de documento
  if(this.clientId>0){
    if(this.f.id.value!=this.clientePadreSearched.id){
      this.f.clientePadreId.setValue(this.clientePadreSearched.id);
    }
  }
  this.f.clientePadreId.updateValueAndValidity();

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
  getSucursales() {
    this.loadingSucursales = true;
    let parametros: Parametro[] = [
      {
        key: "CompaniaID",
        // value: this.authService.tokenDecoded.primarygroupsid
        value: 0
      }
    ];
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetSucursalesByCompania", parametros).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.sucursales = response.records;
        }

        this.loadingSucursales = false;
      }, error => {
        this.loadingSucursales = false;
        this.toastService.error("No se pudo obtener las sucursales.", "Error conexion al servidor");
        setTimeout(() => {
          this.getSucursales();
        }, 1000);
      });
  }

 getClientesPrincipales(searchObj: any = null, clienteID: number = 0) {
    let search = ""

    if (searchObj)
        search = searchObj.term;

    this.loadingClientesPrincipales = true;
    let parametros: Parametro[] = [
        { key: "CompaniaID", value: this.auth.tokenDecoded.primarygroupsid },
        { key: "UsuarioId", value: this.auth.tokenDecoded.nameid },
        { key: "Search", value: search },
        { key: "clienteID", value: clienteID },
        { key: "Tipo", value: 1},

    ];
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
        "GetClientesPrincipalesComboBox", parametros).subscribe(response => {

            if (!response.ok) {
                this.toastService.error(response.errores[0]);
            } else {
                this.clientesPrincipalesComboBox = response.records;
            }

            this.loadingClientesPrincipales = false;
        }, error => {
            this.loadingClientesPrincipales = false;
            this.toastService.error("Error conexion al servidor");
        });
}


onClearClientePrincipal(cliente: ComboBox) {
  this.f.clientePadreId.reset();
}


onSelectClientePrincipal(cliente: ComboBox) {
  this.f.documentoTipoID.setValue( cliente.grupoID);
  this.f.documento.setValue( cliente.grupo);
}

onSelectClienteTipo(tipo: ComboBox) {
 this.getDocumentosTipo();

 if(tipo.codigo==12 || tipo.codigo==15){
  this.f.documentoTipoID.setValue(null);
  this.f.isClientPrincipal.setValue(null);
  this.f.latitud.setValue('18.473523927129218');
  this.f.longitud.setValue('-69.9349482357502');
  this.onCoordsKeyUp();

 }else{
  this.f.latitud.setValue(null);
  this.f.longitud.setValue(null);
  if(this.f.clientePadreId.value<=0){
    this.f.isClientPrincipal.setValue(0);
  }
 }

}
onClickRadioPrincipalOSucursal(value:number){
    //SOLO SE EJECUTA
   // SI EL CLIENTE TIPO ES DIFERENTE DE  EMPLEADO(12) O EMPLEADOS RELACIONADOS(15)
   if(this.f.clienteTipoID.value==12 || this.f.clienteTipoID.value==15 || this.actualizando ){ return;}
    this.f.isClientPrincipal.setValue(value)
    if(value==1){
      this.f.clientePadreId.setValidators([Validators.required]);
      this.f.clientePadreId.setValue(null);
    }else {
      this.f.clientePadreId.setValidators(null);
      this.f.clientePadreId.setValue(0);

    }
    this.f.clientePadreId.updateValueAndValidity();

}
//METODOS LOGIC
onDocumentoKeyUp(event) {
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
  this.f.subSectorID.setValue(0)
  this.sectores = []
  this.getCiudades()
}
onSectorChange() {
  this.f.subSectorID.setValue(0)
  this.subSectores = []
  this.getSubSectores()
}


onTipoDocumentoChange(tipo:ComboBox) {
 // this.f.documento.setValue(null)
  this.tipoDocumento=tipo.nombre.toUpperCase();
  this.f.documento.setErrors(null);
  this.f.apellidos.setValue(null);
  this.buscarClienteByRncOCedula(this.f.documento.value,tipo.codigo);
  this.clearOrputValidatosSomeField();
  this.getTipoComprobante();
}

clearOrputValidatosSomeField(){

  this.FormGenerales.get('documentoTipoID').valueChanges.subscribe(documentoTipo => {
     if(documentoTipo ==1){
      this.f.nombres.setValidators([Validators.required]);
      this.f.apellidos.setValidators([Validators.required]);
      this.f.email.setValidators([Validators.required, Validators.email]);
      this.f.fechaNacimiento.setValidators([Validators.required] );
     }else if (documentoTipo==2){
      this.f.apellidos.setValidators(null);
      this.f.nombres.setValidators(null);
      this.f.email.setValidators(null);
      this.f.fechaNacimiento.setValidators(null);
      this.f.sexo.setValidators(null);
     }

     this.f.apellidos.updateValueAndValidity();
     this.f.nombres.updateValueAndValidity();

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
      return 'Completar'

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

formatPermisionByKeyName(keyName:string){
  switch (keyName) {
    case 'GENERALES':
      return 'mantenimientos_cliente'

    case 'VISITAS_RUTA':
      return 'mantenimientos_cliente_visitas'

    case 'CONTACTOS':
      return 'mantenimientos_cliente_contactos'

    case 'FINANZAS':
      return 'mantenimientos_cliente_finanzas'

    case 'COMERCIAL':
      return 'mantenimientos_cliente_comercial'
    default:
      '';
  }

}
cancelCreacionSucursal(){
  this.btnGuardarCargando=false;
  this.modalService.dismissAll()
}

}



