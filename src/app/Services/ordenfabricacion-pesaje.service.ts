import { EventEmitter, Injectable, Output } from '@angular/core';
import { OrdenFabricacionVista } from '../Modules/produccion/ordenfabricacion/models/OrdenFabricacionVista';

@Injectable({
  providedIn: 'root'
})
export class OrdenfabricacionPesajeService {

    ListaArticulo: Array<OrdenFabricacionVista> = new Array<OrdenFabricacionVista>();
    @Output() ListaArticuloChange: EventEmitter<Array<OrdenFabricacionVista>> = new EventEmitter();

    OrdenFabricacion: OrdenFabricacionVista = new OrdenFabricacionVista();
    @Output() OrdenFabricacionChange: EventEmitter<OrdenFabricacionVista> = new EventEmitter();

  constructor() { }

  SaveOrdenFabricacion(OrdenFabricacion: OrdenFabricacionVista) {
    this.OrdenFabricacion = OrdenFabricacion;
    this.OrdenFabricacionChange.emit(OrdenFabricacion);
  }

  SaveListArticulosDetalles(ListaArticuloValue: Array<OrdenFabricacionVista>) {
    this.ListaArticulo = ListaArticuloValue;
    this.ListaArticuloChange.emit(ListaArticuloValue);
  }

  // SaveArticuloPesaje(ArticuloPesaje: ArticuloPesaje) {
  //   this.ArticuloPesaje = ArticuloPesaje;
  // }


}
