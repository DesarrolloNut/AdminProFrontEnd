import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ComprasRoutingModule } from './compras-routing.module';
import { ComprasComponent } from './compras.component';
import { SolicitudComprasListadoComponent } from './solicitud-compras/solicitud-compras-listado/solicitud-compras-listado.component';
import { SolicitudComprasFormularioComponent } from './solicitud-compras/solicitud-compras-formulario/solicitud-compras-formulario.component';
import { SharedModule } from '../shared/shared.module';
import { SolicitudComprasAutorizacionComponent } from './solicitud-compras/solicitud-compras-autorizacion/solicitud-compras-autorizacion.component';


@NgModule({
  declarations: [ComprasComponent, SolicitudComprasListadoComponent, SolicitudComprasFormularioComponent, SolicitudComprasAutorizacionComponent],
  imports: [
    CommonModule,
    SharedModule,
    ComprasRoutingModule,
  ]
})
export class ComprasModule { }
