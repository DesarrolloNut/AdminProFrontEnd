export class ModeloListadoViewModel {
    constructor() {
        this.id = 0;
        this.nombre = "";
        this.marca = "";
        this.version = "";
        this.imagenNombre = "";
        this.ano = 0;
        this.precio = 0;
    }

    id: number;
    nombre: string;
    marca: string;
    ano: number;
    version: string;
    precio: number;
    imagenNombre: string;

}