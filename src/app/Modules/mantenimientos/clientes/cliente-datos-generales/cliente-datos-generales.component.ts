import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'src/app/core/authentication/service/authentication.service';
import { Parametro } from 'src/app/core/http/model/Parametro';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { ParametrosCita } from 'src/app/Modules/turno/models/ParametrosCita';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { ComboBox } from 'src/app/shared/model/ComboBox';
import { cedulaestructura } from 'src/app/shared/validators/cedula-estructura.validator';
import { Cliente } from '../models/Cliente';

@Component({
  selector: 'app-cliente-datos-generales',
  templateUrl: './cliente-datos-generales.component.html',
  styleUrls: ['./cliente-datos-generales.component.scss']
})
export class ClienteDatosGeneralesComponent implements OnInit {
  @Input() clientId = 0;
  FormGenerales: FormGroup;

  //BOOLEANOS
  btnGuardarCargando = false;
  actualizando       = false;
  cargando           = false
  loadingDocumentos  = false;
  loadingCiudades    = false;
  loadingProvincias  = false;
  loadingSectores    = false;
  buscandoDocumento  = false;
  submitted          = false;
  loadingListaPrecio = false;
  loadingTipoCliente = false;


  //LISTAS
  ciudades    : ComboBox[];
  sectores    : ComboBox[];
  provincias  : ComboBox[];
  documentos  : ComboBox[];
  ListaPrecio : any[];
  TipoCliente : any[];

  //OBJETOS Y DEMAS
  TipoSexo: any[] = [{ codigo: 'H', nombre: 'Hombre' }, { codigo: 'M', nombre: 'Mujer' }];


  constructor(
    private toastService: ToastrService,
    private route: ActivatedRoute,
    private httpService: BackendService,
    private router: Router,
    private auth: AuthenticationService,
    private formBuilder: FormBuilder
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
      nombres: [null, [Validators.required]],
      apellidos: [null, [Validators.required]],
      documento: [null, [Validators.required, Validators.minLength(9)]],
      email: [null, [Validators.required, Validators.email]],
      documentoTipoID: [1, [Validators.required]], //cedula por defecto
      fechaNacimiento: [null, Validators.required],
      fechaRegistrado: [new Date(),],
      estadoID: [0,],
      sexo: [null, Validators.required],
      codigoReferencia: [null,],
      calle: [null, [Validators.required]],
      numero: [0, [Validators.required]],
      provinciaID: [0, Validators.required],
      ciudadID: [0, Validators.required],
      sectorID: [0, Validators.required],
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

    // console.log(this.FormGenerales.value);

    let param = { "Cliente": this.FormGenerales.value }
    this.httpService.DoPostAny<Cliente>(DataApi.Cliente,
      metodo, param).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0], "Error");
          this.btnGuardarCargando = false;
        } else {
          this.toastService.success("Realizado", "OK");
          this.router.navigateByUrl('/mantenimientos/cliente');
        }

        this.btnGuardarCargando = false;
      }, error => {
        this.btnGuardarCargando = false;
        this.toastService.error("Error conexion al servidor");
      });

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
            // this.FrecuenciaVisita = response.records[0].visita;
            this.FormGenerales.setValue(cliente);
            // this.onAddContacts(cliente.contactos);

            this.getCiudades();
            this.getSectores();
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
getSectores() {
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
buscarClienteByRnc(documento: string) {
  this.buscandoDocumento = true;

  let parametros = new ParametrosCita();
  parametros.clienteDocumento = documento;

  this.httpService.DoPostAny<Cliente>(DataApi.Cliente,
    "GetClienteByRnc", parametros).subscribe(response => {

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
    if(this.f.documentoTipoID.value==1){
      this.buscarCliente(this.f.documento.value);
    }else if(this.f.documentoTipoID.value ==2){
      this.buscarClienteByRnc(this.f.documento.value)
    }
  }
}
onProvinciaChange() {
  this.f.ciudadID.setValue(null)
  this.f.sectorID.setValue(null)
  this.sectores = []
  this.getCiudades()
}
onTipoDocumentoChange(tipo:ComboBox) {
  console.log(tipo);
 // this.f.documento.setValue(null)
  this.f.nombres.setValue(null)
  this.f.apellidos.setValue(null)
  if(tipo.codigo==1){
    this.buscarCliente(this.f.documento.value);
  }else if(tipo.codigo ==2){
    this.buscarClienteByRnc(this.f.documento.value)
  }
 
}
}
