import { EventEmitter, Injectable, Output } from '@angular/core';
import { OrdenFabricacionVista } from '../Modules/produccion/ordenfabricacion/models/OrdenFabricacionVista';

@Injectable({
  providedIn: 'root'
})
export class OrdenfabricacionPesajeService {

    OrdenFabricacion: OrdenFabricacionVista = new OrdenFabricacionVista();
    @Output() OrdenFabricacionChange: EventEmitter<OrdenFabricacionVista> = new EventEmitter();

  constructor() { }

  SaveOrdenFabricacion(OrdenFabricacion: OrdenFabricacionVista) {
    this.OrdenFabricacion = OrdenFabricacion;
    this.OrdenFabricacionChange.emit(OrdenFabricacion);
  }

  // SaveArticuloPesaje(ArticuloPesaje: ArticuloPesaje) {
  //   this.ArticuloPesaje = ArticuloPesaje;
  // }


}
