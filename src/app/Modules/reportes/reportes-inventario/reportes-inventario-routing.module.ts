import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router'; 
import { ReporteExistenciaComponent } from './reporte-existencia/reporte-existencia.component';
import { ReportesInventarioComponent } from './reportes-inventario.component';



const routes: Routes = [
  {
    path: '', component: ReportesInventarioComponent,
    children: [

      {
        path: 'existencia', component: ReporteExistenciaComponent, data: {
          title: 'Reporte de existencia',
          urls: [
            { title: 'Reportes' },
            { title: 'Reporte de inventario' },
            { title: 'Existencia' },
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
