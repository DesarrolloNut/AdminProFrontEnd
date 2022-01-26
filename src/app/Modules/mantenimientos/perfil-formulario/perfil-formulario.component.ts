import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'src/app/core/authentication/service/authentication.service';
import { Parametro } from 'src/app/core/http/model/Parametro';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { ComboBox } from 'src/app/shared/model/ComboBox';
import { cedulaestructura } from 'src/app/shared/validators/cedula-estructura.validator';
import { ValidatorLogic } from 'src/app/shared/validators/ValidatorLogic';
import { Cliente } from '../clientes/models/Cliente';

@Component({
  selector: 'app-perfil-formulario',
  templateUrl: './perfil-formulario.component.html',
  styleUrls: ['./perfil-formulario.component.scss']
})
export class PerfilFormularioComponent implements OnInit {

  sucursales: ComboBox[] = [];
  roles: ComboBox[] = [];
  documentos: ComboBox[];

  loadingButtonCambiar = false;

  Cargando: boolean = false;
  Formulario: FormGroup;
  FormularioChangePassword: FormGroup;
  submitted = false;
  submittedPassword = false;
  btnGuardarCargando = false;
  actualizandoUsuario = false;

  loadingSucursales = false;
  loadingRoles = false;
  loadingDocumentos = false;
  buscandoDocumento: boolean;

  closeResult: string;
  constructor(
    private toastService: ToastrService,
    private route: ActivatedRoute,
    private httpService: BackendService,
    private auth: AuthenticationService,
    private router: Router,
    private modalService: NgbModal,
    private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    // let usuarioID = Number(this.auth.tokenDecoded.nameid);
    // console.log(this.auth.tokenDecoded);

    // if (usuarioID > 0) {
    //   this.getUsuarioByID(usuarioID);
    //   this.actualizandoUsuario = true;
    // }

    // this.getDocumentosTipo();
    // // this.getRoles();
    // // this.getSucursales();

    // this.CreateForm();
    this.CreateFormChangePassword();
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
      // celular: [null, [Validators.required]],
      estadoID: [0,],
      companiaID: [0,],
      sucursalID: [0,],
      direccion: ['',],
    },
      {
        validator: cedulaestructura('documento', 'documentoTipoID')
      });
  }

  private CreateFormChangePassword() {

    this.FormularioChangePassword = this.formBuilder.group({
      passwordActual: [null, [Validators.required]],
      password: [null, [Validators.required]],
      passwordConfirm: [null, [Validators.required]],
      userName: [this.auth.tokenDecoded.unique_name]
    }, {
      validator: this.MustMatch('password', 'passwordConfirm')
    })

  }
  get f() { return this.Formulario.controls; } // acceder a los controles del formulario para no escribir tanto codigo en el html
  get fC() { return this.FormularioChangePassword.controls; } // acceder a los controles del formulario para no escribir tanto codigo en el html


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
            this.router.navigateByUrl('/home');
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

  onSubmitChangePassword() {
    this.submittedPassword = true;
    console.log(this.FormularioChangePassword.controls)
    if (this.FormularioChangePassword.invalid) {
      return;
    }
    console.log('ready')
    this.changePassword()
  }

  changePassword() {
    this.loadingButtonCambiar = true;
    this.httpService.DoPostAny<any>(DataApi.Usuario,
      'ChangePassword', this.FormularioChangePassword.value).subscribe(response => {
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
  
  guardarUsuario() {
    let documentoSinGuion: string = `${this.f.documento.value}`.replace(/-/g, ''); // eliminar guiones
    this.f.documento.setValue(documentoSinGuion)
    let metodo: string = this.actualizandoUsuario ? "Update" : "Registrar";
    this.btnGuardarCargando = true;

    this.httpService.DoPostAny<any>(DataApi.Usuario,
      metodo, this.Formulario.value).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0], "Error");
        } else {
          this.toastService.success("Realizado", "OK");
          this.router.navigateByUrl('/home');
        }

        this.btnGuardarCargando = false;
      }, error => {
        this.btnGuardarCargando = false;
        this.toastService.error("Error conexion al servidor");
      });

  }


  open1(content1) {
    this.modalService.open(content1, { ariaLabelledBy: 'modal-basic-title' });
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
    documento = documento.replace(/-/g, ''); // eliminar guiones

    this.httpService.DoPostAny<Cliente>(DataApi.Cliente,
      "GetClienteOPadronDatos", { documento }).subscribe(response => {

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
    }
  }


}
