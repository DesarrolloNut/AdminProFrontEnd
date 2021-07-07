import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ComprasComponent } from './compras.component';
import { OrdenComprasFormularioComponent } from './orden-compras/orden-compras-formulario/orden-compras-formulario.component';
import { OrdenComprasListadoComponent } from './orden-compras/orden-compras-listado/orden-compras-listado.component';
import { SolicitudComprasAutorizacionComponent } from './solicitud-compras/solicitud-compras-autorizacion/solicitud-compras-autorizacion.component';
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
            { title: 'Compras' },
            { title: 'Solicitudes de compras' },
          ]
        }
      },

      {
        path: 'solicitud-compras/:id', component: SolicitudComprasFormularioComponent, data: {
          title: 'Solicitud de compras Formulario',
          urls: [
            { title: 'Compras' },
            { title: 'Solicitudes de compras' },
            { title: 'Formulario' }
          ]
        }
      },

      {
        path: 'solicitud-compras-autorizacion', component: SolicitudComprasAutorizacionComponent, data: {
          title: 'Autorización solicitudes de compras',
          urls: [
            { title: 'Compras' },
            { title: 'Autorización solicitudes de compras' },
          ]
        }
      },


      {
        path: 'orden-compras', component: OrdenComprasListadoComponent, data: {
          title: 'Ordenes de compras',
          urls: [
            { title: 'Compras' },
            { title: 'Orden de compras' },
          ]
        }
      },

      {
        path: 'orden-compras/:id', component: OrdenComprasFormularioComponent, data: {
          title: 'Orden de compras Formulario',
          urls: [
            { title: 'Compras' },
            { title: 'Orden de compras' },
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
