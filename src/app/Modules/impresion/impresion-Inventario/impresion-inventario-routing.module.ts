import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PrintDPreventaDetallesComponent } from './despacho/despacho-preventa-detalles/print-d-preventa-detalles.component';


const routes: Routes = [
  {
    path: 'print-d-preventa-detalles', component: PrintDPreventaDetallesComponent, data: {
      title: 'Print Despacho Detalles',
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
export class ImpresionInventarioRoutingModule { }
