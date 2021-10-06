import { FrecuenciaVisita } from './../models/FrecuenciaVisita';
import { Ruta } from './../../rutas/models/Ruta';
import { Dias } from './../models/Dias';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { ComboBox } from 'src/app/shared/model/ComboBox';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { cedulaestructura } from 'src/app/shared/validators/cedula-estructura.validator';
import { ParametrosCita } from 'src/app/Modules/turno/models/ParametrosCita';
import { AuthenticationService } from 'src/app/core/authentication/service/authentication.service';
import { Cliente, ClienteTabsValida } from '../models/Cliente';
import { Parametro } from 'src/app/core/http/model/Parametro';
import * as _ from "lodash";
import { ClienteFrecuencia } from '../models/ClienteFrecuencia';
import { ClienteContactos } from '../models/ClienteContactos';
import { NgxPermissionsService } from 'ngx-permissions';

@Component({
  selector: 'app-clientes-formulario',
  templateUrl: './clientes-formulario.component.html',
  styleUrls: ['./clientes-formulario.component.scss']
})
export class ClientesFormularioComponent implements OnInit {
  @ViewChild('tabset') tabset: any;

  sucursales: ComboBox[] = [];
  roles: ComboBox[] = [];
  documentos: ComboBox[];

  Cargando: boolean = false;
  //FormGenerales: FormGroup;
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
  TipoSexo: any[] = [{ codigo: 'H', nombre: 'Hombre' }, { codigo: 'M', nombre: 'Mujer' }];
  loadingTipoComprobantes: boolean;
  TipoCondicionPagos: any[];
  loadingCondicionPagos: boolean;
  Rutas: any[];
  loadingRutas: boolean;
  TipoCliente: any[];
  loadingTipoCliente: boolean;
  ListaPrecio: any[]; 
  loadingListaPrecio: boolean;
  DiaSemana: Dias[] = new Array<Dias>();
  FrecuenciaVisita: FrecuenciaVisita[] = new Array<FrecuenciaVisita>();
  Ruta: any;
  hasDetalleRuta: Boolean;

  clienteId = 0;

  clienteTabsValida = new ClienteTabsValida();
  clienteInfo = new Cliente();
  loadingClienteInfo=true;

  isnotNecesaryFieldsCompleteInGenerales = true;
  isnotNecesaryFieldsCompleteInVisitas   = true;
  isnotNecesaryFieldsCompleteInContactos = true;
  isnotNecesaryFieldsCompleteInFinanzas  = true;
  isnotNecesaryFieldsCompleteInComercial = true;
  isnotNecesaryFieldsCompleteInNegocio   = true;


  constructor(
    private toastService: ToastrService,
    private route: ActivatedRoute,
    private httpService: BackendService,
    private router: Router,
    private auth: AuthenticationService,
    private formBuilder: FormBuilder) { }

  ngOnInit(): void {
 
    let id = Number(this.route.snapshot.paramMap.get('id'));
    this.clienteId=  id;
    if(this.clienteId<=0){
       this.loadingClienteInfo=false;
    }


  }


  setClienteIdGuardado(id:number) {
    this.clienteId= id;
 }
   changeTabByKey(key:string) {
    this.tabset.select(key.toUpperCase());
  }
 
 setClienteTabsValida(c:ClienteTabsValida) {
  this.clienteTabsValida= c;

   c.tabsValida?.forEach(x=>{
    switch (x.keyName) {
      case 'GENERALES':
        this.isnotNecesaryFieldsCompleteInGenerales= x.ok;
        break;

      case 'VISITAS_RUTA':
        this.isnotNecesaryFieldsCompleteInVisitas= x.ok;
        break;

      case 'CONTACTOS':
        this.isnotNecesaryFieldsCompleteInContactos= x.ok;
        break;

      case 'FINANZAS':
        this.isnotNecesaryFieldsCompleteInFinanzas= x.ok;
        break;

      case 'COMERCIAL':
        this.isnotNecesaryFieldsCompleteInComercial= x.ok;
        break;

      case 'NEGOCIO':
        this.isnotNecesaryFieldsCompleteInNegocio= x.ok;
        break;
      default:
          console.log("No such day exists!" + x.keyName);
    }
   })
}

setClienteInfo(c:Cliente){
this.clienteInfo=c;
this.loadingClienteInfo=false;
}
  // private CreateFormDatosGenerales() {

