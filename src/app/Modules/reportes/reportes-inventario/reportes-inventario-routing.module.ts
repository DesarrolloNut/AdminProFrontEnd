import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ReporteCanastosComponent } from './reporte-canastos/reporte-canastos.component';
import { ReportesInventarioComponent } from './reportes-inventario.component';



const routes: Routes = [
  {
    path: '', component: ReportesInventarioComponent,
    children: [

      {
        path: 'canastos', component: ReporteCanastosComponent, data: {
          title: 'Reporte de canastos',
          urls: [
            { title: 'Reportes' },
            { title: 'Reporte de canastos' },
            { title: 'Canastos' },
          ]
        }
      },

    ]

  }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportesInventarioRoutingModule { }
