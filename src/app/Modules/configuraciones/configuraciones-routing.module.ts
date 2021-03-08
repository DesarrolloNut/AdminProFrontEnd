import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ConfiguracionesComponent } from './configuraciones.component';
import { ControlHorarioCitasComponent } from './control-horario-citas/control-horario-citas.component';

const routes: Routes = [
  {
    path: '', component: ConfiguracionesComponent,
    children: [


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
