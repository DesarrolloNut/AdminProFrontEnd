import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { AuthenticationService } from 'src/app/core/authentication/service/authentication.service';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ComboBox } from 'src/app/shared/model/ComboBox';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { Usuario } from 'src/app/Modules/servicios/recepcion/models/Usuario';
import { cedulaestructura } from 'src/app/shared/validators/cedula-estructura.validator';
import { ParametrosCita } from 'src/app/Modules/turno/models/ParametrosCita';
import { Parametro } from 'src/app/core/http/model/Parametro';
import { Cliente } from '../../clientes/models/Cliente';
import { DualListComponent } from 'angular-dual-listbox';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-usuario-formulario',
  templateUrl: './usuario-formulario.component.html',
  styleUrls: ['./usuario-formulario.component.scss']
})
export class UsuarioFormularioComponent implements OnInit {


  loadingButtonCambiar = false;
  FormularioChangePassword: FormGroup;
  submittedPassword = false;
  closeResult: string;


  sucursales: ComboBox[] = [];
  loadingSucursales = false;

  roles: ComboBox[] = [];
  documentos: ComboBox[];

  Cargando: boolean = false;
  Formulario: FormGroup;
  submitted = false;
  btnGuardarCargando = false;
  actualizandoUsuario = false;

  loadingRoles = false;
  loadingDocumentos = false;
  buscandoDocumento: boolean;
  supervisores: ComboBox[];
  loadingUsuarios: boolean;


  // Dual List options
  tab = 1;
  keepSorted = true;
  key: string;
  display: string;
  filter = true;
  source: Array<any>;
  confirmed: Array<any> = [];
  userAdd = '';
  disabled = false;

  sourceLeft = true;
  // format: any = DualListComponent.DEFAULT_FORMAT;
  format = {
    add: 'Agregar', remove: 'Remover', all: 'Seleccionar Todos', none: 'Deseleccionar',
    direction: DualListComponent.LTR, draggable: true, locale: 'da'
  };

  loadingNiveles: boolean;
  usuarioID: number;
  loadingNivelesSeleccionados: boolean;
  guardandoNivelesAsignados: boolean;
  searchText: string;
  loadingRutas: boolean;
  MostrarRutas: boolean;
  rutas: ComboBox[];
  departamentos: ComboBox[];
  loadingDepartamentos: boolean;


  loadingUsuarioTiposSolicitud: boolean;
  usuarioTiposSolicitud: ComboBox[];


  //VARIABLES | CONFIGURACIONES
  loadingSucursalByUsuario =false;
  guardandoSucursalesAsignadas: boolean;

  loadingClienteTipo          =false;
  guardandoClienteTiposAsignados: boolean;
  constructor(
    private toastService: ToastrService,
    private route: ActivatedRoute,
    private httpService: BackendService,
    private router: Router,
    private modalService: NgbModal,
    private auth: AuthenticationService,
    private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.usuarioID = Number(this.route.snapshot.paramMap.get('id'));

    if (this.usuarioID > 0) {
      this.getUsuarioByID(this.usuarioID);
      this.actualizandoUsuario = true;
      this.CreateFormChangePassword();
    }

    this.getDocumentosTipo();
    this.getUsuariosSupervisores();
    this.getRoles();
    this.getSucursales();
    this.getDepartamentos();
    this.getUsuarioTiposSolicitud()

    this.CreateForm();

    this.configDualList();
  }

  private CreateFormChangePassword() {

    this.FormularioChangePassword = this.formBuilder.group({
      password: [null, [Validators.required]],
      passwordConfirm: [null, [Validators.required]],
      userName: [this.auth.tokenDecoded.unique_name]
    }, {
      validator: this.MustMatch('password', 'passwordConfirm')
    });

  }

