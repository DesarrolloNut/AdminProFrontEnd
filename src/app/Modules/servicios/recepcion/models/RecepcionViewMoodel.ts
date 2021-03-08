import { Cita } from "../../citas/model/Cita";
import { CitaClienteRecepcion } from "./CitaClienteRecepcion";
import { AlertaTablero } from "./AlertaTablero";
import { Accesorio } from "./Accesorio";
import { WebcamImage } from "ngx-webcam";
import { Articulo } from "./Articulo";

export class RecepcionViewModel {

    constructor() {

        this.cita = new Cita();
        this.vehiculo = new Articulo();
        this.accesorios = [];
        this.alertasTablero = [];
        this.citaImagenes = [];
        this.citaClienteRecepcion = new CitaClienteRecepcion();
    }

    clienteNombre: string
    asesorNombre: string
    receptorNombre: string
    modelo: string
    marca: string
    tag: string
    cita: Cita
    vehiculo: Articulo
    alertasTablero: AlertaTablero[]
    accesorios: Accesorio[]
    citaImagenes: WebcamImage[]
    citaClienteRecepcion: CitaClienteRecepcion

}