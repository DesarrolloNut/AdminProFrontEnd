import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { ComboBox } from '../../shared/model/ComboBox';
import { AuthenticationService } from '../../core/authentication/service/authentication.service';
import { BackendService } from '../../core/http/service/backend.service';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { UsuarioForLogin } from './model/UsuarioForLogin.model';
import { Parametro } from 'src/app/core/http/model/Parametro';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { ToastrService } from 'ngx-toastr';
import { Permiso } from 'src/app/core/authentication/model/Permiso';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    providers: []
})
export class LoginComponent implements OnInit, OnDestroy {

    loginForm: FormGroup;
    loading = false;
    submitted = false;
    returnUrl: string;
    error: string = null;
    selectedSucursal: ComboBox = null;

    sucursales: ComboBox[] = null
    estilo1 = null;
    estilo2 = null;
    mostrarLogin = true;
    loadingSucursales: boolean;

    timeOut: NodeJS.Timeout;

    dias: ComboBox[] = [
        {codigo:1,nombre:"Lunes", grupoID:"", grupo:""},
        {codigo:2,nombre:"Martes", grupoID:"", grupo:""},
        {codigo:3,nombre:"Miercoles", grupoID:"", grupo:""},
        {codigo:4,nombre:"Jueves", grupoID:"", grupo:""},
        {codigo:5,nombre:"Viernes", grupoID:"", grupo:""},
        {codigo:6,nombre:"Sabado", grupoID:"", grupo:""},
        {codigo:7,nombre:"Domingo", grupoID:"", grupo:""},
    ]




    FormularioChangePassword: FormGroup;
    submittedPassword: boolean
    loadingButtonCambiar: boolean;
    @ViewChild('modalChangePw') modalChangePw: ElementRef<HTMLDivElement>;

    constructor(
        public formBuilder: FormBuilder,
        public route: ActivatedRoute,
        public router: Router,
        public httpService: BackendService,
        public toastService: ToastrService,
        private modalService: NgbModal,
        //public permissionsService: NgxPermissionsService,
        //public toastService: ToastService,
        public authenticationService: AuthenticationService
    ) {
    }

    ngOnInit(): void {


        if (this.authenticationService.loggedIn()) {
            this.router.navigate(['/']);
        }

        this.getSucursales();

        this.loginForm = this.formBuilder.group({
            usuario: ['', Validators.required],
            sucursalID: [null, Validators.required],
            password: ['', [Validators.required]]
        });


        //modal change pass
        this.CreateFormChangePassword();
    }


    private CreateFormChangePassword() {

        this.FormularioChangePassword = this.formBuilder.group({
            password: [null, [Validators.required, Validators.minLength(8)]],
            passwordConfirm: [null, [Validators.required]],
        }, {
            validator: this.MustMatch('password', 'passwordConfirm')
        })

    }
    get fC() { return this.FormularioChangePassword.controls; } // acceder a los controles del formulario para no escribir tanto codigo en el html

    // convenience getter for easy access to form fields
    get f() { return this.loginForm.controls; }

    Login() {
        this.submitted = true;

        if (this.loginForm.invalid)
            return;

        this.loading = true;
        this.authenticationService.login(this.loginForm.value).subscribe(response => {

            if (!response || !response.ok) {
                console.error(response.errores[0]);
                this.error = response.errores[0];
                this.loading = false;
                return;
            }

            let permisos = <Permiso[]>response.valores[1];
            let permisosNombres = permisos.map(p => p.nombre.trim().toLowerCase())

            this.redireccionarARuta(permisosNombres)

            //validate default password change
            let showModalChangePass: boolean = response.valores[2];

            showModalChangePass ? this.openModalChangePw() : 0

            this.loading = false;
        }, error => {
            console.log(error)
            this.error = error;
            this.loading = false;
        });

    }



    redireccionarARuta(permisos: string[]) {

        if (permisos.find(p => p == "turnos_pantalla")) {
            this.router.navigateByUrl("/turno/servicios");
            return;
        }

        if (permisos.find(p => p == "turnos_listado")) {
            this.router.navigateByUrl("/turno/listado");
            return;
        }

        this.router.navigateByUrl("/home");
    }

    getSucursales() {
        this.loadingSucursales = true;
        let parametros: Parametro[] = [
            { key: "CompaniaID", value: 0 }
        ];
        this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
            "GetSucursalesByCompania", parametros).subscribe(response => {

                if (!response.ok) {
                    this.toastService.error(response.errores[0]);
                    let thes = this;
                    this.timeOut = setTimeout(() => {
                        thes.getSucursales();
                    }, 1000);
                } else {
                    this.sucursales = response.records;
                }

                this.loadingSucursales = false;
            }, error => {
                let thes = this;
                this.timeOut = setTimeout(() => {
                    thes.getSucursales();
                }, 1000);

                this.loadingSucursales = false;
                this.toastService.error("No se pudo obtener las sucursales.", "Error conexion al servidor");
            });
    }

    ngOnDestroy(): void {
        window.clearTimeout(this.timeOut)
    }
    //cancelar() {
    //    this.estilo1 = null;
    //    this.estilo2 = null;
    //    this.loginForm.reset();
    //    this.submitted = false;
    //    this.mostrarLogin = true;
    //    this.selectedSucursal = null;
    //    this.error = null;
    //}

    //validateUser() {

    //    this.loading = true;

    //    this.usuario = {
    //        usuario: this.f.username.value,
    //        password: this.f.password.value,
    //        sucursalID: 0
    //    };

    //    this.httpService.DoPostAny<ComboBox>(DataApi.Authentication, "ValidateUser", this.usuario).subscribe(response => {

    //        if (!response || !response.ok) {
    //            this.error = response.errores[0];
    //            this.loading = false;
    //            return;
    //        }

    //        this.sucursales = response.records;
    //        //this.girarLogin();
    //        this.loading = false;

    //    }, error => {
    //        //this.toastService.Danger("Error interno! Mensaje: " + error);
    //        console.error(error);
    //        this.loading = false;
    //    });

    //}





    //change password modal

    openModalChangePw() {
        this.modalService.open(this.modalChangePw,
            { ariaLabelledBy: 'modal-basic-title', backdrop: 'static', keyboard: false });
    }


    onSubmitChangePassword() {
        this.submittedPassword = true;
        console.log(this.FormularioChangePassword.controls)
        if (this.FormularioChangePassword.invalid) {
            return;
        }

        this.changePassword()
    }

    changePassword() {

        let param = { "UsuarioId": Number(this.authenticationService.tokenDecoded.nameid), "PasswordNueva": this.fC.passwordConfirm.value, };

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
