import { version } from "process";

export class Modelo {
    constructor() {
        this.id = 0
        this.nombre = ""
        this.estadoID = 0;
        this.version = ""
        this.precio = 0
        this.imagenNombre = ""
        this.descripcion = ""
        this.garantia = ""
        this.motor = ""
        this.transmision = ""
        this.tecnico = ""
        this.seguridad = ""
    }
    id: number
    nombre: string
    estadoID: number
    version: string
    precio: number
    imagenNombre: string
    descripcion: string
    garantia: string
    motor: string
    transmision: string
    tecnico: string
    seguridad: string

}