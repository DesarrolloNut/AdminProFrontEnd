import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminWebSincronizacionComponent } from './admin-web-sincronizacion/admin-web-sincronizacion/admin-web-sincronizacion.component';

import { ConfiguracionesComponent } from './configuraciones.component';
import { ControlHorarioCitasComponent } from './control-horario-citas/control-horario-citas.component';
import { SapSincronizacionPanelComponent } from './sap-sincronizacion/sap-sincronizacion-panel/sap-sincronizacion-panel.component';

const routes: Routes = [
  {
    path: '', component: ConfiguracionesComponent,
    children: [



      {
        path: 'sap-panel-sincronizacion', component: SapSincronizacionPanelComponent, data: {
          title: 'SAP Sincronización',
          urls: [
            { title: 'Configuraciones' },
            { title: 'SAP Sincronización' }
          ]
        }
      },


      {
        path: 'admin-web-panel-sincronizacion', component: AdminWebSincronizacionComponent, data: {
          title: 'Admin Sincronización',
          urls: [
            { title: 'Configuraciones' },
            { title: 'Admin Sincronización' }
          ]
        }
      },




      //******************************************************************************* */
      // horario citas
      {
        path: 'horario-citas', component: ControlHorarioCitasComponent, data: {
          title: 'Viacloud | Horario de Citas',
          urls: [
            { title: 'Configuraciones' },
            { title: 'Horario de Citas' }
          ]
        }
      },


    ]

  }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConfiguracionesRoutingModule { }
