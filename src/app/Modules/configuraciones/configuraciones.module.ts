import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ConfiguracionesRoutingModule } from './configuraciones-routing.module';
import { ConfiguracionesComponent } from './configuraciones.component';
import { SharedModule } from '../shared/shared.module';
import { ControlHorarioCitasComponent } from './control-horario-citas/control-horario-citas.component';
import { NgbTimepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { SapSincronizacionPanelComponent } from './sap-sincronizacion/sap-sincronizacion-panel/sap-sincronizacion-panel.component';
import { AdminWebSincronizacionComponent } from './admin-web-sincronizacion/admin-web-sincronizacion/admin-web-sincronizacion.component';


@NgModule({
  declarations: [ConfiguracionesComponent, ControlHorarioCitasComponent, SapSincronizacionPanelComponent, AdminWebSincronizacionComponent],
  imports: [
    CommonModule,
    ConfiguracionesRoutingModule,
    SharedModule,
    NgbTimepickerModule
  ]
})
export class ConfiguracionesModule { }
