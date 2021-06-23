import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AutorizacionDevolucionesComponent } from './devoluciones/autorizacion-devoluciones/autorizacion-devoluciones.component';
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
    {
      path: 'autorizaciondevoluciones', component: AutorizacionDevolucionesComponent, data: {
        title: 'Autorizacion Devoluciones',
        urls: [
          { title: 'Inventario' },
          { title: 'Autorizacion Devoluciones' },
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
