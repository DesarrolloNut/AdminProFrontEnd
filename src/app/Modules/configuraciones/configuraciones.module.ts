import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ConfiguracionesRoutingModule } from './configuraciones-routing.module';
import { ConfiguracionesComponent } from './configuraciones.component';
import { SharedModule } from '../shared/shared.module';
import { ControlHorarioCitasComponent } from './control-horario-citas/control-horario-citas.component';
import { NgbTimepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { SapSincronizacionPanelComponent } from './sap-sincronizacion/sap-sincronizacion-panel/sap-sincronizacion-panel.component';
import { AdminWebSincronizacionComponent } from './admin-web-sincronizacion/admin-web-sincronizacion/admin-web-sincronizacion.component';
import { ModuloCompaniaEnrrollFormularioComponent } from './modulo-compania-enrroll/modulo-compania-enrroll-formulario/modulo-compania-enrroll-formulario.component';
import { ModuloCompaniaEnrrollListadoComponent } from './modulo-compania-enrroll/modulo-compania-enrroll-listado/modulo-compania-enrroll-listado.component';


@NgModule({
  declarations: [ConfiguracionesComponent, 
    ControlHorarioCitasComponent, 
    SapSincronizacionPanelComponent, 
    AdminWebSincronizacionComponent,
    ModuloCompaniaEnrrollFormularioComponent,
    ModuloCompaniaEnrrollListadoComponent
  ],
  imports: [
    CommonModule,
    ConfiguracionesRoutingModule,
    SharedModule,
    NgbTimepickerModule
  ]
})
export class ConfiguracionesModule { }