  MustMatch(controlName: string, matchingControlName: string) {
    return (formGroup: FormGroup) => {
      const control = formGroup.controls[controlName];
      const matchingControl = formGroup.controls[matchingControlName];

      if (matchingControl.errors && !matchingControl.errors.mustMatch) {
        // return if another validator has already found an error on the matchingControl
        return;
      }

      // set error on matchingControl if validation fails
      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({ mustMatch: true });
      } else {
        matchingControl.setErrors(null);
      }
    };
  }

  configDualList() {
    this.key = 'codigo';
    this.display = 'nombre';
    this.keepSorted = true;
  }

  private CreateForm() {

    this.Formulario = this.formBuilder.group({
      id: [0],
      userName: [null, [Validators.required]],
      password: [null,],
      documento: [null, [Validators.required, Validators.minLength(9)]],
      documentoTipoID: [1, [Validators.required]], //cedula por defecto
      nombres: [null, [Validators.required]],
      apellidos: [null, [Validators.required]],
      email: [null, [Validators.required, Validators.email]],
      imagen: [null,],
      rolID: [null, [Validators.required]],
      rol: [null,],
      telefono: [null, [Validators.required]],
      celular: [null, [Validators.required]],
       estado: [0,],
      companiaId: [0,],
      sucursalId: [null, [Validators.required]],
      telefonoExtension: [null, [Validators.required]],
      codigoReferencia: [null, [Validators.required]],
      idUsuarioSupervisor: [0,],
      rutaId: [0, [Validators.required]],
      departamentoId: [null, [Validators.required]],
      descuentoPermitido: [0,],
      descuentoVenta: [0,],
      descuentoCompra: [0,],
      ipEquipo: [null,],
      puertoEquipo: [null,],
      macAddressEquipo: [null,],
      usuarioTipoSolicitudId:[null,[Validators.required]]
    },
      {
        validator: cedulaestructura('documento', 'documentoTipoID')
      });
  }

  get f() { return this.Formulario.controls; } // acceder a los controles del formulario para no escribir tanto codigo en el html
  get fC() { return this.FormularioChangePassword.controls; } // acceder a los controles del formulario para no escribir tanto codigo en el html

  onSubmitChangePassword() {
    this.submittedPassword = true;
    this.fC.userName.setValue(this.auth.tokenDecoded.unique_name);

    if (this.FormularioChangePassword.invalid) {
      return;
    }
    this.changePassword();
  }

  changePassword() {

    let param = { "UsuarioId": this.usuarioID, "PasswordNueva": this.fC.passwordConfirm.value, };

    this.loadingButtonCambiar = true;
    this.httpService.DoPostAny<any>(DataApi.Usuario,
      'ResetPassword', param).subscribe(response => {
        this.loadingButtonCambiar = false;
        if (!response.ok) {
          this.toastService.error(response.errores[0], "Error");
        } else {
          this.modalService.dismissAll();
          this.FormularioChangePassword.reset();

          this.submittedPassword = false;
          this.toastService.success("Realizado", "OK");

        }
      }, error => {
        this.loadingButtonCambiar = false;
        this.toastService.error("Error conexion al servidor");
      });
  }

  open1(content1) {
    this.modalService.open(content1, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }
  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  getUsuarioByID(usuarioID: number) {
    this.Cargando = true;
    this.httpService.DoPostAny<any>(DataApi.Usuario,
      "GetUsuarioByID", usuarioID).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          //validar que existe
          if (response != null && response.records != null && response.records.length > 0) {

            let usuario = response.records[0];
            delete usuario.passwordHash;
            delete usuario.passwordSalt;
            delete usuario.hasDefaultPw;
            delete usuario.plataformaId;

            this.Formulario.setValue(usuario);
            this.getRutasbyRol(usuario.rolID);
          } else {
            this.toastService.warning("Usuario no encontrado");
            this.router.navigateByUrl('/mantenimientos/usuario');
          }
        }

      }, error => {
        this.Cargando = false;
        this.toastService.error("Error conexion al servidor");
      });
  }

  onSubmit() {

    this.submitted = true;
    if (this.Formulario.invalid) {
      return;
    }

    this.guardarUsuario();
  }


  guardarUsuario() {

    let metodo: string = this.actualizandoUsuario ? "Update" : "Registrar";
    this.btnGuardarCargando = true;
    this.f.companiaId.setValue(parseInt(this.auth.tokenDecoded.primarygroupsid) );

    this.httpService.DoPostAny<Usuario>(DataApi.Usuario,
      metodo, this.Formulario.value).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0], "Error");
        } else {
          this.toastService.success("Realizado", "OK");
          this.router.navigateByUrl('/mantenimientos/usuario');
        }

        this.btnGuardarCargando = false;
      }, error => {
        console.log(error)
        this.btnGuardarCargando = false;
        this.toastService.error("Error conexion al servidor");
      });

  }













  getUsuariosSupervisores() {
    this.loadingUsuarios = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetUsuarios", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.supervisores = response.records;
        }
        this.loadingUsuarios = false;
      }, error => {
        this.loadingUsuarios = false;
        this.toastService.error("No se pudo obtener los supervisores", "Error conexion al servidor");

        setTimeout(() => {
          this.getUsuariosSupervisores();
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
          this.getDocumentosTipo();
        }, 1000);

      });
  }

  getRoles() {
    this.loadingRoles = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetRolesComboBox", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.roles = response.records;
        }
        this.loadingRoles = false;
      }, error => {
        this.loadingRoles = false;
        this.toastService.error("No se pudo obtener los roles", "Error conexion al servidor");
        setTimeout(() => {
          this.getRoles();
        }, 1000);
      });
  }

  getDepartamentos() {
    this.loadingDepartamentos = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetDepartamentos", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.departamentos = response.records;
        }
        this.loadingDepartamentos = false;
      }, error => {
        this.loadingDepartamentos = false;
        this.toastService.error("No se pudo obtener los departamentos", "Error conexion al servidor");
        setTimeout(() => {
          this.getDepartamentos();
        }, 1000);
      });
  }

  getUsuarioTiposSolicitud() {
    this.loadingUsuarioTiposSolicitud = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetUsuarioTiposSolicitud", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.usuarioTiposSolicitud = response.records;
        }
        this.loadingUsuarioTiposSolicitud = false;
      }, error => {
        this.loadingUsuarioTiposSolicitud = false;
        this.toastService.error("No se pudo obtener los tipos solicitud", "Error conexion al servidor");
        setTimeout(() => {
          this.getUsuarioTiposSolicitud();
        }, 2000);
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
            // this.f.celular.setValue(cliente.celular);

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



  getRutasbyRol(RolId: number = 0) {
    this.loadingRutas = true;
    this.MostrarRutas = false;
    let parametros: Parametro[] = [{ key: "RolId", value: (RolId == 0 ? this.f.rolID.value :  RolId )}];
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetRutasByRolComboBox", parametros).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
          console.error(response.errores[0]);
          this.MostrarRutas = false;
        } else {
          this.rutas = response.records;

          console.log( this.rutas)
          if (response.records.length > 0) {
            this.MostrarRutas = true;

          }
          // console.table(this.confirmed)
        }

        this.loadingRutas = false;
      }, error => {
        this.loadingRutas = false;
        this.MostrarRutas = false;
        this.toastService.error("Error conexion al servidor");
      });
  }

  VerificarRutaEnUso(ruta) {

    let RutaID: number = Number(ruta.codigo);

    this.httpService.DoPostAny<any>(DataApi.Ruta,
      "GetDisponiblesRutas", RutaID).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          //validar que existe
          if (!response.ok) {
            this.toastService.error(response.errores[0]);
            console.error(response.errores[0]);

          } else {
            if (response.records.length > 0) {
              let usuario = response.records[0];
              this.f.rutaId.setValue(null);
              this.toastService.error("Lo sentimos, esta ruta esta en uso. Por el usuario: " + usuario.userName + " y la ruta: " + usuario.rutaId);
            }
          }
        }

      }, error => {
        this.toastService.error("Error conexion al servidor");
      });
  }






  //CONFIGURACIONES
  //CONFIGURACIONES | NIVEL AUTORIZACION
  openModalNivelAutorizacion(content) {
    this.getNivelesAutorizacion();
    this.getNivelesAutorizacionPorUsuario();
    this.modalService.open(content, { size: 'lg', backdrop: "static", });
  }

  getNivelesAutorizacion() {
    this.loadingNiveles = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetNivelAutorizacionComboBox", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
          console.error(response.errores[0]);
        } else {
          this.source = response.records;
        }

        this.loadingNiveles = false;
      }, error => {
        this.loadingNiveles = false;
        this.toastService.error("Error conexion al servidor");
      });
  }


  getNivelesAutorizacionPorUsuario() {
    this.loadingNiveles = true;
    let parametros: Parametro[] = [{ key: "usuarioID", value: this.usuarioID }];
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetNivelAutorizacionPorUsuarioComboBox", parametros).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
          console.error(response.errores[0]);
        } else {
          this.confirmed = response.records;
        }

        this.loadingNiveles = false;
      }, error => {
        this.loadingNiveles = false;
        this.toastService.error("Error conexion al servidor");
      });
  }

  guardarNivelesAutorizacionSeleccionados() {

    // if (this.confirmed.length < 1) {
    //   this.toastService.warning("Selecciona uno o más");
    //   return;
    // }

    let param = this.confirmed.map(x => { return { "UsuarioID": this.usuarioID, "NivelAutorizacionID": x.codigo }; });
    console.table(param);
    this.guardandoNivelesAsignados = true;
    this.httpService.DoPostAny<any>(DataApi.NivelAutorizacionModulo,
      "RegistrarNivelAutorizacionAUsario", param).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
          console.error(response.errores[0]);
        } else {
          this.modalService.dismissAll();
          this.toastService.success("Realizado", "OK");
        }
        this.guardandoNivelesAsignados = false;
      }, error => {
        this.guardandoNivelesAsignados = false;
        this.toastService.error("No se pudo guardar", "Error conexion al servidor");
        console.error(error);
      });

  }





 //CONFIGURACIONES | ASIGNACION SUCURSALES


  openModalAsignacionSucursales(content) {
    this.source=this.sucursales;
    this.getSucursalByUsuarioId();
    this.modalService.open(content, { size: 'lg', backdrop: "static", });
  }
  getSucursalByUsuarioId() {

    let parametros: Parametro[] = [
      { key: "UsuarioId", value: this.usuarioID },
    ]

    this.loadingSucursalByUsuario = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetSucursalesByUsuarioId", parametros).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
           this.confirmed=response.records;


        }
        this.loadingSucursalByUsuario = false;
      }, error => {
        this.loadingSucursalByUsuario = false;
        this.toastService.error("No se pudo obtener las sucursales", "Error conexion al servidor");

        setTimeout(() => {
          this.getSucursalByUsuarioId()
        }, 1000);

      });
  }
  guardarAsignacionSucursalesSeleccionadas() {

    // if (this.confirmed.length < 1) {
    //   this.toastService.warning("Selecciona uno o más");
    //   return;
    // }


    let param = this.confirmed.map(x => { return { "UsuarioID": this.usuarioID,"CompaniaID":
    Number(this.auth.tokenDecoded.primarygroupsid), "SucursalID": x.codigo ,"Predeterminada":0}; });

    if(this.confirmed.length<=0)
    {
      param.push({ "UsuarioID": this.usuarioID,"CompaniaID":
      Number(this.auth.tokenDecoded.primarygroupsid), "SucursalID": 0, "Predeterminada":0})
    }

    this.guardandoSucursalesAsignadas = true;
    this.httpService.DoPostAny<any>(DataApi.Usuario,
      "AsignaSucursalesAUsuario", param).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
          console.error(response.errores[0]);
        } else {
          this.modalService.dismissAll();
          this.toastService.success("Realizado", "OK");
        }
        this.guardandoSucursalesAsignadas = false;
      }, error => {
        this.guardandoSucursalesAsignadas = false;
        this.toastService.error("No se pudo guardar", "Error conexion al servidor");
        console.error(error);
      });

  }





 //CONFIGURACIONES | ASIGNACION CLIENTE TIPO
 getClienteTipos() {

  this.loadingClienteTipo = true;



  this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
    "GetTipoClienteComboBox",null).subscribe(response => {

      if (!response.ok) {
        this.toastService.error(response.errores[0]);
      } else {
        this.source = response.records;
      }
      this.loadingClienteTipo = false;
    }, error => {
      console.log(error)
      this.loadingClienteTipo = false;
      this.toastService.error("No se pudo obtener los tipos de cliente", "Error conexion al servidor");

      setTimeout(() => {
        this.getClienteTipos();
      }, 1000);

    });
}
  getClienteTiposByUsuario() {

    this.loadingClienteTipo = true;


    let parametros: Parametro[] = [{ key: "usuario", value: this.usuarioID}]

    this.httpService.DoPostAny<ComboBox>(DataApi.ComboBox,
      "GetTipoClienteComboBoxByUsuario",parametros[0]).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.confirmed = response.records;
        }
        this.loadingClienteTipo = false;
      }, error => {
        this.loadingClienteTipo = false;
        this.toastService.error("No se pudo obtener los tipos de cliente", "Error conexion al servidor");

        setTimeout(() => {
          this.getClienteTiposByUsuario();
        }, 1000);

      });
  }


  guardarAsignacionClienteTiposSeleccionados() {


    let param = this.confirmed.map(x => { return { "UsuarioID": this.usuarioID,"CompaniaID":
    Number(this.auth.tokenDecoded.primarygroupsid), "ClienteTipoID": x.codigo }; });

    if(this.confirmed.length<=0)
    {
      param.push({ "UsuarioID": this.usuarioID,"CompaniaID":
      Number(this.auth.tokenDecoded.primarygroupsid), "ClienteTipoID": 0 })
    }


    this.guardandoClienteTiposAsignados = true;
    this.httpService.DoPostAny<any>(DataApi.Usuario,
      "AsignaClienteTiposAUsuario", param).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
          console.error(response.errores[0]);
        } else {
          this.modalService.dismissAll();
          this.toastService.success("Realizado", "OK");
        }
        this.guardandoClienteTiposAsignados = false;
      }, error => {
        this.guardandoClienteTiposAsignados = false;
        this.toastService.error("No se pudo guardar", "Error conexion al servidor");
        console.error(error);
      });

  }

  openModalAsignacionClienteTipo(content) {
    this.getClienteTipos();
    this.getClienteTiposByUsuario();
    this.modalService.open(content, { size: 'lg', backdrop: "static", });
  }

}






