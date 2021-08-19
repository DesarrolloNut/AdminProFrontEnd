import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from 'src/app/core/guards/auth.guard';
import { BlankComponent } from 'src/app/core/layouts/blank/blank.component';


const routes: Routes = [

  {
    path: '',
    component: BlankComponent,
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    children: [
      {
        path: 'produccion', loadChildren: () => import('../impresion/impresion-produccion/impresion-produccion.module').then(m => m.ImpresionProduccionModule)
      },
    ],
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ImpresionRoutingModule { }
