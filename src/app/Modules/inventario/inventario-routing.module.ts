import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DevolucionesListadoComponent } from './devoluciones/devoluciones-listado/devoluciones-listado.component';
import { InventarioComponent } from './inventario.component';


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

  ]

}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InventarioRoutingModule { }
