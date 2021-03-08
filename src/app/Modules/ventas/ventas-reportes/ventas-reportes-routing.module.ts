import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ReporteOfertasOtorgadasComponent } from './reporte-ofertas-otorgadas/reporte-ofertas-otorgadas.component';
import { VentasReportesComponent } from './ventas-reportes.component';


const routes: Routes = [
  {
    path: '', component: VentasReportesComponent,
    children: [

      {
        path: 'reporte-ofertas-otorgadas', component: ReporteOfertasOtorgadasComponent, data: {
          title: 'Viacloud | Reporte de Ofertas Otorgadas',
          urls: [
            { title: 'Ventas' },
            { title: 'Reportes de Ventas' },
            { title: 'Reporte de Ofertas Otorgadas' }
          ]
        }
      },

    ]

  }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VentasReportesRoutingModule { }
