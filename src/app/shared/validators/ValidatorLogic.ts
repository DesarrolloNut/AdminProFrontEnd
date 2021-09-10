import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";
import { BackendService } from "src/app/core/http/service/backend.service";
import { Cliente } from "src/app/Modules/mantenimientos/clientes/models/Cliente";
import { ParametrosCita } from "src/app/Modules/turno/models/ParametrosCita";
import { DataApi } from "../enums/DataApi.enum";

export class ValidatorLogic {
    static httpService: BackendService;

    public static  regexValidator(regex: RegExp, error: ValidationErrors): ValidatorFn {
        return (control: AbstractControl): {[key: string]: any} => {
          if (!control.value) {
            return null;
          }
          const valid = regex.test(control.value);
          return valid ? null : error;
        };
      }
    public static ValidaCedulaFormacion(ced): boolean {
      
        var c = ced.replace(/-/g, '');
        var cedula = c.substr(0, c.length - 1);
        var verificador = c.substr(c.length - 1, 1);
        var suma = 0;
        var cedulaValida = false;
        if (ced.length < 11) { return false; }
        for (var i = 0; i < cedula.length; i++) {
            var mod: any = "";
            if ((i % 2) == 0) { mod = 1 } else { mod = 2 }
            var res: any = cedula.substr(i, 1) * mod;
            if (res > 9) {
                res = res.toString();
                var uno = res.substr(0, 1);
                var dos = res.substr(1, 1);
                res = eval(uno) + eval(dos);
            }
            suma += eval(res);
        }
        var el_numero = (10 - (suma % 10)) % 10;
        if (el_numero == verificador && cedula.substr(0, 3) != "000") {
            cedulaValida = true;
        }
        else {
            cedulaValida = false;
        }
        return cedulaValida;
    }

    public static    async ValidaExisteCedulaORNC(ced_rnc): Promise<boolean> {

        let parametros = new ParametrosCita();
        parametros.clienteDocumento = ced_rnc;

        let k =     await this.httpService.DoPostAnyAsync<Cliente>(DataApi.Cliente,
            "GetClienteOPadronDatos", parametros).then(async response => {
                console.log(response)
                console.log('FROM VALID')

              if (response.ok) {
                if (response != null&& response.valores != null && response.valores.length > 0) {
                 return  response.valores[0];
                } 
              } 
              return  true;
            }, error => {
                return  true;
            });
        console.log(k);
        return k;
    }
}