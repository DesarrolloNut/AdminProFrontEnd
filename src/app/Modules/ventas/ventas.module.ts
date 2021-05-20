import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { VentasRoutingModule } from './ventas-routing.module';
import { VentasComponent } from './ventas.component';
import { OfertasConsultasFacturasComponent } from './ofertas/ofertas-consultas-facturas/ofertas-consultas-facturas.component';
import { AngularDualListBoxModule } from 'angular-dual-listbox';
import { NotacreditoListadoComponent } from './notacredito/notacredito-listado/notacredito-listado.component';
import { NotacreditoFormularioComponent } from './notacredito/notacredito-formulario/notacredito-formulario.component';
import { CotizacionesListadoComponent } from './cotizaciones/cotizaciones-listado/cotizaciones-listado.component';
import { CotizacionesFormularioComponent } from './cotizaciones/cotizaciones-formulario/cotizaciones-formulario.component';
import { ReporteprontopagoComponent } from './reporteprontopago/reporteprontopago.component';


@NgModule({
  declarations: [VentasComponent, OfertasConsultasFacturasComponent, NotacreditoListadoComponent, NotacreditoFormularioComponent, CotizacionesListadoComponent, CotizacionesFormularioComponent, ReporteprontopagoComponent],
  imports: [
    CommonModule,
    SharedModule,
    NgbModule,
    AngularDualListBoxModule,
    VentasRoutingModule,
  ]
})
export class VentasModule { }
