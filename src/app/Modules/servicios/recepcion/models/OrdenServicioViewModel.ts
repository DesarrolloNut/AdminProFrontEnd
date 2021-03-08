import { Cita } from "../../citas/model/Cita"
import { Orden } from "./Orden"
import { CitaClienteRecepcion } from "./CitaClienteRecepcion"
import { Usuario } from "./Usuario"
import { SintomaViewModel } from "../../citas/model/SintomaViewModel"
import { Cliente } from "src/app/Modules/mantenimientos/clientes/models/Cliente"
import { Compania } from "src/app/Modules/mantenimientos/companias/models/Compania"
import { Articulo } from "./Articulo"

export class OrdenServicioViewModel {

    constructor() {
        this.cita = new Cita();
        this.orden = new Orden();
        this.cliente = new Cliente();
        this.clienteRecepcion = new CitaClienteRecepcion();
        this.vehiculo = new Articulo();
        this.sintomas = [];
        this.asesor =new Usuario();
        this.compania = new Compania();
    }

    cita: Cita
    orden: Orden
    cliente: Cliente
    clienteRecepcion: CitaClienteRecepcion

    compania: Compania
    receptorNombre: string

    ////asesor
    asesor: Usuario

    ////Datos sacados de la cita o recepcion
    tag: string
    vehiculo: Articulo
    modelo: string
    marca: string
    color: string
    sintomas: SintomaViewModel[]
}