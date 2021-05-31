import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProduccionRoutingModule } from './produccion-routing.module';
import { ProduccionComponent } from './produccion.component';
import { SharedModule } from '../shared/shared.module';
import { PesajeFormularioComponent } from './pesaje/pesaje-formulario/pesaje-formulario.component';
import { PesajeListadoComponent } from './pesaje/pesaje-listado/pesaje-listado.component';


@NgModule({
  declarations: [ProduccionComponent,PesajeFormularioComponent,PesajeListadoComponent],
  imports: [
    CommonModule,
    SharedModule,
    ProduccionRoutingModule
  ]
})
export class ProduccionModule { }
