import { Time } from "@angular/common";

export class HoraPicking {
    constructor() {
        this.id = 0;
        this.diaId = 0
        this.companiaId = 0
        this.horaDesde = null
        this.horaHasta = null
        this.sucursalId=0
        this.horaTope=null
        this.hayHorario=false
    }
    id: number
    diaId: number
    companiaId: number
    horaDesde: string
    horaHasta: string
    sucursalId:number
    horaTope:string
    hayHorario:boolean

}

