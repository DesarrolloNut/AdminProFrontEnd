import { Dias } from './../models/Dias';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { ComboBox } from 'src/app/shared/model/ComboBox';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { cedulaestructura } from 'src/app/shared/validators/cedula-estructura.validator';
import { ParametrosCita } from 'src/app/Modules/turno/models/ParametrosCita';
import { AuthenticationService } from 'src/app/core/authentication/service/authentication.service';
import { Cliente } from '../models/Cliente';
import { Parametro } from 'src/app/core/http/model/Parametro';

@Component({
  selector: 'app-clientes-formulario',
  templateUrl: './clientes-formulario.component.html',
  styleUrls: ['./clientes-formulario.component.scss']
})
export class ClientesFormularioComponent implements OnInit {

  sucursales: ComboBox[] = [];
  roles: ComboBox[] = [];
  documentos: ComboBox[];

  Cargando: boolean = false;
  FormGenerales: FormGroup;
  FormVisitas: FormGroup;
  submitted = false;
  btnGuardarCargando = false;
  actualizando = false;


  loadingSucursales = false;
  loadingRoles = false;
  loadingDocumentos = false;
  buscandoDocumento: boolean;
  loadingProvincias: boolean;
  provincias: ComboBox[];
  loadingCiudades: boolean;
  ciudades: ComboBox[];
  sectores: ComboBox[];
  loadingSectores: boolean;
  FrecuenciaVisitas: any[];
  TipoComprobantes: any[];
  loadingTipoComprobantes: boolean;
  TipoCondicionPagos: any[];
  loadingCondicionPagos: boolean;
  Rutas: any[];
  loadingRutas: boolean;
  TipoCliente: any[];
  loadingTipoCliente: boolean;
  DiaSemana: Dias[];

  constructor(
    private toastService: ToastrService,
    private route: ActivatedRoute,
    private httpService: BackendService,
    private router: Router,
    private auth: AuthenticationService,
    private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    //CREACION DE FORMULARIO
    this.CreateFormDatosGenerales();
    // this.CreateFormVisitasClientes();

    let id = Number(this.route.snapshot.paramMap.get('id'));
    if (id > 0) {
      this.getClienteByID(id);
      this.actualizando = true;

    }
    this.getDias();
    this.getFrecuenciaVisitas();
    this.getProvincias()
    this.getDocumentosTipo();
    this.getTipoComprobanteId();
    this.getTipoCondicionPago();
    this.getRutas();
    this.getTipoCliente();
  }



  private CreateFormDatosGenerales() {

    this.FormGenerales = this.formBuilder.group({
      id: [0],
      sucursalID: [0, [Validators.required]],
      clienteTipoID: [0,[Validators.required]],
      nombres: [null, [Validators.required]],
      apellidos: [null, [Validators.required]],
      celular: [null, [Validators.required]],
      email: [null, [Validators.required, Validators.email]],
      documento: [null, [Validators.required, Validators.minLength(9)]],
      documentoTipoID: [1, [Validators.required]], //cedula por defecto
      fechaNacimiento: [null, Validators.required],
      fechaRegistrado: [new Date(),],
      estadoID: [0,],
      codigoReferencia: [null,],
      calle: [null, [Validators.required]],
      numero: [0, [Validators.required]],
      provinciaID: [0, Validators.required],
      ciudadID: [0, Validators.required],
      sectorID: [0, Validators.required],
      visitaId: [0],
      diaId: [0, [Validators.required]],
      frecuenciaVisitaId: [0, [Validators.required]],
      limiteCredito: [0, [Validators.required]],
      condicionPagoId: [0, [Validators.required]],
      tipoComprobanteId: [0, [Validators.required]],
      rutaId: [0, [Validators.required]],

    },
      {
        validator: cedulaestructura('documento', 'documentoTipoID')
      });
  }


  // private CreateFormVisitasClientes() {

  //   this.FormVisitas = this.formBuilder.group({
  //     id: [0],
  //     DiaId: [null, [Validators.required]],
  //     FrecuenciaVisitaId: [null, [Validators.required]],
  //     ClienteId: [null, [Validators.required]],


  //   });
  // }
  get f() { return this.FormGenerales.controls; } // acceder a los controles del formulario para no escribir tanto codigo en el html
  // get f2() { return this.FormVisitas.controls; } // acceder a los controles del formulario para no escribir tanto codigo en el html

  onSubmit() {
    this.submitted = true;

    if (!this.actualizando)
      this.f.sucursalID.setValue(Number(this.auth.tokenDecoded.groupsid))

    if (this.FormGenerales.invalid)
      return;

    this.guardarCliente();
  }

//#region METODOS DATOS GENERALES

