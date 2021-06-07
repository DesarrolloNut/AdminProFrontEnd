import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProduccionRoutingModule } from './produccion-routing.module';
import { ProduccionComponent } from './produccion.component';
import { SharedModule } from '../shared/shared.module';
import { PesajeFormularioComponent } from './pesaje/pesaje-formulario/pesaje-formulario.component';
import { PesajeListadoComponent } from './pesaje/pesaje-listado/pesaje-listado.component';
import { PesajeResultadoComponent } from './pesaje/pesaje-resultado/pesaje-resultado.component';
import { NgxBarcodeModule } from 'ngx-barcode';


@NgModule({
  declarations: [ProduccionComponent,PesajeFormularioComponent,PesajeListadoComponent, PesajeResultadoComponent],
  imports: [
    CommonModule,
    SharedModule,
    ProduccionRoutingModule,
    NgxBarcodeModule,
  ]
})
export class ProduccionModule { }
