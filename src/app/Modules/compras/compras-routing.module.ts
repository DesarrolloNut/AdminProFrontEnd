import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ComprasComponent } from './compras.component';
import { SolicitudComprasFormularioComponent } from './solicitud-compras/solicitud-compras-formulario/solicitud-compras-formulario.component';
import { SolicitudComprasListadoComponent } from './solicitud-compras/solicitud-compras-listado/solicitud-compras-listado.component';



const routes: Routes = [
  {
    path: '', component: ComprasComponent,
    children: [

      // { path: 'reportes-de-ventas', loadChildren: () => import('./ventas-reportes/ventas-reportes.module').then(m => m.VentasReportesModule) },

      {
        path: 'solicitud-compras', component: SolicitudComprasListadoComponent, data: {
          title: 'Solicitudes de compras',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Solicitudes de compras' },
          ]
        }
      },

      {
        path: 'solicitud-compras/:id', component: SolicitudComprasFormularioComponent, data: {
          title: 'Solicitudes de compras Formulario',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Solicitudes de compras' },
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
