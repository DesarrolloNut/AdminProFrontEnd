import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FullComponent } from './core/layouts/full/full.component';
import { LoginComponent } from './Modules/login/login.component';
import { AuthGuard } from './core/guards/auth.guard';
import { BlankComponent } from './core/layouts/blank/blank.component';
import { HoraPickingListadoComponent } from './Modules/mantenimientos/horaPicking/hora-picking-listado/hora-picking-listado.component';
import { HoraPickingFormularioComponent } from './Modules/mantenimientos/horaPicking/hora-picking-formulario/hora-picking-formulario.component';
import { TransferenciaFormularioComponent } from './Modules/inventario/transferencia/transferencia-formulario/transferencia-formulario.component';

export const Approutes: Routes = [
  {
    path: 'login',
    data: {
      title: 'Nutriciosa | Login',
    },
    component: LoginComponent
  },
 //{path: 'transferencia',component: TransferenciaFormularioComponent},
  /*{path: 'formulario-hora',component: HoraPickingFormularioComponent},
  { path: 'formulario-hora-picking/:id', component: HoraPickingFormularioComponent},*/
  
 
  {
    path: '',
    component: FullComponent,
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      {
        path: 'home', loadChildren: () => import('./Modules/home/home.module').then(m => m.HomeModule),
      },
      {
        path: 'servicios', loadChildren: () => import('./Modules/servicios/servicios.module').then(m => m.ServiciosModule)
      },
      {
        path: 'herramientas', loadChildren: () => import('./Modules/herramientas/herramientas.module').then(m => m.HerramientasModule)
      },
      {
        path: 'mantenimientos', loadChildren: () => import('./Modules/mantenimientos/mantenimientos.module').then(m => m.MantenimientosModule)
      },
      { path: 'configuraciones', loadChildren: () => import('./Modules/configuraciones/configuraciones.module').then(m => m.ConfiguracionesModule) },

      { path: 'ventas', loadChildren: () => import('./Modules/ventas/ventas.module').then(m => m.VentasModule) },

      { path: 'compras', loadChildren: () => import('./Modules/compras/compras.module').then(m => m.ComprasModule) },

      { path: 'finanzas', loadChildren: () => import('./Modules/finanzas/finanzas.module').then(m => m.FinanzasModule) },

      { path: 'produccion', loadChildren: () => import('./Modules/produccion/produccion.module').then(m => m.ProduccionModule) },

      { path: 'inventario', loadChildren: () => import('./Modules/inventario/inventario.module').then(m => m.InventarioModule) },

      { path: 'reportes/inventario', loadChildren: () => import('./Modules/reportes/reportes-inventario/reportes-inventario.module').then(m => m.ReportesInventarioModule) },

      { path: 'autorizacion', loadChildren: () => import('./Modules/autorizacion/autorizacion.module').then(m => m.AutorizacionModule) },
    ],
  },

  {
    path: 'turno',
    component: BlankComponent,
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    children: [
      {
        path: '', loadChildren: () => import('./Modules/turno/turno.module').then(m => m.TurnoModule)
      },
    ],
  },


  {
    path: 'consultas',
    component: BlankComponent,
    // canActivate: [AuthGuard],
    // canActivateChild: [AuthGuard],
    children: [
      {
        path: '', loadChildren: () => import('./Modules/consulta-cliente/consulta-cliente.module').then(m => m.ConsultaClienteModule)
      },
    ],
  },

  {
    path: 'impresion',
    component: BlankComponent,
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    children: [
      {
        path: '', loadChildren: () => import('./Modules/impresion/impresion.module').then(m => m.ImpresionModule)
      },
    ],
  },






  {
    path: 'error',
    component: BlankComponent,
    // canActivate: [AuthGuard],
    // canActivateChild: [AuthGuard],
    children: [
      {
        path: '', loadChildren: () => import('./Modules/error/error.module').then(m => m.ErrorModule)
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'error/404'
  },

];
@NgModule({
  imports: [RouterModule.forRoot(Approutes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
