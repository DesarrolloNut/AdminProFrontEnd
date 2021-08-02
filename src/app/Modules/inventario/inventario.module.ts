import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InventarioRoutingModule } from './inventario-routing.module';
import { InventarioComponent } from './inventario.component';
import { SharedModule } from '../shared/shared.module';
import { DevolucionesListadoComponent } from './devoluciones/devoluciones-listado/devoluciones-listado.component';


@NgModule({
  declarations: [InventarioComponent, DevolucionesListadoComponent],
  imports: [
    CommonModule,
    SharedModule,
    InventarioRoutingModule
  ]
})
export class InventarioModule { }
