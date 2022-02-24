import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PesajeResultadoCodigoBarraComponent } from './pesaje/pesaje-resultado-codigo-barra/pesaje-resultado-codigo-barra.component';


const routes: Routes = [
  {
    path: 'pesaje-resultado-codigo-barra/:id', component: PesajeResultadoCodigoBarraComponent, data: {
      title: 'SAP Sincronización',
      urls: [
        { title: 'Configuraciones' },
        { title: 'SAP Sincronización' }
      ]
    }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ImpresionProduccionRoutingModule { }
