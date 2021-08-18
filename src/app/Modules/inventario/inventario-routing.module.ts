import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DevolucionesListadoComponent } from './devoluciones/devoluciones-listado/devoluciones-listado.component';
import { EntregasListadoComponent } from './entregas/entregas-listado/entregas-listado.component';
import { InventarioComponent } from './inventario.component';
import { RecepcionActivoListadoComponent } from './recepcion-activo/recepcion-activo-listado/recepcion-activo-listado.component';


const routes: Routes = [  {
  path: '', component: InventarioComponent,
  children: [
    {
      path: 'devoluciones', component: DevolucionesListadoComponent, data: {
        title: 'Devoluciones',
        urls: [
          { title: 'Inventario' },
          { title: 'Devoluciones' },
        ]
      }
    },
    {
      path: 'recepcionactivo', component: RecepcionActivoListadoComponent, data: {
        title: 'Recepción Activo',
        urls: [
          { title: 'Inventario' },
          { title: 'Recepción Activo' },
        ]
      }
    },
    {
      path: 'entregas', component: EntregasListadoComponent, data: {
        title: 'Entregas',
        urls: [
          { title: 'Inventario' },
          { title: 'Entregas' },
        ]
      }
    },

  ]

}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InventarioRoutingModule { }