  getClienteByID(id: number) {
    this.Cargando = true;
    this.httpService.DoPostAny<Cliente>(DataApi.Cliente,
      "GetClienteByID", id).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          //validar que existe
          if (response != null && response.records != null && response.records.length > 0) {

            let cliente = response.records[0]
            this.FormGenerales.setValue(cliente);
            this.getCiudades();
            this.getSectores();
          } else {
            this.toastService.warning("Cliente no encontrado");
            this.router.navigateByUrl('/mantenimientos/cliente');
          }
        }

      }, error => {
        this.Cargando = false;
        this.toastService.error("Error conexion al servidor");
      });
  }





  guardarCliente() {

    let metodo: string = this.actualizando ? "UpdateCliente" : "CrearCliente";
    this.btnGuardarCargando = true;
    console.table(this.FormGenerales.value)
    console.log(this.FormGenerales.value)
    this.httpService.DoPostAny<Cliente>(DataApi.Cliente,
      metodo, this.FormGenerales.value).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0], "Error");
          this.btnGuardarCargando = false;
        } else {
          this.toastService.success("Realizado", "OK");
          // this.guardarClientesmart(this.Formulario.value);
          this.router.navigateByUrl('/mantenimientos/cliente');
        }

         this.btnGuardarCargando = false;
      }, error => {
        this.btnGuardarCargando = false;
        this.toastService.error("Error conexion al servidor");
      });

  }


  guardarClientesmart(cliente: any) {
    this.btnGuardarCargando = true;
    console.table(cliente)
    this.httpService.DoPostSmartWebService("InsertaCliente", "insertaclientes", cliente).subscribe(response => {
      let mensajeRespuesta = response.d + '';
      console.log(response.d)

      if (mensajeRespuesta.includes("Error")) {
        this.btnGuardarCargando = false;
        this.toastService.error(mensajeRespuesta, "Smart Servicio");
        this.router.navigateByUrl('/mantenimientos/cliente');
        return;
      }

      this.toastService.success("Cliente registrado en Smart.", "Smart Servicio");
      this.router.navigateByUrl('/mantenimientos/cliente');
      // this.router.navigateByUrl("servicios/recepcion-llamado");

    }, error => {
      this.btnGuardarCargando = false;
      console.error(error)
      this.toastService.error("Error conexion al servidor", "Smart Servicio");
    });

  }



  onProvinciaChange() {
    this.f.ciudadID.setValue(null)
    this.f.sectorID.setValue(null)
    this.sectores = []
    this.getCiudades()
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


  onDocumentoKeyUp() {

    this.f.nombres.setValue(null);
    this.f.apellidos.setValue(null);
    this.f.celular.setValue(null);

    if (this.f.documento.valid) {
      this.buscarCliente(this.f.documento.value);
    }
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
            this.f.celular.setValue(cliente.celular);

          } else {
            this.toastService.warning("Datos no encontrados");
            this.f.nombres.setValue(null);
            this.f.apellidos.setValue(null);
            this.f.celular.setValue(null);
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

getFrecuenciaVisitas() {
  this.Cargando = true;
  this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
    "GetFrecuenciaVisitaComboBox", null).subscribe(response => {

      if (!response.ok) {
        this.toastService.error(response.errores[0]);
      } else {
        this.FrecuenciaVisitas = response.records;
      }
      this.Cargando = false;
    }, error => {
      this.Cargando = false;
      this.toastService.error("No se pudo obtener las categorias", "Error conexion al servidor");

      setTimeout(() => {
        this.getFrecuenciaVisitas();
      }, 1000);

    });
}

getTipoComprobanteId() {
  this.loadingTipoComprobantes = true;
  this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
    "GetTipoComprobante", null).subscribe(response => {

      if (!response.ok) {
        this.toastService.error(response.errores[0]);
      } else {
        this.TipoComprobantes = response.records;
      }
      this.loadingTipoComprobantes = false;
    }, error => {
      this.loadingTipoComprobantes = false;
      this.toastService.error("No se pudo obtener las categorias", "Error conexion al servidor");

      setTimeout(() => {
        this.getTipoComprobanteId();
      }, 1000);

    });
}

getTipoCondicionPago() {
  this.loadingCondicionPagos = true;
  this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
    "GetTipoCondicionPago", null).subscribe(response => {

      if (!response.ok) {
        this.toastService.error(response.errores[0]);
      } else {
        this.TipoCondicionPagos = response.records;
      }
      this.loadingCondicionPagos = false;
    }, error => {
      this.loadingCondicionPagos = false;
      this.toastService.error("No se pudo obtener las categorias", "Error conexion al servidor");

      setTimeout(() => {
        this.getTipoCondicionPago();
      }, 1000);

    });
}

getRutas() {
  this.loadingRutas = true;
  this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
    "GetRutasComboBox", null).subscribe(response => {

      if (!response.ok) {
        this.toastService.error(response.errores[0]);
      } else {
        this.Rutas = response.records;
      }
      this.loadingRutas = false;
    }, error => {
      this.loadingRutas = false;
      this.toastService.error("No se pudo obtener las categorias", "Error conexion al servidor");

      setTimeout(() => {
        this.getTipoCondicionPago();
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


getDias() {
  this.Cargando = true;
  this.httpService.DoPost<Dias>(DataApi.Cliente,
    "GetDias", null).subscribe(response => {

      if (!response.ok) {
        this.toastService.error(response.errores[0]);
      } else {
        this.DiaSemana = response.records;
      }
      this.Cargando = false;
    }, error => {
      this.Cargando = false;
      this.toastService.error("No se pudo obtener las categorias", "Error conexion al servidor");

      setTimeout(() => {
        this.getDias();
      }, 1000);

    });
}
//#endregion
}
