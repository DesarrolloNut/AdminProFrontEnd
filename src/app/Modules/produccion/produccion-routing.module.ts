import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PesajeFormularioComponent } from './pesaje/pesaje-formulario/pesaje-formulario.component';
import { PesajeListadoComponent } from './pesaje/pesaje-listado/pesaje-listado.component';
import { ProduccionComponent } from './produccion.component';



const routes: Routes = [
  {
    path: '', component: ProduccionComponent,
    children: [

      // { path: 'reportes-de-ventas', loadChildren: () => import('./ventas-reportes/ventas-reportes.module').then(m => m.VentasReportesModule) },

      {
        path: 'pesaje', component: PesajeListadoComponent, data: {
          title: 'Sistema de Pesajes',
          urls: [
            { title: 'Producción' },
            { title: 'Sistema de Pesajes' },
          ]
        }
      },

      {
        path: 'pesaje/:id', component: PesajeFormularioComponent, data: {
          title: 'Sistema de Pesajes',
          urls: [
            { title: 'Producción' },
            { title: 'Sistema de Pesajes' },
            { title: 'Formulario' },
          ]
        }
      },


    ]

  }];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProduccionRoutingModule { }
