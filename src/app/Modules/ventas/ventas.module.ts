import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VentasRoutingModule } from './ventas-routing.module';
import { VentasComponent } from './ventas.component';
import { OfertasConsultasFacturasComponent } from './ofertas/ofertas-consultas-facturas/ofertas-consultas-facturas.component';
import { SharedModule } from '../shared/shared.module';


@NgModule({
  declarations: [VentasComponent, OfertasConsultasFacturasComponent],
  imports: [
    CommonModule,
    VentasRoutingModule,
    SharedModule
  ]
})
export class VentasModule { }
