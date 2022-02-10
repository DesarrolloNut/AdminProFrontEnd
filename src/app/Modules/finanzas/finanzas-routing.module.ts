import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ChequesDevueltosListadoComponent } from './cuentas-por-cobrar/cheques-devueltos/cheques-devueltos-listado/cheques-devueltos-listado.component';


const routes: Routes = [
  {
    path: "cuentas-por-cobrar/cheques-devueltos", component: ChequesDevueltosListadoComponent, data: {
      title: 'Chueques Devueltos',
      urls: [
        { title: 'Finanzas' },
        { title: 'Cuentas Por Cobrar' },
        { title: 'Cheques Devueltos' },
      ]
    }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FinanzasRoutingModule { }
