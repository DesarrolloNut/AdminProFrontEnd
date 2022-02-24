import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ComprasRoutingModule } from './compras-routing.module';
import { ComprasComponent } from './compras.component';
import { SolicitudComprasListadoComponent } from './solicitud-compras/solicitud-compras-listado/solicitud-compras-listado.component';
import { SolicitudComprasFormularioComponent } from './solicitud-compras/solicitud-compras-formulario/solicitud-compras-formulario.component';
import { SharedModule } from '../shared/shared.module';
import { SolicitudComprasAutorizacionComponent } from './solicitud-compras/solicitud-compras-autorizacion/solicitud-compras-autorizacion.component';
import { OrdenComprasFormularioComponent } from './orden-compras/orden-compras-formulario/orden-compras-formulario.component';
import { OrdenComprasListadoComponent } from './orden-compras/orden-compras-listado/orden-compras-listado.component';


@NgModule({
  declarations: [ComprasComponent, SolicitudComprasListadoComponent, SolicitudComprasFormularioComponent, SolicitudComprasAutorizacionComponent, OrdenComprasFormularioComponent, OrdenComprasListadoComponent],
  imports: [
    CommonModule,
    SharedModule,
    ComprasRoutingModule,
  ]
})
export class ComprasModule { }
