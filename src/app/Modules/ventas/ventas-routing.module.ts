import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { OfertasConsultasFacturasComponent } from './ofertas/ofertas-consultas-facturas/ofertas-consultas-facturas.component';
import { VentasComponent } from './ventas.component';


const routes: Routes = [
  {
    path: '', component: VentasComponent,
    children: [



      {
        path: 'ofertas-consulta-factura', component: OfertasConsultasFacturasComponent, data: {
          title: 'Viacloud | Consulta de Ofertas',
          urls: [
            { title: 'Ventas' },
            { title: 'Consulta de Ofertas' }
          ]
        }
      },

      { path: 'reportes-de-ventas', loadChildren: () => import('./ventas-reportes/ventas-reportes.module').then(m => m.VentasReportesModule) },

    ]

  }];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VentasRoutingModule { }
