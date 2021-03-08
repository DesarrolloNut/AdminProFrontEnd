export class ValidatorLogic {


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

}