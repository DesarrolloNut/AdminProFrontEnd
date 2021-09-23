import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DespachoListadoComponent } from './despacho/despacho-listado/despacho-listado.component';
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
    {
      path: 'despacho', component: DespachoListadoComponent, data: {
        title: 'Despacho',
        urls: [
          { title: 'Inventario' },
          { title: 'Despacho' },
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
