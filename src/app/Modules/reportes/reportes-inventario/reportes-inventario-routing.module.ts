import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ReporteExistenciaComponent } from './reporte-existencia/reporte-existencia.component';
import { ReporteInventarioEntregaPedidosComponent } from './reporte-inventario-entrega-pedidos/reporte-inventario-entrega-pedidos.component';
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


      {
        path: 'entrega-pedidos', component: ReporteInventarioEntregaPedidosComponent, data: {
          title: 'Reporte de entregas de pedidos',
          urls: [
            { title: 'Reportes' },
            { title: 'Reporte de inventario' },
            { title: 'Entregas de pedidos' },
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
