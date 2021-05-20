import { SolicitudesComprasFormularioComponent } from './solicitudCompras/solicitudes-compras-formulario/solicitudes-compras-formulario.component';
import { SolicitudesComprasListadoComponent } from './solicitudCompras/solicitudes-compras-listado/solicitudes-compras-listado.component';
import { ComprasComponent } from './compras.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';



const routes: Routes = [
  {
    path: '', component: ComprasComponent,
    children: [

      // { path: 'reportes-de-ventas', loadChildren: () => import('./ventas-reportes/ventas-reportes.module').then(m => m.VentasReportesModule) },

      {
        path: 'solicitudCompra', component: SolicitudesComprasListadoComponent, data: {
          title: 'Solicitud de compras',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Solicitud de compras' },
          ]
        }
      },

      {
        path: 'solicitudCompra/:id', component: SolicitudesComprasFormularioComponent, data: {
          title: 'Solicitud de compras Formulario',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Solicitud de compras' },
            { title: 'Formulario' }
          ]
        }
      },

    ]

  }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ComprasRoutingModule { }
