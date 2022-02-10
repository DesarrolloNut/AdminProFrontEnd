import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ChequesDevueltosFormularioComponent } from './cuentas-por-cobrar/cheques-devueltos/cheques-devueltos-formulario/cheques-devueltos-formulario.component';
import { ChequesDevueltosListadoComponent } from './cuentas-por-cobrar/cheques-devueltos/cheques-devueltos-listado/cheques-devueltos-listado.component';


const routes: Routes = [
  {
    path: "cuentas-por-cobrar/cheques-devueltos", component: ChequesDevueltosListadoComponent, data: {
      title: 'Cheques Devueltos',
      urls: [
        { title: 'Finanzas' },
        { title: 'Cuentas Por Cobrar' },
        { title: 'Cheques Devueltos' },
      ]
    }
  },
  {
    path: "cuentas-por-cobrar/cheques-devueltos/:id", component: ChequesDevueltosFormularioComponent, data: {
      title: 'Cheques Devueltos',
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
