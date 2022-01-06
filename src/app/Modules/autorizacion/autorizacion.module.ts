import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AutorizacionRoutingModule } from './autorizacion-routing.module';
import { AutorizacionComponent } from './autorizacion.component';
import { AutorizacionDevolucionesComponent } from './autorizacion-devoluciones/autorizacion-devoluciones.component';
import { AutorizacionHistoricoComponent } from './autorizacion-historico/autorizacion-historico.component';
import { ListaPreciosAutorizacionComponent } from './lista-precios-autorizacion/lista-precios-autorizacion.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AngularDualListBoxModule } from 'angular-dual-listbox';
import { TreeviewModule } from 'ngx-treeview';
import { SharedModule } from '../shared/shared.module';
import { AutorizacionOrdenfabricacionComponent } from './autorizacion-ordenfabricacion/autorizacion-ordenfabricacion.component';
import { AutorizacionPedidosComponent } from './autorizacion-pedidos/autorizacion-pedidos.component';
import { ChartsModule } from 'ng2-charts';


@NgModule({
  declarations: [
    AutorizacionComponent, AutorizacionDevolucionesComponent, AutorizacionHistoricoComponent, ListaPreciosAutorizacionComponent, AutorizacionOrdenfabricacionComponent, AutorizacionPedidosComponent],
  imports: [
    CommonModule,
    AngularDualListBoxModule,
    SharedModule,
    NgbModule,
    AutorizacionRoutingModule,
    TreeviewModule.forRoot(),
    ChartsModule,

  ]
})
export class AutorizacionModule { }