  //   this.FormGenerales = this.formBuilder.group({
  //     id: [0],
  //     sucursalID: [0, [Validators.required]],
  //     clienteTipoID: [0, [Validators.required]],
  //     nombres: [null, [Validators.required]],
  //     apellidos: [null, [Validators.required]],
  //     documento: [null, [Validators.required, Validators.minLength(9)]],
  //     email: [null, [Validators.required, Validators.email]],
  //     documentoTipoID: [1, [Validators.required]], //cedula por defecto
  //     fechaNacimiento: [null, Validators.required],
  //     fechaRegistrado: [new Date(),],
  //     estadoID: [0,],
  //     sexo: [null, Validators.required],
  //     codigoReferencia: [null,],
  //     calle: [null, [Validators.required]],
  //     numero: [0, [Validators.required]],
  //     provinciaID: [0, Validators.required],
  //     ciudadID: [0, Validators.required],
  //     sectorID: [0, Validators.required],
  //     frecuenciaVisitaId: [0, [Validators.required]],
  //     limiteCredito: [0, [Validators.required]],
  //     condicionPagoId: [0, [Validators.required]],
  //     rutaId: [0, [Validators.required]],
  //     listaPrecioId: [0, [Validators.required]],
  //     longitud: [null, [Validators.required]],
  //     latitud: [null, [Validators.required]],
  //     // contactos: new FormArray([])


  //   },
  //     {
  //       validator: cedulaestructura('documento', 'documentoTipoID')
  //     });

  // }

  //get f() { return this.FormGenerales.controls; } // acceder a los controles del formulario para no escribir tanto codigo en el html
  //get c() { return this.f.contactos as FormArray; }

  // onSubmit() {
  //   this.submitted = true;

  //   if (!this.actualizando)
  //     this.f.sucursalID.setValue(Number(this.auth.tokenDecoded.groupsid))

  //   if (this.FormGenerales.invalid)
  //     return;

  //   this.guardarCliente();
  // }

  //#region METODOS DATOS GENERALES

  // getClienteByID(id: number) {
  //   this.Cargando = true;
  //   this.httpService.DoPostAny<Cliente>(DataApi.Cliente,
  //     "GetClienteByID", id).subscribe(response => {
  //       if (!response.ok) {
  //         this.toastService.error(response.errores[0]);
  //       } else {
  //         if (response.records.length > 0) {

  //           let cliente = response.records[0];
   

  //           this.getCiudades();
  //           this.getSectores();
  //           this.getRutaByID(cliente.rutaId);
  //         } else {
  //           this.toastService.warning("Cliente no encontrado");
  //           this.router.navigateByUrl('/mantenimientos/cliente');
  //         }
  //       }

  //     }, error => {
  //       this.Cargando = false;
  //       this.toastService.error("Error conexion al servidor");
  //     });
  // }


  onAddContacts(contacts: Array<ClienteContactos> = new Array<ClienteContactos>()) {

    if (contacts.length > 0) {
      for (const item of contacts) {

        // this.c.push(this.formBuilder.group({
        //   telefono: [item.telefono, Validators.required],
        //   celular: [item.celular, Validators.required],
        //   email: [item.email, [Validators.required, Validators.email]]
        // }));

      }
    } else {
      // this.c.push(this.formBuilder.group({
      //   telefono: [null, Validators.required],
      //   celular: [null, Validators.required],
      //   email: [null, [Validators.required, Validators.email]]
      // }));
    }




    // const numberOfTickets = e.target.value || 0;
    // if (this.c.length < numberOfTickets) {
    //     for (let i = this.c.length; i < numberOfTickets; i++) {

    //         this.c.push(this.formBuilder.group({
    //             telefono: [null, Validators.required],
    //             celular: [null, Validators.required],
    //             email: [null, [Validators.required, Validators.email]]
    //         }));
    //     }
    // } else {
    //     for (let i = this.c.length; i >= numberOfTickets; i--) {
    //         this.c.removeAt(i);
    //     }
    // }
  }


