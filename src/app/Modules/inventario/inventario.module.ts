import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InventarioRoutingModule } from './inventario-routing.module';
import { InventarioComponent } from './inventario.component';
import { SharedModule } from '../shared/shared.module';
import { DevolucionesListadoComponent } from './devoluciones/devoluciones-listado/devoluciones-listado.component';
import { AutorizacionDevolucionesComponent } from '../mantenimientos/autorizacion/autorizacion-devoluciones/autorizacion-devoluciones.component';


@NgModule({
  declarations: [InventarioComponent, DevolucionesListadoComponent, AutorizacionDevolucionesComponent],
  imports: [
    CommonModule,
    SharedModule,
    InventarioRoutingModule
  ]
})
export class InventarioModule { }
