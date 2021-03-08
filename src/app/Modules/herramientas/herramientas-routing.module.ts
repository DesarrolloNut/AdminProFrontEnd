import { NgModule } from '@angular/core';
import { Routes, RouterModule, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { HerramientasComponent } from './herramientas.component';
import { MinutaComponent } from './Minutas/minuta/minuta.component';
import { MinutasFormComponent } from './Minutas/minutas-form/minutas-form.component';

const routes: Routes = [{
  path: '', component: HerramientasComponent,
  children: [
    {
      path: 'minutas', data: {
        title: 'ViaCloud | Minutas',
        urls: [
          { title: 'Herramientas' },
          { title: 'Minutas' }
        ]
      },
      component: MinutaComponent
    },
    {
      path: 'minutas/:id', data: {
        title: 'ViaCloud | Minutas',
        urls: [
          { title: 'Herramientas' },
          { title: 'Minutas' }
        ]
      },
      component: MinutasFormComponent
    },
    {
      path: 'oasisFord',
      resolve: {
        url: 'externalUrlRedirectResolver'
      },
      data: {
        externalUrl: 'https://www.fordtechservice.dealerconnection.com'
      }
    }
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [
    {
      provide: 'externalUrlRedirectResolver',
      useValue: (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
        // window.location.href = (route.data as any).externalUrl;
        window.open((route.data as any).externalUrl, "_blank");
      }
    }
  ]
})
export class HerramientasRoutingModule { }