  onChangeRuta(value) {
    this.getRutaByID(value.codigo);
  }

  getRutaByID(id: number) {
    this.httpService.DoPostAny<Ruta>(DataApi.Ruta,
      "GetRutaByIDWithName", id).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          //validar que existe
          if (response != null && response.records != null && response.records.length > 0) {

            this.Ruta = response.records[0];
            this.hasDetalleRuta = true;
          } else {
            this.hasDetalleRuta = false;
            // this.toastService.warning("Ru no encontrado");
            // this.router.navigateByUrl('/mantenimientos/cliente');
          }
        }

      }, error => {
        this.hasDetalleRuta = false;
        this.toastService.error("Error conexion al servidor");
      });
  }


  getDias(id: number) {
    this.Cargando = true;
    this.httpService.DoPost<Dias>(DataApi.Cliente,
      "GetDias", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          // console.log("api data",response.records);
          this.DiaSemana = response.records;
          this.setValueDiaSemana(id);
        }
        this.Cargando = false;
      }, error => {
        this.Cargando = false;
        this.toastService.error("No se pudo obtener las categorias", "Error conexion al servidor");

        // setTimeout(() => {
        //   this.getDias();
        // }, 1000);

      });
  }

  setValueDiaSemana(id: number) {
    let dias = this.DiaSemana;

    if (dias != undefined) {
      this.httpService.DoPostAny<ClienteFrecuencia>(DataApi.Cliente,
        "GetClienteByID", id).subscribe(response => {
          if (!response.ok) {
            this.toastService.error(response.errores[0]);
          } else {
            //validar que existe
            if (response != null && response.records != null && response.records.length > 0) {

              let visitas = response.records[0].visita

              for (let i = 0; i < dias.length; i++) {
                let dia = dias[i];

                if (visitas) {
                  for (let x = 0; x < visitas.length; x++) {
                    let visita = visitas[x];

                    if (dia.dia == visita.diaId) {
                      dia.select = true;
                    }

                  }
                }

              }
            }
          }

        }, error => {
          this.toastService.error("Error conexion al servidor");
        });


    }


  }


  // guardarCliente() {

  //   let metodo: string = this.actualizando ? "UpdateCliente" : "CrearCliente";
  //   this.btnGuardarCargando = true;


  //   let param = { "Cliente": this.FormGenerales.value, "Dias": this.DiaSemana }
  //   this.httpService.DoPostAny<Cliente>(DataApi.Cliente,
  //     metodo, param).subscribe(response => {

  //       if (!response.ok) {
  //         this.toastService.error(response.errores[0], "Error");
  //         this.btnGuardarCargando = false;
  //       } else {
  //         this.toastService.success("Realizado", "OK");
  //         this.router.navigateByUrl('/mantenimientos/cliente');
  //       }

  //       this.btnGuardarCargando = false;
  //     }, error => {
  //       this.btnGuardarCargando = false;
  //       this.toastService.error("Error conexion al servidor");
  //     });

  // }


  guardarClientesmart(cliente: any) {
    this.btnGuardarCargando = true;
    console.table(cliente)
    this.httpService.DoPostSmartWebService("InsertaCliente", "insertaclientes", cliente).subscribe(response => {
      let mensajeRespuesta = response.d + '';
      // console.log(response.d)

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



  // onProvinciaChange() {
  //   this.f.ciudadID.setValue(null)
  //   this.f.sectorID.setValue(null)
  //   this.sectores = []
  //   this.getCiudades()
  // }

  // getProvincias() {
  //   this.loadingProvincias = true;
  //   this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
  //     "GetProvincias", null).subscribe(response => {

  //       if (!response.ok) {
  //         this.toastService.error(response.errores[0]);
  //       } else {
  //         this.provincias = response.records;
  //       }
  //       this.loadingProvincias = false;
  //     }, error => {
  //       this.loadingProvincias = false;
  //       this.toastService.error("No se pudo obtener las provincias", "Error conexion al servidor");

  //       setTimeout(() => {
  //         this.getProvincias()
  //       }, 1000);

  //     });
  // }

  // getCiudades() {
  //   let parametros: Parametro[] = [{ key: "ProvinciaId", value: this.f.provinciaID.value }]
  //   this.loadingCiudades = true;
  //   this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
  //     "GetCiudades", parametros).subscribe(response => {

  //       if (!response.ok) {
  //         this.toastService.error(response.errores[0]);
  //       } else {
  //         this.ciudades = response.records;
  //       }
  //       this.loadingCiudades = false;
  //     }, error => {
  //       this.loadingCiudades = false;
  //       this.toastService.error("No se pudo obtener las ciudades", "Error conexion al servidor");

  //       setTimeout(() => {
  //         this.getCiudades()
  //       }, 1000);

  //     });
  // }

  // getSectores() {
  //   let parametros: Parametro[] = [{ key: "ciudadId", value: this.f.ciudadID.value }]
  //   this.loadingSectores = true;
  //   this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
  //     "GetSectores", parametros).subscribe(response => {

  //       if (!response.ok) {
  //         this.toastService.error(response.errores[0]);
  //       } else {
  //         this.sectores = response.records;
  //       }
  //       this.loadingSectores = false;
  //     }, error => {
  //       this.loadingSectores = false;
  //       this.toastService.error("No se pudo obtener los sectores", "Error conexion al servidor");

  //       setTimeout(() => {
  //         this.getSectores()
  //       }, 1000);

  //     });
  // }


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


  // onDocumentoKeyUp() {

  //   this.f.nombres.setValue(null);
  //   this.f.apellidos.setValue(null);
  //   // this.f.celular.setValue(null);

  //   if (this.f.documento.valid) {
  //     this.buscarCliente(this.f.documento.value);
  //   }
  // }


  // buscarCliente(documento: string) {
  //   this.buscandoDocumento = true;

  //   let parametros = new ParametrosCita();
  //   parametros.clienteDocumento = documento;

  //   this.httpService.DoPostAny<Cliente>(DataApi.Cliente,
  //     "GetClienteOPadronDatos", parametros).subscribe(response => {

  //       if (response.ok) {
  //         if (response != null && response.ok && response.records != null && response.records.length > 0) {
  //           let cliente = response.records[0];

  //           this.f.nombres.setValue(cliente.nombres);
  //           this.f.apellidos.setValue(cliente.apellidos);
  //           // this.f.celular.setValue(cliente.celular);

  //         } else {
  //           this.toastService.warning("Datos no encontrados");
  //           this.f.nombres.setValue(null);
  //           this.f.apellidos.setValue(null);
  //           // this.f.celular.setValue(null);
  //         }

  //       } else {
  //         this.toastService.error(response.errores[0]);
  //       }

  //       this.buscandoDocumento = false;
  //     }, error => {
  //       this.buscandoDocumento = false;
  //       this.toastService.error("Error conexion al servidor");
  //     });

  // }

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
        this.toastService.error("No se pudo obtener las frecuencias", "Error conexion al servidor");

        setTimeout(() => {
          this.getFrecuenciaVisitas();
        }, 1000);

      });
  }
 
  // getTipoComprobanteId() {
  //   this.loadingTipoComprobantes = true;
  //   this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
  //     "GetTipoComprobante", null).subscribe(response => {

  //       if (!response.ok) {
  //         this.toastService.error(response.errores[0]);
  //       } else {
  //         this.TipoComprobantes = response.records;
  //       }
  //       this.loadingTipoComprobantes = false;
  //     }, error => {
  //       this.loadingTipoComprobantes = false;
  //       this.toastService.error("No se pudo obtener las categorias", "Error conexion al servidor");

  //       setTimeout(() => {
  //         this.getTipoComprobanteId();
  //       }, 1000);

  //     });
  // }

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
          this.getRutas();
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



  //#endregion
}
