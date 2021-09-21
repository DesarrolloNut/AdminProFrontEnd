import { EventEmitter, Injectable, Output } from '@angular/core';
import { OrdenFabricacionVista } from '../Modules/produccion/ordenfabricacion/models/OrdenFabricacionVista';
import { ArticuloPesaje } from '../Modules/produccion/pesaje/models/ArticuloPesaje';

@Injectable({
  providedIn: 'root'
})
export class OrdenfabricacionPesajeService {

    OrdenFabricacion: OrdenFabricacionVista = new OrdenFabricacionVista();
    ArticuloPesaje: ArticuloPesaje = new ArticuloPesaje();
  // @Output() OrdenFabricacionChange: EventEmitter<OrdenFabricacionVista> = new EventEmitter();

  constructor() { }

  SaveOrdenFabricacion(OrdenFabricacion: OrdenFabricacionVista) {
    this.OrdenFabricacion = OrdenFabricacion;
  }

  SaveArticuloPesaje(ArticuloPesaje: ArticuloPesaje) {
    this.ArticuloPesaje = ArticuloPesaje;
  }


}
