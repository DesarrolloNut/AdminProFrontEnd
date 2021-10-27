import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AutorizacionDevolucionesComponent } from './autorizacion-devoluciones/autorizacion-devoluciones.component';
import { AutorizacionHistoricoComponent } from './autorizacion-historico/autorizacion-historico.component';
import { AutorizacionOrdenfabricacionComponent } from './autorizacion-ordenfabricacion/autorizacion-ordenfabricacion.component';
import { AutorizacionPedidosComponent } from './autorizacion-pedidos/autorizacion-pedidos.component';
import { AutorizacionComponent } from './autorizacion.component';
import { ListaPreciosAutorizacionComponent } from './lista-precios-autorizacion/lista-precios-autorizacion.component';


const routes: Routes = [

  {
    path: '', component: AutorizacionComponent,
    children: [

      {
        path: 'autorizacionprecios', component: ListaPreciosAutorizacionComponent, data: {
          title: 'Autorización de Precios',
          urls: [
            { title: 'Autorización' },
            { title: 'Autorización de Precios' }
          ]
        }
      },

      {
        path: 'autorizacion-historico', component: AutorizacionHistoricoComponent, data: {
          title: 'Autorización Histórico',
          urls: [
            { title: 'Autorización' },
            { title: 'Autorización Histórico' }
          ]
        }
      },

      {
        path: 'autorizaciondevoluciones', component: AutorizacionDevolucionesComponent, data: {
          title: 'Autorización Devoluciones',
          urls: [
            { title: 'Autorización' },
            { title: 'Autorización Devoluciones' },
          ]
        }
      },

      {
        path: 'autorizacion-ordenfabricacion', component: AutorizacionOrdenfabricacionComponent, data: {
          title: 'Autorización Orden Fabricación',
          urls: [
            { title: 'Autorización' },
            { title: 'Autorización Orden Fabricación' },
          ]
        }
      },
      {
        path: 'autorizacion-pedidos', component: AutorizacionPedidosComponent, data: {
          title: 'Autorización Pedidos',
          urls: [
            { title: 'Autorización' },
            { title: 'Autorización Pedidos' },
          ]
        }
      },

    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AutorizacionRoutingModule { }









