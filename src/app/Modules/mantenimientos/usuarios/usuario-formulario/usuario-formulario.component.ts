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
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-usuario-formulario',
  templateUrl: './usuario-formulario.component.html',
  styleUrls: ['./usuario-formulario.component.scss']
})
export class UsuarioFormularioComponent implements OnInit {



  sucursales: ComboBox[] = [];
  roles: ComboBox[] = [];
  documentos: ComboBox[];

  Cargando: boolean = false;
  Formulario: FormGroup;
  submitted = false;
  btnGuardarCargando = false;
  actualizandoUsuario = false;

  loadingSucursales = false;
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


  constructor(
    private toastService: ToastrService,
    private route: ActivatedRoute,
    private httpService: BackendService,
    private router: Router,
    private modalService: NgbModal,
    private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.usuarioID = Number(this.route.snapshot.paramMap.get('id'));

    if (this.usuarioID > 0) {
      this.getUsuarioByID(this.usuarioID);
      this.actualizandoUsuario = true;
    }

    this.getDocumentosTipo();
    this.getUsuariosSupervisores();
    this.getRoles();
    this.getSucursales();

    this.CreateForm();

    this.configDualList()
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
      dealerID: [0,],
      telefono: [null, [Validators.required]],
      celular: [null, [Validators.required]],
      estadoID: [0,],
      companiaID: [0,],
      sucursalID: [null, [Validators.required]],
      telefonoExtension: [null, [Validators.required]],
      codigoReferencia: [null, [Validators.required]],
      idUsuarioSupervisor: [null, [Validators.required]],
    },
      {
        validator: cedulaestructura('documento', 'documentoTipoID')
      });
  }

  get f() { return this.Formulario.controls; } // acceder a los controles del formulario para no escribir tanto codigo en el html


  getUsuarioByID(usuarioID: number) {
    this.Cargando = true;
    this.httpService.DoPostAny<any>(DataApi.Usuario,
      "GetUsuarioByID", usuarioID).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          //validar que existe
          if (response != null && response.records != null && response.records.length > 0) {

            let usuario = response.records[0]
            delete usuario.passwordHash;
            delete usuario.passwordSalt;

            this.Formulario.setValue(usuario);
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
          this.getUsuariosSupervisores()
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
        this.getRoles();
        this.loadingRoles = false;
        this.toastService.error("No se pudo obtener los roles", "Error conexion al servidor");
        setTimeout(() => {
          this.getRoles();
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


  openModalNivelAutorizacion(content) {
    this.getNivelesAutorizacion()
    this.getNivelesAutorizacionPorUsuario()
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
          console.table(this.source)
        }

        this.loadingNiveles = false;
      }, error => {
        this.loadingNiveles = false;
        this.toastService.error("Error conexion al servidor");
      });
  }


  getNivelesAutorizacionPorUsuario() {
    this.loadingNiveles = true;
    let parametros: Parametro[] = [{ key: "usuarioID", value: this.usuarioID }]
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetNivelAutorizacionPorUsuarioComboBox", parametros).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
          console.error(response.errores[0]);
        } else {
          this.confirmed = response.records;
          console.table(this.confirmed)
        }

        this.loadingNiveles = false;
      }, error => {
        this.loadingNiveles = false;
        this.toastService.error("Error conexion al servidor");
      });
  }

  guardarNivelesAutorizacionSeleccionados() {

    if (this.confirmed.length < 1) {
      this.toastService.warning("Selecciona uno o más");
      return;
    }

    let param = this.confirmed.map(x => { return { "UsuarioID": this.usuarioID, "NivelAutorizacionID": x.codigo } })
    console.table(param)
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






}






