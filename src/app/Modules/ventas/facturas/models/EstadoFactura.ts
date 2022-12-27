
export class EstadoFactura {
    constructor() {
        this.id = 0;
        this.borrador=false;
        this.cancelado=false;
        this.confirmado=false;
        this.entregado=false;
        this.enviado=false;
        this.pagado=false;
        this.ultimoEstado="";
    }
    id: number;
    borrador:boolean;
    confirmado:boolean;
    pagado:boolean;
    enviado:boolean;
    cancelado:boolean;
    entregado:boolean;
    idFactura:number;
    ultimoEstado:string;
}