import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VentasRoutingModule } from './ventas-routing.module';
import { VentasComponent } from './ventas.component';
import { OfertasConsultasFacturasComponent } from './ofertas/ofertas-consultas-facturas/ofertas-consultas-facturas.component';
import { SharedModule } from '../shared/shared.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AngularDualListBoxModule } from 'angular-dual-listbox';
import { NotacreditoListadoComponent } from './notacredito/notacredito-listado/notacredito-listado.component';
import { NotacreditoFormularioComponent } from './notacredito/notacredito-formulario/notacredito-formulario.component';


@NgModule({
  declarations: [VentasComponent, OfertasConsultasFacturasComponent, NotacreditoListadoComponent, NotacreditoFormularioComponent],
  imports: [
    CommonModule,
    VentasRoutingModule,
    SharedModule,
    NgbModule,
    AngularDualListBoxModule,
  ]
})
export class VentasModule { }
