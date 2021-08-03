import { MapsAPILoader, Marker } from '@agm/core';
import { Component, ElementRef, EventEmitter, Input, NgZone, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { thresholdFreedmanDiaconis } from 'd3';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'src/app/core/authentication/service/authentication.service';
import { Parametro } from 'src/app/core/http/model/Parametro';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { ParametrosCita } from 'src/app/Modules/turno/models/ParametrosCita';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { ComboBox } from 'src/app/shared/model/ComboBox';
import { cedulaestructura } from 'src/app/shared/validators/cedula-estructura.validator';
import { Cliente, Coordenadas } from '../models/Cliente';
@Component({
  selector: 'app-cliente-datos-generales',
  templateUrl: './cliente-datos-generales.component.html',
  styleUrls: ['./cliente-datos-generales.component.scss']
})
export class ClienteDatosGeneralesComponent implements OnInit {
  @Input() clientId = 0;
  @Output() clienteIdCreado = new EventEmitter();
  
  
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


  //LISTAS
  ciudades    : ComboBox[];
  sectores    : ComboBox[];
  subSectores : ComboBox[];
  provincias  : ComboBox[];
  documentos  : ComboBox[];
  ListaPrecio : any[];
  TipoCliente : any[];

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
    private auth: AuthenticationService,
    private formBuilder: FormBuilder,

    ) { }
 
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
    this.clearOrputValidatosSomeField();
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
  
  private createForm() {

    this.FormGenerales = this.formBuilder.group({
      id: [0],
      sucursalID: [0, [Validators.required]],
      clienteTipoID: [0, [Validators.required]],
      nombres: [null,  [Validators.required]],
      apellidos: [null,  [Validators.required] ],
      documento: [null, [Validators.required, Validators.minLength(9)]],
      email: [null, [Validators.required, Validators.email]],
      documentoTipoID: [1, [Validators.required]], //cedula por defecto
      fechaNacimiento: [null,  [Validators.required] ],
      fechaRegistrado: [new Date(),],
      estadoID: [0,],
      sexo: [null,[Validators.required]],
      codigoReferencia: [null,],

      calle: [null, [Validators.required]],
      numero: [0, [Validators.required]],
      residencial: [null, [Validators.required]],
      apartamento: [null, [Validators.required]],
      referencia: [null, [Validators.required]],
      provinciaID: [0, Validators.required],
      ciudadID: [0, Validators.required],
      sectorID: [0, Validators.required],
      subSectorID: [0, Validators.required],
      
      frecuenciaVisitaId: [0, [Validators.required]],
      limiteCredito: [0, [Validators.required]],
      condicionPagoId: [0, [Validators.required]],
      rutaId: [0, [Validators.required]],
      listaPrecioId: [0, [Validators.required]],
      longitud: [null, [Validators.required]],
      latitud: [null, [Validators.required]],
      // contactos: new FormArray([])
    },
      {
        validator: cedulaestructura('documento', 'documentoTipoID')
      });
  }

  get f() { return this.FormGenerales.controls; } // acceder a los controles del formulario para no escribir tanto codigo en el html



  guardarCliente() {

    let metodo: string = this.actualizando ? "UpdateCliente" : "CrearCliente";
    this.btnGuardarCargando = true;

    if(this.f.documentoTipoID.value==2){
      this.f.apellidos.setValue('');
      this.f.email.setValue('');
      this.f.fechaNacimiento.setValue(new Date());
      this.f.sexo.setValue('');
    }
    console.log(this.FormGenerales)
    let param = { "cliente": this.FormGenerales.value }
    console.log( this.FormGenerales.value )
    this.httpService.DoPostAny<Cliente>(DataApi.Cliente,
      metodo, this.FormGenerales.value).subscribe(response => {
        if(!this.actualizando){
          this.clientId=response.records[0].id;
        }

        if (!response.ok) {
          this.toastService.error(response.errores[0], "Error");
          this.btnGuardarCargando = false;
        } else {
          this.toastService.success("Realizado", "OK");
          if(!this.actualizando){
            this.onClienteCreado(this.clientId);
          }
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
           cliente.documentoTipoID = cliente.documentoTipoID==null? 0 :cliente.documentoTipoID
            // this.FrecuenciaVisita = response.records[0].visita;
            this.FormGenerales.setValue(cliente);

            let coors= new Coordenadas();
            coors.latitud=parseFloat( cliente.latitud);
            coors.longitud=parseFloat( cliente.longitud);
            this.coordenadas.emit(coors);
            // this.onAddContacts(cliente.contactos);
            this.getCiudades();
            this.getSectores();
            this.getSubSectores();
         //   this.getRutaByID(cliente.rutaId);
          } else {
            this.toastService.warning("Cliente no encontrado");
            this.router.navigateByUrl('/mantenimientos/cliente');
          }
        }

      }, error => {
        this.cargando = false;
        this.toastService.error("Error conexion al servidor");
      });
  }


  //METODOS COMBOBOX
getCiudades() {
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
getSectores(event?:ComboBox) {
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
      this.toastService.error("No se pudo obtener los sectores", "Error conexion al servidor");

      setTimeout(() => {
        this.getSectores()
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
          this.f.nombres.setValue(null);
          this.f.apellidos.setValue(null);
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
          // this.f.celular.setValue(cliente.celular);

        } else {
          this.toastService.warning("Datos no encontrados");
          this.f.nombres.setValue(null);
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

  this.f.nombres.setValue(null);
  this.f.apellidos.setValue(null);
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
  console.log(this.f.documento.value)
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
}


