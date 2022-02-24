import { OrdenfabricacionFormularioComponent } from './ordenfabricacion/ordenfabricacion-formulario/ordenfabricacion-formulario.component';
import { OrdenfabricacionListadoComponent } from './ordenfabricacion/ordenfabricacion-listado/ordenfabricacion-listado.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PesajeFormularioComponent } from './pesaje/pesaje-formulario/pesaje-formulario.component';
import { PesajeListadoComponent } from './pesaje/pesaje-listado/pesaje-listado.component';
import { PesajeResultadoComponent } from './pesaje/pesaje-resultado/pesaje-resultado.component';
import { ProduccionComponent } from './produccion.component';
import { OrdenfabricacionPesajeComponent } from './ordenfabricacion/ordenfabricacion-pesaje/ordenfabricacion-pesaje.component';



const routes: Routes = [
  {
    path: '', component: ProduccionComponent,
    children: [

      // { path: 'reportes-de-ventas', loadChildren: () => import('./ventas-reportes/ventas-reportes.module').then(m => m.VentasReportesModule) },

      {
        path: 'pesajeApp', component: PesajeFormularioComponent, data: {
          title: 'Sistema de Pesajes',
          urls: [
            { title: 'Producción' },
            { title: 'Sistema de Pesajes' },
          ]
        }
      },
      
      {
        path: 'pesajeListado', component: PesajeListadoComponent, data: {
          title: 'Sistema de Pesajes',
          urls: [
            { title: 'Producción' },
            { title: 'Sistema de Pesajes' },
          ]
        }
      },

      // {
      //   path: 'pesaje/:id', component: PesajeFormularioComponent, data: {
      //     title: 'Sistema de Pesajes',
      //     urls: [
      //       { title: 'Producción' },
      //       { title: 'Sistema de Pesajes' },
      //       { title: 'Formulario' },
      //     ]
      //   }
      // },

      // {
      //   path: 'pesaje/:id/resultado', component: PesajeResultadoComponent, data: {
      //     title: 'Sistema de Pesajes',
      //     urls: [
      //       { title: 'Producción' },
      //       { title: 'Sistema de Pesajes' },
      //       { title: 'Resultados' },
      //     ]
      //   }
      // },


      {
        path: 'ordenfabricacion', component: OrdenfabricacionListadoComponent, data: {
          title: 'Orden Fabricación',
          urls: [
            { title: 'Producción' },
            { title: 'Orden Fabricación' },
          ]
        }
      },

      {
        path: 'ordenfabricacion/:id', component: OrdenfabricacionFormularioComponent, data: {
          title: 'Orden Fabricación',
          urls: [
            { title: 'Producción' },
            { title: 'Orden Fabricación' },
            { title: 'Formulario' },
          ]
        }
      },

      {
        path: 'ordenfabricacionpesaje', component: OrdenfabricacionPesajeComponent, data: {
          title: 'Orden Fabricación',
          urls: [
            { title: 'Producción' },
            { title: 'Orden Fabricación' },
            { title: 'Sistema de Pesajes' },
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
