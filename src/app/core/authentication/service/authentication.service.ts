import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { BackendService } from '../../http/service/backend.service';
import { NgxPermissionsService } from 'ngx-permissions';
import { Router } from '@angular/router';
import { DataApi } from '../../../shared/enums/DataApi.enum';
import { Permiso } from '../model/Permiso';
import { UsuarioForLogin } from '../../../Modules/login/model/UsuarioForLogin.model';
import { map } from 'rxjs/operators';
import { TokenModel } from '../model/TokenModel';



@Injectable({
    providedIn: 'root'
})
export class AuthenticationService {


    helper = new JwtHelperService();
    tokenDecoded: TokenModel;

    constructor(public httpService: BackendService,
        public permissionsService: NgxPermissionsService,
        private router: Router,
        //private toastService: ToastService,
    ) {
    }

    loggedIn(): boolean {
        const token = localStorage.getItem("keyVC");
        return !this.helper.isTokenExpired(token);
    }

    setDecodeToken(): void {
        let token = localStorage.getItem("keyVC");
        this.tokenDecoded = this.helper.decodeToken(token);
    }


    login(usuario: UsuarioForLogin) {
        return this.httpService.DoPostAny<any>(DataApi.Authentication,
            "Login", usuario)
            .pipe(
                map(res => {
                    // login successful if there's a jwt token in the response  && user.token
                    if (res.ok) {
                        // store user details and jwt token in local storage to keep user logged in between page refreshes

                        let token = res.valores[0];
                        localStorage.setItem("keyVC", token);
                        this.setDecodeToken();
                        //console.log(this.tokenDecoded)
                        let permisos: Permiso[] = res.valores[1];
                        //console.table(permisos.map(p => p.nombre));
                        this.permissionsService.loadPermissions(permisos.map(p => p.nombre));
                    }
                    return res;
                }));

    }

    logout(): void {
        // remove user from local storage to log user out
        localStorage.removeItem('keyVC');
        this.router.navigate(['/login']);
        this.permissionsService.flushPermissions();
    }

    setPermissions(): void {
        this.httpService.DoPostAny<any>(DataApi.Usuario, "GetPermisosUsuario", { "Id": Number(this.tokenDecoded.nameid) })
            .subscribe(res => {

                if (res.ok) {
                    let permisos: Permiso[] = res.valores[0];
                    this.permissionsService.loadPermissions(permisos.map(p => p.nombre));
                } else {
                    //this.toastService.Danger("Error interno! Mensaje: " + res.errores[0]);
                    console.error(res.errores);
                    // this.logout();
                    this.setPermissions();
                }

            }, error => {
                console.error(error);
                this.setPermissions();

                // this.logout();
            });
    }

    hasPermission(permiso: string): boolean {


        // this.permissionsService.permissions$.subscribe((permissions) => {
        //     // console.log(permissions.)
        // })

        // // return this.permissionsService.

        return false;

    }



}
