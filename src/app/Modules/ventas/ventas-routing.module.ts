import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NotacreditoFormularioComponent } from './notacredito/notacredito-formulario/notacredito-formulario.component';
import { NotacreditoListadoComponent } from './notacredito/notacredito-listado/notacredito-listado.component';
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

            // Nota Credito
            {
              path: 'notacredito', component: NotacreditoListadoComponent, data: {
                title: 'Nota Credito',
                urls: [
                  { title: 'Mantenimientos' },
                  { title: 'Nota Credito' },
                ]
              }
            },


            {
              path: 'notacredito/:id', component: NotacreditoFormularioComponent, data: {
                title: 'Nota Credito Formulario',
                urls: [
                  { title: 'Mantenimientos' },
                  { title: 'Nota Credito' },
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
export class VentasRoutingModule { }
